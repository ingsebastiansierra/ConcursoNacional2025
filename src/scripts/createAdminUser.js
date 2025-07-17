const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Configuración de Firebase del proyecto
const firebaseConfig = {
  apiKey: 'AIzaSyAHGIYFFwbp3HLT02WbIJ7pA_0k5RYVCow',
  authDomain: 'concurso2025-2c887.firebaseapp.com',
  projectId: 'concurso2025-2c887',
  storageBucket: 'concurso2025-2c887.firebasestorage.app',
  messagingSenderId: '829384550005',
  appId: '1:829384550005:web:e2c1ecac6487a21ba6fa3c',
  measurementId: 'G-F22YYC2RB6',
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser() {
  try {
    const email = 'admin@tractomulas.com';
    const password = 'admin123456'; // Cambia esta contraseña
    const name = 'Administrador';

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