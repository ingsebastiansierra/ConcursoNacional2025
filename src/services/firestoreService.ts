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
  addDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  limit,
  where
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore(app);

export const getDrivers = async () => {
  const driversCol = collection(db, 'drivers');
  const driversSnapshot = await getDocs(driversCol);
  return driversSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const likeDriver = async (driverId: string, userId: string) => {
  try {
    // Verificar si el concurso está activo
    const contestConfig = await getContestConfig();
    if (!contestConfig.isActive) {
      return { 
        success: false, 
        message: 'El concurso está pausado. No se pueden emitir votos en este momento.' 
      };
    }

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

    return { success: true, message: 'Voto registrado correctamente' };
  } catch (error) {
    console.error('Error al votar:', error);
    return { 
      success: false, 
      message: 'Error al procesar el voto' 
    };
  }
};

export const subscribeToDrivers = (callback: (drivers: any[]) => void) => {
  const driversCol = collection(db, 'drivers');
  return onSnapshot(driversCol, (snapshot: QuerySnapshot<DocumentData>) => {
    const drivers = snapshot.docs.map(doc => {
      const data = doc.data();
      // Usar el ID real del documento de Firestore, no el campo id del documento
      return { 
        id: doc.id, // ID real del documento de Firestore
        ...data 
      };
    });
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

// Suscripción a estadísticas en tiempo real
export const subscribeToContestStats = (callback: (stats: any) => void) => {
  const driversCol = collection(db, 'drivers');
  const usersCol = collection(db, 'users');
  
  const unsubscribeDrivers = onSnapshot(driversCol, (driversSnapshot) => {
    const totalDrivers = driversSnapshot.size;
    let totalVotes = 0;
    let topDriver = null;
    
    driversSnapshot.docs.forEach((driverDoc) => {
      const data = driverDoc.data();
      const votes = data.NumeroLikes || 0;
      totalVotes += votes;
      
      if (!topDriver || votes > (topDriver.NumeroLikes || 0)) {
        topDriver = { id: driverDoc.id, ...data };
      }
    });
    
    // Obtener total de usuarios
    getDocs(usersCol).then((usersSnapshot) => {
      const totalUsers = usersSnapshot.size;
      callback({
        totalUsers,
        totalDrivers,
        totalVotes,
        topDriver
      });
    });
  });
  
  return unsubscribeDrivers;
};

// Suscripción a usuarios en tiempo real
export const subscribeToUsers = (callback: (users: any[]) => void) => {
  const usersCol = collection(db, 'users');
  return onSnapshot(usersCol, (snapshot) => {
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(users);
  });
};

// Suscripción a actividad reciente en tiempo real
export const subscribeToRecentActivity = (callback: (activity: any) => void) => {
  const usersCol = collection(db, 'users');
  const driversCol = collection(db, 'drivers');
  
  const unsubscribeUsers = onSnapshot(usersCol, (usersSnapshot) => {
    const recentUsers = usersSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
    
    // Obtener votos recientes
    getRecentVotes(5).then((recentVotes) => {
      callback({
        recentUsers,
        recentVotes
      });
    });
  });
  
  return unsubscribeUsers;
};

// Suscripción a configuración del concurso en tiempo real
export const subscribeToContestConfig = (callback: (config: any) => void) => {
  const configRef = doc(db, 'contestConfig', 'main');
  return onSnapshot(configRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      // Crear configuración por defecto
      const defaultConfig = { isActive: true };
      setDoc(configRef, defaultConfig);
      callback(defaultConfig);
    }
  });
};

// Suscripción a datos del usuario en tiempo real
export const subscribeToUserData = (userId: string, callback: (userData: any) => void) => {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      callback(null);
    }
  });
};

// Obtener los likes de un piloto
export const getDriverLikes = async (driverId: string) => {
  const likesCol = collection(db, 'drivers', driverId, 'likes');
  const likesSnapshot = await getDocs(likesCol);
  return likesSnapshot.docs.map(doc => doc.data());
};

// --- Funciones de reinicio para administradores ---

