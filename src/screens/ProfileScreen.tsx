import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

interface ProfileScreenProps {
  onLogout?: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const [userData, setUserData] = useState<{ name?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const user = getAuth().currentUser;
  const db = getFirestore();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as any);
        } else {
          setUserData({ name: '', email: user.email || '' });
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      if (onLogout) onLogout();
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#1a237e" style={{ flex: 1, marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Ionicons name="person-circle" size={90} color="#1a237e" />
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Mi Perfil</Text>
        <View style={styles.row}>
          <Ionicons name="person" size={22} color="#607d8b" style={styles.icon} />
          <View>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>{userData?.name || 'Sin nombre'}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Ionicons name="mail" size={22} color="#607d8b" style={styles.icon} />
          <View>
            <Text style={styles.label}>Correo</Text>
            <Text style={styles.value}>{userData?.email || user?.email || 'Sin correo'}</Text>
          </View>
        </View>
        <View style={{ marginTop: 24 }}>
          <Button title="Cerrar sesión" color="#d32f2f" onPress={handleLogout} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f6fc',
    alignItems: 'center',
    padding: 24,
    justifyContent: 'center',
  },
  avatarContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 18,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    width: '100%',
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 15,
    color: '#607d8b',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 18,
    color: '#263238',
    marginBottom: 2,
    textAlign: 'left',
  },
});

export default ProfileScreen; 