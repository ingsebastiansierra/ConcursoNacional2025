// Script para crear 30 usuarios de prueba con datos realistas
// Uso: node src/scripts/create30TestUsers.js
// Crea 30 usuarios con nombres realistas y les da likes aleatorios a pilotos
// Solo para pruebas de carga y testeo, no usar en producción

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs, doc, setDoc, updateDoc, increment, addDoc } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBzh0LvArSvGWUdMMZjD5xESqsxkFmrUnQ",
  authDomain: "tractomulas2025.firebaseapp.com",
  projectId: "tractomulas2025",
  storageBucket: "tractomulas2025.appspot.com",
  messagingSenderId: "944693735621",
  appId: "1:944693735621:web:a7603c0434cfe76ea1c0ac",
  measurementId: "G-9QW24GJY9M"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const NUM_USERS = 30;
const MAX_VOTES = 10;
const PASSWORD = 'test123456';

// Nombres realistas para los usuarios de prueba
const NAMES = [
  'Carlos Mendoza', 'Ana García', 'Luis Rodríguez', 'María López', 'Juan Pérez',
  'Carmen Torres', 'Roberto Silva', 'Patricia Vargas', 'Fernando Castro', 'Isabel Morales',
  'Diego Herrera', 'Sofia Jiménez', 'Miguel Ruiz', 'Valentina Soto', 'Andrés Moreno',
  'Camila Rojas', 'Ricardo Paredes', 'Daniela Vega', 'Alejandro Fuentes', 'Natalia Reyes',
  'Gabriel Medina', 'Laura Castillo', 'Sebastián Ortiz', 'Carolina Guzmán', 'Felipe Navarro',
  'Adriana Salazar', 'Cristian Acosta', 'Monica Rios', 'Hector Mendez', 'Paula Cordoba'
];

async function getDrivers() {
  const driversCol = collection(db, 'drivers');
  const driversSnapshot = await getDocs(driversCol);
  return driversSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function createTestUser(index) {
  const email = `testuser${index}@demo.com`;
  const name = NAMES[index - 1] || `Usuario Test ${index}`;
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, PASSWORD);
    const uid = userCredential.user.uid;
    
    await setDoc(doc(db, 'users', uid), {
      name,
      email,
      role: 'user',
      createdAt: new Date().toISOString(),
    });
    
    await setDoc(doc(db, 'userVotes', uid), { votesUsed: 0 });
    console.log(`✅ Usuario creado: ${name} (${email})`);
    return { uid, name, email };
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠️  Usuario ya existe: ${email}`);
      // Buscar UID existente
      const usersCol = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCol);
      const userDoc = usersSnapshot.docs.find(doc => doc.data().email === email);
      if (userDoc) {
        return { uid: userDoc.id, name, email };
      }
    } else {
      console.error(`❌ Error creando usuario ${email}:`, error.message);
    }
    return null;
  }
}

async function giveRandomLikesToUser(user, drivers) {
  // Seleccionar aleatoriamente entre 3 y MAX_VOTES conductores distintos
  const numVotes = Math.floor(Math.random() * (MAX_VOTES - 2)) + 3; // Entre 3 y 10 votos
  const shuffled = drivers.sort(() => 0.5 - Math.random());
  const selectedDrivers = shuffled.slice(0, Math.min(numVotes, drivers.length));
  
  console.log(`🎯 ${user.name} votará por ${selectedDrivers.length} pilotos`);
  
  for (const driver of selectedDrivers) {
    try {
      // Sumar like al piloto
      await updateDoc(doc(db, 'drivers', driver.id), { 
        NumeroLikes: increment(1) 
      });
      
      // Sumar voto al usuario
      await updateDoc(doc(db, 'userVotes', user.uid), { 
        votesUsed: increment(1) 
      });
      
      // Guardar like en subcolección
      const likesCol = collection(db, 'drivers', driver.id, 'likes');
      await addDoc(likesCol, {
        userId: user.uid,
        userName: user.name,
        likedAt: new Date().toISOString(),
      });
      
      console.log(`  👍 Voto para: ${driver.conductor || driver.id}`);
    } catch (error) {
      console.error(`  ❌ Error dando like:`, error.message);
    }
  }
}

async function showStatistics() {
  console.log('\n📊 Estadísticas del testeo:');
  
  // Contar usuarios
  const usersCol = collection(db, 'users');
  const usersSnapshot = await getDocs(usersCol);
  const totalUsers = usersSnapshot.size;
  
  // Contar votos totales
  const userVotesCol = collection(db, 'userVotes');
  const userVotesSnapshot = await getDocs(userVotesCol);
  let totalVotes = 0;
  userVotesSnapshot.docs.forEach(doc => {
    totalVotes += doc.data().votesUsed || 0;
  });
  
  // Obtener pilotos con más votos
  const drivers = await getDrivers();
  const topDrivers = drivers
    .sort((a, b) => (b.NumeroLikes || 0) - (a.NumeroLikes || 0))
    .slice(0, 5);
  
  console.log(`👥 Total de usuarios: ${totalUsers}`);
  console.log(`🗳️  Total de votos emitidos: ${totalVotes}`);
  console.log(`🏆 Top 5 pilotos:`);
  topDrivers.forEach((driver, index) => {
    console.log(`  ${index + 1}. ${driver.conductor || driver.id}: ${driver.NumeroLikes || 0} votos`);
  });
}

async function main() {
  console.log('🚀 Iniciando creación de 30 usuarios de prueba...');
  console.log('⏰ Inicio:', new Date().toLocaleString());
  
  const drivers = await getDrivers();
  if (drivers.length === 0) {
    console.error('❌ No hay conductores en la base de datos.');
    return;
  }
  
  console.log(`📋 Encontrados ${drivers.length} pilotos disponibles`);
  
  let createdUsers = 0;
  let failedUsers = 0;
  
  for (let i = 1; i <= NUM_USERS; i++) {
    console.log(`\n🔄 Procesando usuario ${i}/${NUM_USERS}...`);
    const user = await createTestUser(i);
    if (user) {
      await giveRandomLikesToUser(user, drivers);
      createdUsers++;
    } else {
      failedUsers++;
    }
    
    // Pequeña pausa para no sobrecargar Firebase
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n🎉 Proceso completado!');
  console.log(`✅ Usuarios creados: ${createdUsers}`);
  console.log(`❌ Usuarios fallidos: ${failedUsers}`);
  console.log('⏰ Fin:', new Date().toLocaleString());
  
  await showStatistics();
}

main().catch(console.error); 