// Reiniciar todos los votos de pilotos
export const resetAllDriverVotes = async () => {
  try {
    const batch = writeBatch(db);
    
    // Obtener todos los pilotos
    const driversCol = collection(db, 'drivers');
    const driversSnapshot = await getDocs(driversCol);
    
    // Reiniciar votos de cada piloto
    driversSnapshot.docs.forEach((driverDoc) => {
      const driverRef = doc(db, 'drivers', driverDoc.id);
      batch.update(driverRef, { NumeroLikes: 0 });
    });
    
    // Eliminar todos los likes de las subcolecciones
    for (const driverDoc of driversSnapshot.docs) {
      const likesCol = collection(db, 'drivers', driverDoc.id, 'likes');
      const likesSnapshot = await getDocs(likesCol);
      
      likesSnapshot.docs.forEach((likeDoc) => {
        batch.delete(doc(db, 'drivers', driverDoc.id, 'likes', likeDoc.id));
      });
    }
    
    await batch.commit();
    return { success: true, message: 'Votos de pilotos reiniciados correctamente' };
  } catch (error) {
    console.error('Error reiniciando votos de pilotos:', error);
    return { success: false, message: 'Error al reiniciar votos de pilotos' };
  }
};

// Reiniciar todos los likes de usuarios
export const resetAllUserLikes = async () => {
  try {
    const batch = writeBatch(db);
    
    // Obtener todos los usuarios con votos
    const userVotesCol = collection(db, 'userVotes');
    const userVotesSnapshot = await getDocs(userVotesCol);
    
    // Reiniciar votos de cada usuario
    userVotesSnapshot.docs.forEach((userVotesDoc) => {
      const userVotesRef = doc(db, 'userVotes', userVotesDoc.id);
      batch.update(userVotesRef, { votesUsed: 0 });
    });
    
    await batch.commit();
    return { success: true, message: 'Likes de usuarios reiniciados correctamente' };
  } catch (error) {
    console.error('Error reiniciando likes de usuarios:', error);
    return { success: false, message: 'Error al reiniciar likes de usuarios' };
  }
};

// --- Funciones de estadísticas para el dashboard ---

// Obtener estadísticas generales del concurso
export const getContestStats = async () => {
  try {
    // Obtener total de usuarios
    const usersCol = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCol);
    const totalUsers = usersSnapshot.size;

    // Obtener total de pilotos
    const driversCol = collection(db, 'drivers');
    const driversSnapshot = await getDocs(driversCol);
    const totalDrivers = driversSnapshot.size;

    // Calcular total de votos
    let totalVotes = 0;
    driversSnapshot.docs.forEach((driverDoc) => {
      const data = driverDoc.data();
      totalVotes += data.NumeroLikes || 0;
    });

    // Obtener piloto con más votos
    const drivers = driversSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const topDriver = drivers.reduce((prev, current) => 
      (prev.NumeroLikes || 0) > (current.NumeroLikes || 0) ? prev : current
    );

    return {
      totalUsers,
      totalDrivers,
      totalVotes,
      topDriver: topDriver.NumeroLikes > 0 ? topDriver : null
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return { totalUsers: 0, totalDrivers: 0, totalVotes: 0, topDriver: null };
  }
};

// Obtener top 3 pilotos
export const getTopDrivers = async (limit: number = 3) => {
  try {
    const driversCol = collection(db, 'drivers');
    const driversSnapshot = await getDocs(driversCol);
    
    const drivers = driversSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Ordenar por número de likes descendente
    const sortedDrivers = drivers
      .filter(driver => (driver.NumeroLikes || 0) > 0)
      .sort((a, b) => (b.NumeroLikes || 0) - (a.NumeroLikes || 0))
      .slice(0, limit);

    return sortedDrivers;
  } catch (error) {
    console.error('Error obteniendo top drivers:', error);
    return [];
  }
};

