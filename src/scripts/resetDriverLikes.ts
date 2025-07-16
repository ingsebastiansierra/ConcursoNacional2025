import app from '../config/firebase';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const db = getFirestore(app);

export const resetAllDriverLikes = async () => {
  const driversCol = collection(db, 'drivers');
  const driversSnapshot = await getDocs(driversCol);
  const updates = driversSnapshot.docs.map(driverDoc =>
    updateDoc(doc(db, 'drivers', driverDoc.id), { NumeroLikes: 0 })
  );
  await Promise.all(updates);
  console.log('Todos los NumeroLikes han sido puestos en 0');
};

// Si quieres ejecutarlo directamente desde Node o un comando, puedes hacer:
// resetAllDriverLikes(); 