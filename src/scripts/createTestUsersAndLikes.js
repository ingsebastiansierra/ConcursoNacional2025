// Script para crear usuarios de prueba y asignar likes aleatorios a conductores
// Uso: node src/scripts/createTestUsersAndLikes.js
// Crea 100 usuarios testuserX@demo.com y les da likes aleatorios a pilotos
// Solo para pruebas de carga y testeo, no usar en producción
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs, doc, setDoc, updateDoc, increment, addDoc } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyAHGIYFFwbp3HLT02WbIJ7pA_0k5RYVCow',
  authDomain: 'concurso2025-2c887.firebaseapp.com',
  projectId: 'concurso2025-2c887',
  storageBucket: 'concurso2025-2c887.firebasestorage.app',
  messagingSenderId: '829384550005',
  appId: '1:829384550005:web:e2c1ecac6487a21ba6fa3c',
  measurementId: 'G-F22YYC2RB6',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const NUM_USERS = 100;
const MAX_VOTES = 10;
const PASSWORD = 'test123456';

async function getDrivers() {
  const driversCol = collection(db, 'drivers');
  const driversSnapshot = await getDocs(driversCol);
  return driversSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function createTestUser(index) {
  const email = `testuser${index}@demo.com`;
  const name = `Usuario Test ${index}`;
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
    console.log(`✅ Usuario creado: ${email}`);
    return { uid, name };
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠️  Usuario ya existe: ${email}`);
      // Buscar UID existente
      const usersCol = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCol);
      const userDoc = usersSnapshot.docs.find(doc => doc.data().email === email);
      if (userDoc) {
        return { uid: userDoc.id, name };
      }
    } else {
      console.error(`❌ Error creando usuario ${email}:`, error.message);
    }
    return null;
  }
}

async function giveRandomLikesToUser(user, drivers) {
  // Seleccionar aleatoriamente hasta MAX_VOTES conductores distintos
  const shuffled = drivers.sort(() => 0.5 - Math.random());
  const selectedDrivers = shuffled.slice(0, Math.min(MAX_VOTES, drivers.length));
  for (const driver of selectedDrivers) {
    // Sumar like al piloto
    await updateDoc(doc(db, 'drivers', driver.id), { NumeroLikes: increment(1) });
    // Sumar voto al usuario
    await updateDoc(doc(db, 'userVotes', user.uid), { votesUsed: increment(1) });
    // Guardar like en subcolección
    const likesCol = collection(db, 'drivers', driver.id, 'likes');
    await addDoc(likesCol, {
      userId: user.uid,
      userName: user.name,
      likedAt: new Date().toISOString(),
    });
    console.log(`👍 Like de ${user.name} para piloto ${driver.conductor || driver.id}`);
  }
}

async function main() {
  console.log('🚀 Iniciando creación de usuarios de test y likes aleatorios...');
  const drivers = await getDrivers();
  if (drivers.length === 0) {
    console.error('❌ No hay conductores en la base de datos.');
    return;
  }
  for (let i = 1; i <= NUM_USERS; i++) {
    const user = await createTestUser(i);
    if (user) {
      await giveRandomLikesToUser(user, drivers);
    }
  }
  console.log('🎉 Proceso completado.');
}

main(); 