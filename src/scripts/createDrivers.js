// Script para crear 40 conductores de ejemplo en Firestore
// Uso: node src/scripts/createDrivers.js

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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

const placeholderImg = 'https://via.placeholder.com/150';

const drivers = Array.from({ length: 40 }, (_, i) => {
  const num = i + 1;
  return {
    id: `driver${num}`,
    conductor: `Piloto ${num}`,
    placa: `ABC${String(num).padStart(3, '0')}`,
    img: placeholderImg,
    NumeroLikes: 0,
    numeroCompetidor: num
  };
});

async function createDrivers() {
  for (const driver of drivers) {
    await setDoc(doc(db, 'drivers', driver.id), driver);
    console.log(`✅ Piloto creado: ${driver.conductor} (Competidor #${driver.numeroCompetidor})`);
  }
  console.log('🎉 Los 40 pilotos han sido creados.');
}

createDrivers(); 