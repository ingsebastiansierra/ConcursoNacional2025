import app from '../config/firebase';
import {
  initializeAuth,
  getReactNativePersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  UserCredential,
  User,
  sendEmailVerification
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app);

// Lista de correos de administradores (puedes agregar más)
const ADMIN_EMAILS = [
  'admin@tractomulas.com',
  'administrador@tractomulas.com'
];

export const login = async (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const register = async (email: string, password: string, name: string): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  // Guardar el nombre en la colección users
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    name,
    email,
    role: ADMIN_EMAILS.includes(email) ? 'admin' : 'user',
    createdAt: new Date().toISOString(),
  });
  // Enviar correo de verificación
  if (userCredential.user) {
    await sendEmailVerification(userCredential.user);
  }
  return userCredential;
};

// Función para verificar si el usuario actual es administrador
export const isAdmin = async (user: User): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role === 'admin' || ADMIN_EMAILS.includes(user.email || '');
    }
    // Si no existe en Firestore, verificar por email
    return ADMIN_EMAILS.includes(user.email || '');
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Función para obtener el rol del usuario
export const getUserRole = async (user: User): Promise<string> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role || 'user';
    }
    // Si no existe en Firestore, verificar por email
    return ADMIN_EMAILS.includes(user.email || '') ? 'admin' : 'user';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'user';
  }
};

// Nueva función para reenviar correo de verificación
export const sendVerificationEmail = async (user: User) => {
  return sendEmailVerification(user);
};

export default {
  login,
  register,
  isAdmin,
  getUserRole,
  sendVerificationEmail,
}; 