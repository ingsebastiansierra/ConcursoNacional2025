const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Configuración de Firebase del proyecto
const firebaseConfig = {
  apiKey: "AIzaSyBzh0LvArSvGWUdMMZjD5xESqsxkFmrUnQ",
  authDomain: "tractomulas2025.firebaseapp.com",
  projectId: "tractomulas2025",
  storageBucket: "tractomulas2025.appspot.com",
  messagingSenderId: "944693735621",
  appId: "1:944693735621:web:a7603c0434cfe76ea1c0ac",
  measurementId: "G-9QW24GJY9M"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser() {
  try {
    const email = 'ingsebastian073@gmail.com';
    const password = 'admin123456'; // Cambia esta contraseña si lo deseas
    const name = 'Administrador Principal';

    console.log('🔥 Iniciando creación de usuario administrador...');
    console.log('📧 Email:', email);
    console.log('🔑 Contraseña:', password);
    console.log('');
    
    // Crear usuario en Authentication
    console.log('⏳ Creando usuario en Authentication...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    console.log('✅ Usuario creado en Authentication exitosamente!');
    console.log('🆔 UID:', userCredential.user.uid);
    
    // Guardar datos en Firestore
    console.log('⏳ Guardando datos en Firestore...');
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      name,
      email,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });

    console.log('✅ Datos guardados en Firestore exitosamente!');
    console.log('');
    console.log('🎉 ¡Usuario administrador creado completamente!');
    console.log('');
    console.log('📋 Resumen:');
    console.log('📧 Email:', email);
    console.log('🔑 Contraseña:', password);
    console.log('🆔 UID:', userCredential.user.uid);
    console.log('👤 Nombre:', name);
    console.log('🔐 Rol: admin');
    console.log('');
    console.log('💡 Ahora puedes iniciar sesión en la app con estas credenciales');
    
  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ El usuario ya existe en Authentication.');
      console.log('🔄 Verificando si tiene rol de administrador en Firestore...');
      
      // Aquí podrías verificar si el usuario existente tiene rol de admin
      console.log('💡 Si el usuario ya existe, verifica manualmente en Firestore que tenga role: "admin"');
    }
  }
}

// Ejecutar el script
console.log('🚀 Iniciando script de creación de administrador...');
console.log('');
createAdminUser(); 