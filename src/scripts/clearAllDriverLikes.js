const { getFirestore, collection, getDocs, doc, deleteDoc } = require('firebase/firestore');
const app = require('../config/firebase');

const db = getFirestore(app);

async function clearAllDriverLikes() {
  const driversCol = collection(db, 'drivers');
  const driversSnapshot = await getDocs(driversCol);
  for (const driverDoc of driversSnapshot.docs) {
    const likesCol = collection(db, 'drivers', driverDoc.id, 'likes');
    const likesSnapshot = await getDocs(likesCol);
    const deletions = likesSnapshot.docs.map(likeDoc => deleteDoc(doc(db, 'drivers', driverDoc.id, 'likes', likeDoc.id)));
    await Promise.all(deletions);
    console.log(`Likes eliminados para piloto ${driverDoc.id}`);
  }
  console.log('Todos los likes han sido eliminados de todos los pilotos.');
}

clearAllDriverLikes(); 