// Obtener últimos usuarios registrados
export const getRecentUsers = async (limit: number = 5) => {
  try {
    const usersCol = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCol);
    
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Ordenar por fecha de creación descendente
    const sortedUsers = users
      .filter(user => user.createdAt)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return sortedUsers;
  } catch (error) {
    console.error('Error obteniendo usuarios recientes:', error);
    return [];
  }
};

// Obtener últimos votos emitidos
export const getRecentVotes = async (limit: number = 5) => {
  try {
    const driversCol = collection(db, 'drivers');
    const driversSnapshot = await getDocs(driversCol);
    
    const recentVotes: any[] = [];
    
    // Obtener likes recientes de cada piloto
    for (const driverDoc of driversSnapshot.docs) {
      const likesCol = collection(db, 'drivers', driverDoc.id, 'likes');
      const likesSnapshot = await getDocs(likesCol);
      
      likesSnapshot.docs.forEach((likeDoc) => {
        recentVotes.push({
          id: likeDoc.id,
          driverId: driverDoc.id,
          driverName: driverDoc.data().conductor || 'Piloto',
          ...likeDoc.data()
        });
      });
    }
    
    // Ordenar por fecha descendente
    const sortedVotes = recentVotes
      .filter(vote => vote.likedAt)
      .sort((a, b) => new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime())
      .slice(0, limit);

    return sortedVotes;
  } catch (error) {
    console.error('Error obteniendo votos recientes:', error);
    return [];
  }
};

// Obtener configuración del concurso
export const getContestConfig = async () => {
  try {
    const configRef = doc(db, 'contest', 'config');
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      return configSnap.data();
    } else {
      // Configuración por defecto
      const defaultConfig = {
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: null,
        maxVotesPerUser: 10,
        description: 'Concurso de Tractomulas 2025'
      };
      await setDoc(configRef, defaultConfig);
      return defaultConfig;
    }
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    return {
      isActive: true,
      startDate: new Date().toISOString(),
      endDate: null,
      maxVotesPerUser: 10,
      description: 'Concurso de Tractomulas 2025'
    };
  }
};

// Actualizar configuración del concurso
export const updateContestConfig = async (config: any) => {
  try {
    const configRef = doc(db, 'contest', 'config');
    await updateDoc(configRef, config);
    return { success: true, message: 'Configuración actualizada correctamente' };
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    return { success: false, message: 'Error al actualizar configuración' };
  }
}; 

// Agregar nuevo piloto
export const addNewDriver = async (driverData: {
  conductor: string;
  NCompetidor: number;
  placa: string;
  imageUrl?: string;
}) => {
  try {
    const db = getFirestore();
    const driversCol = collection(db, 'drivers');
    
    // Verificar si ya existe un piloto con ese número de competidor
    const existingDrivers = await getDocs(driversCol);
    const existingDriverByNumber = existingDrivers.docs.find(doc => 
      doc.data().numeroCompetidor === driverData.NCompetidor
    );
    
    if (existingDriverByNumber) {
      return { 
        success: false, 
        message: `Ya existe un piloto con el número de competidor ${driverData.NCompetidor}` 
      };
    }
    
    // Verificar si ya existe un piloto con esa placa
    const existingDriverByPlate = existingDrivers.docs.find(doc => 
      doc.data().placa === driverData.placa
    );
    
    if (existingDriverByPlate) {
      return { 
        success: false, 
        message: `Ya existe un piloto con la placa ${driverData.placa}` 
      };
    }
    
    // Crear el nuevo piloto
    const newDriver = {
      conductor: driverData.conductor,
      numeroCompetidor: driverData.NCompetidor, // Usar numeroCompetidor en lugar de NCompetidor
      placa: driverData.placa,
      imagen: driverData.imageUrl || '', // Guardar como imagen en lugar de imageUrl
      NumeroLikes: 0,
      createdAt: new Date().toISOString(),
    };
    
    await addDoc(driversCol, newDriver);
    
    return { 
      success: true, 
      message: `Piloto ${driverData.conductor} agregado correctamente` 
    };
  } catch (error) {
    console.error('Error agregando piloto:', error);
    return { 
      success: false, 
      message: 'Error al agregar el piloto' 
    };
  }
}; 