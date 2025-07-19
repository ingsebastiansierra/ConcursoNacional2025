// Script para testeo completo con 100 usuarios y 40 pilotos
// Uso: node src/scripts/testWith100Users.js
// Crea 100 usuarios de prueba y les da votos aleatorios a los 40 pilotos

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

const NUM_USERS = 100; // 100 usuarios de prueba
const MAX_VOTES = 10;
const PASSWORD = 'test123456';

// Nombres realistas para usuarios de prueba
const USER_NAMES = [
  'Ana García', 'María López', 'Carmen Torres', 'Patricia Vargas', 'Isabel Morales',
  'Sofia Jiménez', 'Valentina Soto', 'Camila Rojas', 'Daniela Vega', 'Natalia Reyes',
  'Laura Castillo', 'Carolina Guzmán', 'Adriana Salazar', 'Monica Rios', 'Paula Cordoba',
  'Elena Mendoza', 'Rosa Silva', 'Lucía Castro', 'Claudia Paredes', 'Verónica Fuentes',
  'Gabriela Torres', 'Silvia Vargas', 'Mónica Morales', 'Beatriz Rojas', 'Carmen Soto',
  'Teresa Castillo', 'Angélica Guzmán', 'Diana Salazar', 'Lorena Rios', 'Patricia Cordoba',
  'Mariana Mendoza', 'Alejandra Silva', 'Cristina Castro', 'Fernanda Paredes', 'Valeria Fuentes',
  'Daniela Torres', 'Stephanie Vargas', 'Melissa Morales', 'Brenda Rojas', 'Karla Soto',
  'Vanessa Castillo', 'Michelle Guzmán', 'Andrea Salazar', 'Natalia Rios', 'Paola Cordoba',
  'Diana Mendoza', 'Sofia Silva', 'Valentina Castro', 'Camila Paredes', 'Isabella Fuentes',
  'Mariana Torres', 'Gabriela Vargas', 'Daniela Morales', 'Stephanie Rojas', 'Melissa Soto',
  'Carlos Mendoza', 'Luis Rodríguez', 'Juan Pérez', 'Miguel Ruiz', 'Diego Herrera',
  'Andrés Moreno', 'Gabriel Medina', 'Sebastián Ortiz', 'Felipe Navarro', 'Cristian Acosta',
  'Hector Mendez', 'Roberto Silva', 'Fernando Castro', 'Ricardo Paredes', 'Alejandro Fuentes',
  'Jorge Torres', 'Manuel Vargas', 'Pedro Morales', 'Alberto Rojas', 'Francisco Soto',
  'Daniel Vega', 'Mario Castillo', 'Eduardo Guzmán', 'Rafael Salazar', 'Antonio Cordoba',
  'Santiago Herrera', 'Nicolás Jiménez', 'Adrián López', 'Marcelo Torres', 'Gustavo Silva',
  'Pablo Mendoza', 'Leonardo Ruiz', 'Rodrigo Castro', 'Federico Morales', 'Emilio Vargas',
  'Ignacio Rojas', 'Matías Soto', 'Tomás Castillo', 'Bruno Guzmán', 'Lucas Salazar',
  'Agustín Cordoba', 'Valentín Herrera', 'Maximiliano Jiménez', 'Thiago López', 'Bautista Torres',
  'Santino Silva', 'Mateo Mendoza', 'Benjamín Ruiz', 'Dante Castro', 'Lorenzo Morales',
  'Joaquín Vargas', 'Rafael Rojas', 'Santiago Soto', 'Nicolás Castillo', 'Adrián Guzmán',
  'Marcelo Salazar', 'Antonio Cordoba', 'Ignacio Herrera', 'Matías Jiménez', 'Tomás López',
  'Bruno Torres', 'Lucas Silva', 'Agustín Mendoza', 'Valentín Ruiz', 'Maximiliano Castro',
  'Thiago Morales', 'Bautista Vargas', 'Santino Rojas', 'Mateo Soto', 'Benjamín Castillo'
];

async function getDrivers() {
  const driversCol = collection(db, 'drivers');
  const driversSnapshot = await getDocs(driversCol);
  return driversSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function createTestUser(index) {
  const email = `testuser${index}@demo.com`;
  const name = USER_NAMES[index - 1] || `Usuario Test ${index}`;
  
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
  // Seleccionar aleatoriamente entre 5 y MAX_VOTES conductores distintos
  const numVotes = Math.floor(Math.random() * (MAX_VOTES - 4)) + 5; // Entre 5 y 10 votos
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
      
      console.log(`  👍 Voto para: ${driver.conductor} (${driver.placa})`);
    } catch (error) {
      console.error(`  ❌ Error dando like:`, error.message);
    }
  }
}

async function showTestStatistics() {
  console.log('\n📊 Estadísticas del testeo con 100 usuarios:');
  
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
    .slice(0, 15);
  
  console.log(`👥 Total de usuarios: ${totalUsers}`);
  console.log(`🗳️  Total de votos emitidos: ${totalVotes}`);
  console.log(`🚛 Total de pilotos: ${drivers.length}`);
  console.log(`🏆 Top 15 pilotos:`);
  topDrivers.forEach((driver, index) => {
    console.log(`  ${index + 1}. ${driver.conductor} (${driver.placa}): ${driver.NumeroLikes || 0} votos`);
  });
  
  // Estadísticas adicionales
  const averageVotes = drivers.reduce((sum, driver) => sum + (driver.NumeroLikes || 0), 0) / drivers.length;
  const maxVotes = Math.max(...drivers.map(d => d.NumeroLikes || 0));
  const minVotes = Math.min(...drivers.map(d => d.NumeroLikes || 0));
  
  console.log(`📈 Promedio de votos por piloto: ${averageVotes.toFixed(2)}`);
  console.log(`🔥 Máximo votos: ${maxVotes}`);
  console.log(`❄️  Mínimo votos: ${minVotes}`);
  console.log(`🎯 Votos promedio por usuario: ${(totalVotes / totalUsers).toFixed(2)}`);
}

async function main() {
  console.log('🚀 Iniciando testeo completo con 100 usuarios...');
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
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n🎉 Testeo completado!');
  console.log(`✅ Usuarios creados: ${createdUsers}`);
  console.log(`❌ Usuarios fallidos: ${failedUsers}`);
  console.log('⏰ Fin:', new Date().toLocaleString());
  
  await showTestStatistics();
}

main().catch(console.error); 