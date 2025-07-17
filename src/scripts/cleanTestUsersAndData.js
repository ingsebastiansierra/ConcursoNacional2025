// Script para limpiar usuarios y datos de testeo
// Uso: node src/scripts/cleanTestUsersAndData.js
// Elimina usuarios testuserX@demo.com, sus votos y likes de la base de datos
// Solo para pruebas de carga y testeo, no usar en producción
const { initializeApp } = require('firebase/app');
const { getAuth, deleteUser, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc, increment } = require('firebase/firestore');

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
const PASSWORD = 'test123456';

async function deleteTestUsers() {
  const usersCol = collection(db, 'users');
  const usersSnapshot = await getDocs(usersCol);
  let deleted = 0;
  for (let i = 1; i <= NUM_USERS; i++) {
    const email = `testuser${i}@demo.com`;
    const userDoc = usersSnapshot.docs.find(doc => doc.data().email === email);
    if (userDoc) {
      const uid = userDoc.id;
      // Eliminar de Firestore
      await deleteDoc(doc(db, 'users', uid));
      await deleteDoc(doc(db, 'userVotes', uid));
      // Eliminar de Authentication (requiere signIn)
      try {
        await signInWithEmailAndPassword(auth, email, PASSWORD);
        if (auth.currentUser) {
          await deleteUser(auth.currentUser);
          console.log(`🗑️ Usuario eliminado de Auth: ${email}`);
        }
      } catch (err) {
        console.log(`⚠️  No se pudo eliminar de Auth (quizá ya no existe): ${email}`);
      }
      deleted++;
    }
  }
  console.log(`✅ Usuarios de test eliminados: ${deleted}`);
}

async function cleanLikesAndVotes() {
  // Limpiar likes de los pilotos
  const driversCol = collection(db, 'drivers');
  const driversSnapshot = await getDocs(driversCol);
  for (const driverDoc of driversSnapshot.docs) {
    const driverId = driverDoc.id;
    const likesCol = collection(db, 'drivers', driverId, 'likes');
    const likesSnapshot = await getDocs(likesCol);
    for (const likeDoc of likesSnapshot.docs) {
      const like = likeDoc.data();
      if (like.userId && like.userName && like.userName.startsWith('Usuario Test')) {
        await deleteDoc(doc(db, 'drivers', driverId, 'likes', likeDoc.id));
        // Restar el like al piloto
        await updateDoc(doc(db, 'drivers', driverId), { NumeroLikes: increment(-1) });
        console.log(`🗑️ Like eliminado de piloto ${driverId} por usuario de test ${like.userName}`);
      }
    }
  }
  console.log('✅ Likes de usuarios de test eliminados.');
}

async function main() {
  console.log('🚀 Iniciando limpieza de usuarios y datos de test...');
  await deleteTestUsers();
  await cleanLikesAndVotes();
  console.log('🎉 Limpieza completada.');
}

main(); 