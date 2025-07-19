// Script para alternar imágenes de pilotos en Firestore
// Uso: node src/scripts/updateDriversImages.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

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

const img1 = 'https://drive.google.com/uc?export=view&id=10KkXi7vf8ohnv3rmuTakPX4hHq_2JyeL';
const img2 = 'https://drive.google.com/uc?export=view&id=1Q5RowofA571mrNuiXXlWF3cA16xEvfnb';

async function updateDriversImages() {
  const driversCol = collection(db, 'drivers');
  const driversSnapshot = await getDocs(driversCol);
  let count = 0;
  for (const driverDoc of driversSnapshot.docs) {
    const data = driverDoc.data();
    const numeroCompetidor = data.numeroCompetidor || 0;
    const imageUrl = numeroCompetidor % 2 === 0 ? img2 : img1;
    await updateDoc(doc(db, 'drivers', driverDoc.id), { imageUrl });
    console.log(`✅ Piloto ${driverDoc.id} actualizado con imagen ${imageUrl === img1 ? '1' : '2'}`);
    count++;
  }
  console.log(`🎉 Imágenes actualizadas para ${count} pilotos.`);
}

updateDriversImages(); 