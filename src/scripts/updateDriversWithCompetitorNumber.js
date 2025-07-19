const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

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

async function updateDriversWithCompetitorNumber() {
  try {
    console.log('🔄 Iniciando actualización de pilotos con número de competidor...');
    console.log('⏰ Inicio:', new Date().toLocaleString());
    
    // Obtener todos los pilotos
    const driversSnapshot = await getDocs(collection(db, 'drivers'));
    
    if (driversSnapshot.empty) {
      console.log('✅ No hay pilotos para actualizar');
      return;
    }
    
    console.log(`📋 Encontrados ${driversSnapshot.size} pilotos para actualizar`);
    
    let updatedCount = 0;
    
    for (let i = 0; i < driversSnapshot.docs.length; i++) {
      const driverDoc = driversSnapshot.docs[i];
      const driverData = driverDoc.data();
      
      console.log(`📝 Actualizando piloto ${i + 1}/${driversSnapshot.size}: ${driverData.conductor}`);
      console.log(`   - numeroCompetidor actual: ${driverData.numeroCompetidor}`);
      console.log(`   - placa: ${driverData.placa}`);
      console.log(`   - imagen: ${driverData.imagen ? 'Sí' : 'No'}`);
      
      // Actualizar con número de competidor si no existe
      const updates = {};
      if (!driverData.numeroCompetidor) {
        updates.numeroCompetidor = i + 1;
        console.log(`   ✅ Agregando numeroCompetidor: ${i + 1}`);
      }
      
      // Asegurar que tenga el campo NumeroLikes
      if (driverData.NumeroLikes === undefined) {
        updates.NumeroLikes = 0;
        console.log(`   ✅ Agregando NumeroLikes: 0`);
      }
      
      // Asegurar que tenga el campo imagen (si no existe, usar imageUrl)
      if (!driverData.imagen && driverData.imageUrl) {
        updates.imagen = driverData.imageUrl;
        console.log(`   ✅ Moviendo imageUrl a imagen`);
      }
      
      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, 'drivers', driverDoc.id), updates);
        updatedCount++;
        console.log(`   ✅ Piloto actualizado`);
      } else {
        console.log(`   ℹ️ Piloto ya tiene todos los campos necesarios`);
      }
    }
    
    console.log('\n🎉 ¡Actualización completada!');
    console.log(`📊 Resumen:`);
    console.log(`   👥 Pilotos procesados: ${driversSnapshot.size}`);
    console.log(`   🔄 Pilotos actualizados: ${updatedCount}`);
    console.log('⏰ Fin:', new Date().toLocaleString());
    
  } catch (error) {
    console.error('❌ Error actualizando pilotos:', error);
  } finally {
    process.exit(0);
  }
}

updateDriversWithCompetitorNumber(); 