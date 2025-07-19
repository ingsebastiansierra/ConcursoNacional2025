const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, deleteDoc, writeBatch } = require('firebase/firestore');

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
const db = getFirestore(app);

async function deleteAllDrivers() {
  try {
    console.log('🗑️ Iniciando eliminación de todos los pilotos...');
    
    // Obtener todos los pilotos
    const driversSnapshot = await getDocs(collection(db, 'drivers'));
    
    if (driversSnapshot.empty) {
      console.log('✅ No hay pilotos para eliminar');
      return;
    }
    
    console.log(`📋 Encontrados ${driversSnapshot.size} pilotos para eliminar`);
    
    // Eliminar todos los pilotos
    const batch = writeBatch(db);
    driversSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('✅ Todos los pilotos eliminados exitosamente');
    
    // También eliminar todos los likes
    const likesSnapshot = await getDocs(collection(db, 'likes'));
    
    if (!likesSnapshot.empty) {
      const likesBatch = writeBatch(db);
      likesSnapshot.docs.forEach(doc => {
        likesBatch.delete(doc.ref);
      });
      
      await likesBatch.commit();
      console.log('✅ Todos los likes eliminados exitosamente');
    }
    
    console.log('🎉 Limpieza completada');
    
  } catch (error) {
    console.error('❌ Error eliminando pilotos:', error);
  } finally {
    process.exit(0);
  }
}

deleteAllDrivers(); 