const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

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

// Nombres reales de conductores
const nombres = [
  "Carlos Mendoza", "Jorge Ramírez", "Luis Torres", "Miguel Ángel López", "Roberto Silva",
  "Fernando Castro", "Diego Morales", "Andrés Jiménez", "Ricardo Herrera", "Alberto Vargas",
  "Eduardo Rojas", "Manuel Ortiz", "Francisco Núñez", "Antonio Paredes", "Sergio Méndez",
  "Daniel Moreno", "Javier Espinoza", "Héctor Valdez", "Raúl Cárdenas", "Oscar Fuentes",
  "Pedro Salazar", "Marco Antonio Ruiz", "José Luis Vega", "Arturo Mendoza", "Felipe Castro",
  "Gustavo Morales", "Rafael Jiménez", "César Herrera", "Alfonso Vargas", "Mario Rojas",
  "Enrique Ortiz", "Roberto Núñez", "Armando Paredes", "Víctor Méndez", "Hugo Moreno",
  "Luis Carlos Espinoza", "Juan Pablo Valdez", "Carlos Alberto Cárdenas", "Miguel Fuentes",
  "José Manuel Salazar", "Ricardo Antonio Ruiz"
];

// Empresas de transporte
const empresas = [
  "Transportes Rápidos S.A.", "Logística Express", "Carga Segura Ltda.", "Mudanzas Pro",
  "Transporte Nacional", "Logística Integral", "Carga Express", "Transportes Unidos",
  "Logística Rápida", "Transporte Seguro", "Carga Nacional", "Logística Pro",
  "Transportes Elite", "Carga Express Ltda.", "Logística Unida", "Transporte Rápido",
  "Carga Integral", "Logística Segura", "Transportes Pro", "Carga Nacional Ltda.",
  "Logística Express S.A.", "Transporte Elite", "Carga Rápida", "Logística Unida Ltda.",
  "Transportes Seguros", "Carga Pro", "Logística Nacional", "Transporte Integral",
  "Carga Elite", "Logística Rápida S.A.", "Transportes Unidos Ltda.", "Carga Segura Pro",
  "Logística Express Elite", "Transporte Nacional Rápido", "Carga Integral Segura",
  "Logística Pro Unida", "Transportes Elite Nacional", "Carga Rápida Integral",
  "Logística Segura Pro", "Transporte Unido Elite"
];

// Imágenes convertidas de Google Drive a URLs directas
const imagenes = [
  "https://drive.google.com/uc?export=view&id=10KkXi7vf8ohnv3rmuTakPX4hHq_2JyeL",
  "https://drive.google.com/uc?export=view&id=1Q5RowofA571mrNuiXXlWF3cA16xEvfnb",
  "https://drive.google.com/uc?export=view&id=1NuQpib4HFiapZV1xqXwyZD-V_MyipzCN",
  "https://drive.google.com/uc?export=view&id=1sBeoCsbNIiIKemZWyp5WwDUW-IYSsmHX"
];

// Generar placas en formato TDX-XXX
function generarPlaca() {
  const numeros = Math.floor(Math.random() * 900) + 100; // 100-999
  return `TDX-${numeros}`;
}

// Función para obtener imagen aleatoria
function obtenerImagenAleatoria() {
  return imagenes[Math.floor(Math.random() * imagenes.length)];
}

async function crear40PilotosReales() {
  try {
    console.log('🚛 Iniciando creación de 40 pilotos con datos reales...');
    console.log('⏰ Inicio:', new Date().toLocaleString());
    
    const placasUsadas = new Set();
    
    for (let i = 0; i < 40; i++) {
      // Generar placa única
      let placa;
      do {
        placa = generarPlaca();
      } while (placasUsadas.has(placa));
      placasUsadas.add(placa);
      
      const piloto = {
        id: `piloto_${i + 1}`,
        conductor: nombres[i],
        placa: placa,
        empresa: empresas[i],
        imagen: obtenerImagenAleatoria(),
        numeroCompetidor: i + 1, // Agregar número de competidor
        likes: 0,
        NumeroLikes: 0, // Agregar campo NumeroLikes
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'drivers'), piloto);
      
      console.log(`✅ Piloto ${i + 1}/40: ${piloto.conductor} - ${piloto.placa} - ${piloto.empresa}`);
    }
    
    console.log('\n🎉 ¡40 pilotos creados exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   👥 Pilotos creados: 40`);
    console.log(`   🚛 Empresas diferentes: ${new Set(empresas.slice(0, 40)).size}`);
    console.log(`   🎨 Imágenes utilizadas: ${imagenes.length} diferentes`);
    console.log('⏰ Fin:', new Date().toLocaleString());
    
  } catch (error) {
    console.error('❌ Error creando pilotos:', error);
  } finally {
    process.exit(0);
  }
}

crear40PilotosReales(); 