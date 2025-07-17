import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyAHGIYFFwbp3HLT02WbIJ7pA_0k5RYVCow',
  authDomain: 'concurso2025-2c887.firebaseapp.com',
  projectId: 'concurso2025-2c887',
  storageBucket: 'concurso2025-2c887.firebasestorage.app',
  messagingSenderId: '829384550005',
  appId: '1:829384550005:web:e2c1ecac6487a21ba6fa3c',
  measurementId: 'G-F22YYC2RB6',
};

// Configuración específica para React Native
const app = initializeApp(firebaseConfig, {
  // Configuración adicional para React Native
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

export default app; 