const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, deleteDoc, writeBatch } = require('firebase/firestore');

// Configuración de Firebase (la misma que usa la app)
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
const db = getFirestore(app);

async function deleteAllDrivers() {
  try {
    console.log('🗑️ Iniciando eliminación de todos los pilotos...');
    console.log('⏰ Inicio:', new Date().toLocaleString());
    
    // Obtener todos los pilotos
    const driversSnapshot = await getDocs(collection(db, 'drivers'));
    
    if (driversSnapshot.empty) {
      console.log('✅ No hay pilotos para eliminar');
      return;
    }
    
    console.log(`📋 Encontrados ${driversSnapshot.size} pilotos para eliminar`);
    
    // Eliminar todos los pilotos uno por uno
    let deletedCount = 0;
    for (const driverDoc of driversSnapshot.docs) {
      try {
        await deleteDoc(driverDoc.ref);
        deletedCount++;
        console.log(`✅ Eliminado piloto ${deletedCount}/${driversSnapshot.size}: ${driverDoc.data().conductor || driverDoc.id}`);
      } catch (error) {
        console.error(`❌ Error eliminando piloto ${driverDoc.id}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Eliminación completada! ${deletedCount} pilotos eliminados`);
    console.log('⏰ Fin:', new Date().toLocaleString());
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    process.exit(0);
  }
}

deleteAllDrivers(); 