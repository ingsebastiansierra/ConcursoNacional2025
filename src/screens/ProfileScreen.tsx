import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { subscribeToUserVotes, subscribeToUserData } from '../services/firestoreService';

interface ProfileScreenProps {
  onLogout?: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const styles = createStyles(colors);
  const [userData, setUserData] = useState<{ name?: string; email?: string } | null>(null);
  const [votesUsed, setVotesUsed] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const user = getAuth().currentUser;
  const db = getFirestore();

  useEffect(() => {
    if (!user) return;

    // Suscripción en tiempo real a los datos del usuario
    const unsubscribeUser = subscribeToUserData(user.uid, (userData) => {
      if (userData) {
        setUserData(userData);
      } else {
        setUserData({ name: '', email: user.email || '' });
      }
      setLoading(false);
    });

    // Suscripción en tiempo real a los votos del usuario
    const unsubscribeVotes = subscribeToUserVotes(user.uid, setVotesUsed);

    return () => {
      unsubscribeUser();
      unsubscribeVotes();
    };
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
    return <ActivityIndicator size="large" color={colors.loading} style={{ flex: 1, marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Ionicons name="person-circle" size={90} color={colors.icon} />
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Mi Perfil</Text>
        <View style={styles.row}>
          <Ionicons name="person" size={22} color={colors.icon} style={styles.icon} />
          <View>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>{userData?.name || 'Sin nombre'}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Ionicons name="mail" size={22} color={colors.icon} style={styles.icon} />
          <View>
            <Text style={styles.label}>Correo</Text>
            <Text style={styles.value}>{userData?.email || user?.email || 'Sin correo'}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Ionicons name="heart" size={22} color={colors.icon} style={styles.icon} />
          <View>
            <Text style={styles.label}>Votos Usados</Text>
            <Text style={styles.value}>{votesUsed}/10 votos</Text>
          </View>
        </View>
        <View style={{ marginTop: 24 }}>
          <Button title="Cerrar sesión" color={colors.buttonPrimary} onPress={handleLogout} />
        </View>
      </View>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
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
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.title,
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
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 2,
    textAlign: 'left',
  },
});

export default ProfileScreen; 