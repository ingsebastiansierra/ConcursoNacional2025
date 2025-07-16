import app from '../config/firebase';
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  increment,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  getDoc,
  setDoc,
  addDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore(app);

export const getDrivers = async () => {
  const driversCol = collection(db, 'drivers');
  const driversSnapshot = await getDocs(driversCol);
  return driversSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const likeDriver = async (driverId: string, userId: string) => {
  const driverRef = doc(db, 'drivers', driverId);
  await updateDoc(driverRef, {
    NumeroLikes: increment(1),
  });
  await incrementUserVotes(userId);

  // Obtener nombre o correo del usuario
  const userDoc = await getDoc(doc(db, 'users', userId));
  let userName = 'Usuario';
  if (userDoc.exists()) {
    userName = userDoc.data().name || userDoc.data().email || 'Usuario';
  }

  // Guardar el like en la subcolección 'likes' del piloto
  const likesCol = collection(driverRef, 'likes');
  await addDoc(likesCol, {
    userId,
    userName,
    likedAt: new Date().toISOString(),
  });
};

export const subscribeToDrivers = (callback: (drivers: any[]) => void) => {
  const driversCol = collection(db, 'drivers');
  return onSnapshot(driversCol, (snapshot: QuerySnapshot<DocumentData>) => {
    const drivers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(drivers);
  });
};

// --- Votos por usuario ---

export const getUserVotesUsed = async (userId: string): Promise<number> => {
  const userVotesRef = doc(db, 'userVotes', userId);
  const userVotesSnap = await getDoc(userVotesRef);
  if (!userVotesSnap.exists()) {
    await setDoc(userVotesRef, { votesUsed: 0 });
    return 0;
  }
  return userVotesSnap.data().votesUsed || 0;
};

export const incrementUserVotes = async (userId: string) => {
  const userVotesRef = doc(db, 'userVotes', userId);
  await updateDoc(userVotesRef, {
    votesUsed: increment(1),
  });
};

export const subscribeToUserVotes = (userId: string, callback: (votesUsed: number) => void) => {
  const userVotesRef = doc(db, 'userVotes', userId);
  return onSnapshot(userVotesRef, (docSnap) => {
    if (!docSnap.exists()) {
      setDoc(userVotesRef, { votesUsed: 0 });
      callback(0);
    } else {
      callback(docSnap.data().votesUsed || 0);
    }
  });
};

// Obtener los likes de un piloto
export const getDriverLikes = async (driverId: string) => {
  const likesCol = collection(db, 'drivers', driverId, 'likes');
  const likesSnapshot = await getDocs(likesCol);
  return likesSnapshot.docs.map(doc => doc.data());
}; 