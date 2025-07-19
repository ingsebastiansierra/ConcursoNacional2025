// Script para limpiar datos de prueba
// Uso: node src/scripts/cleanTestData.js
// Elimina usuarios de prueba y resetea votos de pilotos
// Solo para pruebas, no usar en producción

const { initializeApp } = require('firebase/app');
const { getAuth, deleteUser } = require('firebase/auth');
const { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc, writeBatch } = require('firebase/firestore');

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

async function cleanTestUsers() {
  console.log('🧹 Limpiando usuarios de prueba...');
  
  const usersCol = collection(db, 'users');
  const usersSnapshot = await getDocs(usersCol);
  let deletedUsers = 0;
  
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    if (userData.email && userData.email.includes('testuser') && userData.email.includes('@demo.com')) {
      try {
        // Eliminar documento de usuario
        await deleteDoc(doc(db, 'users', userDoc.id));
        
        // Eliminar documento de votos del usuario
        await deleteDoc(doc(db, 'userVotes', userDoc.id));
        
        console.log(`🗑️  Usuario eliminado: ${userData.email}`);
        deletedUsers++;
      } catch (error) {
        console.error(`❌ Error eliminando usuario ${userData.email}:`, error.message);
      }
    }
  }
  
  console.log(`✅ ${deletedUsers} usuarios de prueba eliminados`);
  return deletedUsers;
}

async function resetDriverVotes() {
  console.log('🔄 Reseteando votos de pilotos...');
  
  const driversCol = collection(db, 'drivers');
  const driversSnapshot = await getDocs(driversCol);
  let resetDrivers = 0;
  
  for (const driverDoc of driversSnapshot.docs) {
    try {
      // Resetear votos del piloto
      await updateDoc(doc(db, 'drivers', driverDoc.id), { 
        NumeroLikes: 0 
      });
      
      // Eliminar likes de la subcolección
      const likesCol = collection(db, 'drivers', driverDoc.id, 'likes');
      const likesSnapshot = await getDocs(likesCol);
      
      const batch = writeBatch(db);
      likesSnapshot.docs.forEach(likeDoc => {
        batch.delete(doc(db, 'drivers', driverDoc.id, 'likes', likeDoc.id));
      });
      await batch.commit();
      
      console.log(`🔄 Piloto reseteado: ${driverDoc.data().conductor || driverDoc.id}`);
      resetDrivers++;
    } catch (error) {
      console.error(`❌ Error reseteando piloto ${driverDoc.id}:`, error.message);
    }
  }
  
  console.log(`✅ ${resetDrivers} pilotos reseteados`);
  return resetDrivers;
}

async function showFinalStats() {
  console.log('\n📊 Estadísticas finales:');
  
  // Contar usuarios restantes
  const usersCol = collection(db, 'users');
  const usersSnapshot = await getDocs(usersCol);
  const totalUsers = usersSnapshot.size;
  
  // Contar votos restantes
  const userVotesCol = collection(db, 'userVotes');
  const userVotesSnapshot = await getDocs(userVotesCol);
  let totalVotes = 0;
  userVotesSnapshot.docs.forEach(doc => {
    totalVotes += doc.data().votesUsed || 0;
  });
  
  // Obtener pilotos
  const driversCol = collection(db, 'drivers');
  const driversSnapshot = await getDocs(driversCol);
  const totalDrivers = driversSnapshot.size;
  
  console.log(`👥 Usuarios restantes: ${totalUsers}`);
  console.log(`🗳️  Votos restantes: ${totalVotes}`);
  console.log(`🚛 Pilotos: ${totalDrivers}`);
}

async function main() {
  console.log('🚀 Iniciando limpieza de datos de prueba...');
  console.log('⏰ Inicio:', new Date().toLocaleString());
  
  const deletedUsers = await cleanTestUsers();
  const resetDrivers = await resetDriverVotes();
  
  console.log('\n🎉 Limpieza completada!');
  console.log(`🗑️  Usuarios eliminados: ${deletedUsers}`);
  console.log(`🔄 Pilotos reseteados: ${resetDrivers}`);
  console.log('⏰ Fin:', new Date().toLocaleString());
  
  await showFinalStats();
}

main().catch(console.error); 