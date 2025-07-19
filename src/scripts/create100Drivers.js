// Script para crear 100 conductores con datos realistas
// Uso: node src/scripts/create100Drivers.js

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

// Nombres realistas de pilotos
const PILOT_NAMES = [
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
  'Thiago Morales', 'Bautista Vargas', 'Santino Rojas', 'Mateo Soto', 'Benjamín Castillo',
  'Dante Guzmán', 'Lorenzo Salazar', 'Joaquín Cordoba', 'Rafael Herrera', 'Santiago Jiménez',
  'Nicolás López', 'Adrián Torres', 'Marcelo Silva', 'Antonio Mendoza', 'Ignacio Ruiz',
  'Matías Castro', 'Tomás Morales', 'Bruno Vargas', 'Lucas Rojas', 'Agustín Soto',
  'Valentín Castillo', 'Maximiliano Guzmán', 'Thiago Salazar', 'Bautista Cordoba', 'Santino Herrera',
  'Mateo Jiménez', 'Benjamín López', 'Dante Torres', 'Lorenzo Silva', 'Joaquín Mendoza',
  'Rafael Ruiz', 'Santiago Castro', 'Nicolás Morales', 'Adrián Vargas', 'Marcelo Rojas',
  'Antonio Soto', 'Ignacio Castillo', 'Matías Guzmán', 'Tomás Salazar', 'Bruno Cordoba'
];

// Empresas de transporte
const COMPANIES = [
  'Transportes Rápidos', 'Logística Express', 'Carga Segura', 'Mensajería Nacional',
  'Transportes Unidos', 'Logística Integral', 'Carga Directa', 'Mensajería Rápida',
  'Transportes Elite', 'Logística Premium', 'Carga Express', 'Mensajería Directa',
  'Transportes Pro', 'Logística Plus', 'Carga Nacional', 'Mensajería Elite',
  'Transportes Max', 'Logística Direct', 'Carga Plus', 'Mensajería Pro',
  'Transportes Plus', 'Logística Max', 'Carga Elite', 'Mensajería Plus'
];

// Generar placas realistas
function generatePlate() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  let plate = '';
  // 3 letras
  for (let i = 0; i < 3; i++) {
    plate += letters[Math.floor(Math.random() * letters.length)];
  }
  // 3 números
  for (let i = 0; i < 3; i++) {
    plate += numbers[Math.floor(Math.random() * numbers.length)];
  }
  
  return plate;
}

// Generar imagen placeholder variada
function generateImageUrl(num) {
  const colors = ['red', 'blue', 'green', 'orange', 'purple', 'brown', 'gray', 'pink'];
  const color = colors[num % colors.length];
  return `https://via.placeholder.com/150/${color}/white?text=Piloto+${num}`;
}

async function createDrivers() {
  console.log('🚀 Iniciando creación de 100 pilotos...');
  console.log('⏰ Inicio:', new Date().toLocaleString());
  
  let createdDrivers = 0;
  let failedDrivers = 0;
  
  for (let i = 1; i <= 100; i++) {
    const driverName = PILOT_NAMES[i - 1] || `Piloto ${i}`;
    const company = COMPANIES[i % COMPANIES.length];
    const plate = generatePlate();
    const imageUrl = generateImageUrl(i);
    
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
      console.log(`✅ Piloto ${i}/100: ${driverName} (${plate}) - ${company}`);
      createdDrivers++;
    } catch (error) {
      console.error(`❌ Error creando piloto ${i}:`, error.message);
      failedDrivers++;
    }
    
    // Pequeña pausa para no sobrecargar Firebase
    if (i % 10 === 0) {
      console.log(`📊 Progreso: ${i}/100 pilotos procesados`);
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
}

createDrivers().catch(console.error); 