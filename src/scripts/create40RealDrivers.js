// Script para crear 40 conductores con nombres reales y placas realistas
// Uso: node src/scripts/create40RealDrivers.js

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

// Nombres reales de pilotos
const PILOT_NAMES = [
  'Carlos Mendoza', 'Luis Rodríguez', 'Juan Pérez', 'Miguel Ruiz', 'Diego Herrera',
  'Andrés Moreno', 'Gabriel Medina', 'Sebastián Ortiz', 'Felipe Navarro', 'Cristian Acosta',
  'Hector Mendez', 'Roberto Silva', 'Fernando Castro', 'Ricardo Paredes', 'Alejandro Fuentes',
  'Jorge Torres', 'Manuel Vargas', 'Pedro Morales', 'Alberto Rojas', 'Francisco Soto',
  'Daniel Vega', 'Mario Castillo', 'Eduardo Guzmán', 'Rafael Salazar', 'Antonio Cordoba',
  'Santiago Herrera', 'Nicolás Jiménez', 'Adrián López', 'Marcelo Torres', 'Gustavo Silva',
  'Pablo Mendoza', 'Leonardo Ruiz', 'Rodrigo Castro', 'Federico Morales', 'Emilio Vargas',
  'Ignacio Rojas', 'Matías Soto', 'Tomás Castillo', 'Bruno Guzmán', 'Lucas Salazar',
  'Agustín Cordoba', 'Valentín Herrera'
];

// Empresas de transporte
const COMPANIES = [
  'Transportes Rápidos', 'Logística Express', 'Carga Segura', 'Mensajería Nacional',
  'Transportes Unidos', 'Logística Integral', 'Carga Directa', 'Mensajería Rápida',
  'Transportes Elite', 'Logística Premium', 'Carga Express', 'Mensajería Directa',
  'Transportes Pro', 'Logística Plus', 'Carga Nacional', 'Mensajería Elite',
  'Transportes Max', 'Logística Direct', 'Carga Plus', 'Mensajería Pro',
  'Transportes Plus', 'Logística Max', 'Carga Elite', 'Mensajería Plus',
  'Transportes Rápidos', 'Logística Express', 'Carga Segura', 'Mensajería Nacional',
  'Transportes Unidos', 'Logística Integral', 'Carga Directa', 'Mensajería Rápida',
  'Transportes Elite', 'Logística Premium', 'Carga Express', 'Mensajería Directa',
  'Transportes Pro', 'Logística Plus', 'Carga Nacional', 'Mensajería Elite',
  'Transportes Max', 'Logística Direct'
];

// Imágenes temporales hasta que se suban las imágenes reales
const PILOT_IMAGES = [
  'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Piloto+1',
  'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Piloto+2',
  'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Piloto+3',
  'https://via.placeholder.com/300x200/96CEB4/FFFFFF?text=Piloto+4'
];

// Generar placas en formato TDX-531
function generatePlate() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  let plate = '';
  // 3 letras
  for (let i = 0; i < 3; i++) {
    plate += letters[Math.floor(Math.random() * letters.length)];
  }
  plate += '-';
  // 3 números
  for (let i = 0; i < 3; i++) {
    plate += numbers[Math.floor(Math.random() * numbers.length)];
  }
  
  return plate;
}

// Seleccionar imagen aleatoria de las proporcionadas
function getRandomPilotImage() {
  const randomIndex = Math.floor(Math.random() * PILOT_IMAGES.length);
  return PILOT_IMAGES[randomIndex];
}

async function createDrivers() {
  console.log('🚀 Iniciando creación de 40 pilotos con nombres reales e imágenes...');
  console.log('⏰ Inicio:', new Date().toLocaleString());
  
  let createdDrivers = 0;
  let failedDrivers = 0;
  
  for (let i = 1; i <= 40; i++) {
    const driverName = PILOT_NAMES[i - 1] || `Piloto ${i}`;
    const company = COMPANIES[i % COMPANIES.length];
    const plate = generatePlate();
    const imageUrl = getRandomPilotImage(); // Usar imagen real aleatoria
    
    const driver = {
      id: `driver${i}`,
      conductor: driverName,
      placa: plate,
      img: imageUrl,
      NumeroLikes: 0,
      numeroCompetidor: i,
      empresa: company,
      createdAt: new Date().toISOString()
    };
    
    try {
      await setDoc(doc(db, 'drivers', driver.id), driver);
      console.log(`✅ Piloto ${i}/40: ${driverName} (${plate}) - ${company}`);
      createdDrivers++;
    } catch (error) {
      console.error(`❌ Error creando piloto ${i}:`, error.message);
      failedDrivers++;
    }
    
    // Pequeña pausa para no sobrecargar Firebase
    if (i % 10 === 0) {
      console.log(`📊 Progreso: ${i}/40 pilotos procesados`);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  console.log('\n🎉 Proceso completado!');
  console.log(`✅ Pilotos creados: ${createdDrivers}`);
  console.log(`❌ Pilotos fallidos: ${failedDrivers}`);
  console.log('⏰ Fin:', new Date().toLocaleString());
  
  // Mostrar estadísticas
  console.log('\n📊 Estadísticas:');
  console.log(`🚛 Total de pilotos en la base de datos: ${createdDrivers + failedDrivers}`);
  console.log(`🏆 Pilotos listos para competir: ${createdDrivers}`);
  console.log(`🖼️  Imágenes utilizadas: ${PILOT_IMAGES.length} imágenes reales`);
}

createDrivers().catch(console.error); 