const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');
const app = require('../config/firebase').default;

const db = getFirestore(app);

async function resetAllDriverLikes() {
  const driversCol = collection(db, 'drivers');
  const driversSnapshot = await getDocs(driversCol);
  const updates = driversSnapshot.docs.map(driverDoc =>
    updateDoc(doc(db, 'drivers', driverDoc.id), { NumeroLikes: 0 })
  );
  await Promise.all(updates);
  console.log('Todos los NumeroLikes han sido puestos en 0');
}

resetAllDriverLikes(); 