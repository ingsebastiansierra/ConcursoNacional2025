import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import colors from '../theme/colors';
import { subscribeToUsers } from '../services/firestoreService';

interface UsersListScreenProps {
  onLogout?: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  votesUsed?: number;
}

const UsersListScreen: React.FC<UsersListScreenProps> = ({ onLogout }) => {
  const styles = createStyles(colors);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      const usersCol = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCol);
      
      const usersData: User[] = [];
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        
        // Obtener votos usados del usuario
        const userVotesRef = doc(db, 'userVotes', userDoc.id);
        const userVotesSnap = await getDocs(collection(db, 'userVotes'));
        let votesUsed = 0;
        
        userVotesSnap.docs.forEach(doc => {
          if (doc.id === userDoc.id) {
            votesUsed = doc.data().votesUsed || 0;
          }
        });
        
        usersData.push({
          id: userDoc.id,
          name: userData.name || 'Sin nombre',
          email: userData.email || '',
          role: userData.role || 'user',
          createdAt: userData.createdAt || new Date().toISOString(),
          votesUsed
        });
      }
      
      // Ordenar por fecha de creación (más recientes primero)
      usersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Suscripción en tiempo real a los usuarios
    const unsubscribe = subscribeToUsers((usersData) => {
      const processedUsers: User[] = usersData.map(user => ({
        id: user.id,
        name: user.name || 'Sin nombre',
        email: user.email || '',
        role: user.role || 'user',
        createdAt: user.createdAt || new Date().toISOString(),
        votesUsed: user.votesUsed || 0
      }));
      
      // Ordenar por fecha de creación (más recientes primero)
      const sortedUsers = processedUsers.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setUsers(sortedUsers);
      setFilteredUsers(sortedUsers);
      setLoading(false);
    });

    // Cleanup de suscripción
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchText, users]);

  const handleBlockUser = (user: User) => {
    Alert.alert(
      'Bloquear Usuario',
      `¿Estás seguro de que quieres bloquear a ${user.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Bloquear',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = getFirestore();
              await updateDoc(doc(db, 'users', user.id), { blocked: true });
              Alert.alert('✅ Éxito', 'Usuario bloqueado correctamente');
              loadUsers(); // Recargar lista
            } catch (error) {
              Alert.alert('❌ Error', 'No se pudo bloquear el usuario');
            }
          }
        }
      ]
    );
  };

  const handleUnblockUser = (user: User) => {
    Alert.alert(
      'Desbloquear Usuario',
      `¿Estás seguro de que quieres desbloquear a ${user.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desbloquear',
          onPress: async () => {
            try {
              const db = getFirestore();
              await updateDoc(doc(db, 'users', user.id), { blocked: false });
              Alert.alert('✅ Éxito', 'Usuario desbloqueado correctamente');
              loadUsers(); // Recargar lista
            } catch (error) {
              Alert.alert('❌ Error', 'No se pudo desbloquear el usuario');
            }
          }
        }
      ]
    );
  };

  const handleDeleteUser = (user: User) => {
    Alert.alert(
      'Eliminar Usuario',
      `¿Estás seguro de que quieres eliminar a ${user.name}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = getFirestore();
              await deleteDoc(doc(db, 'users', user.id));
              Alert.alert('✅ Éxito', 'Usuario eliminado correctamente');
              loadUsers(); // Recargar lista
            } catch (error) {
              Alert.alert('❌ Error', 'No se pudo eliminar el usuario');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Ionicons 
            name={item.role === 'admin' ? 'shield-checkmark' : 'person-circle'} 
            size={24} 
            color={item.role === 'admin' ? colors.icon : colors.textSecondary} 
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.userDate}>Registrado: {formatDate(item.createdAt)}</Text>
          </View>
        </View>
        <View style={styles.userStats}>
          <Text style={styles.userStat}>Votos usados: {item.votesUsed || 0}/10</Text>
          <Text style={styles.userRole}>Rol: {item.role === 'admin' ? 'Administrador' : 'Usuario'}</Text>
        </View>
      </View>
      <View style={styles.userActions}>
        {item.role !== 'admin' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.blockButton]} 
              onPress={() => handleBlockUser(item)}
            >
              <Ionicons name="ban" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]} 
              onPress={() => handleDeleteUser(item)}
            >
              <Ionicons name="trash" size={16} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="refresh" size={40} color={colors.loading} />
        <Text style={styles.loadingText}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="people" size={40} color={colors.icon} />
        <Text style={styles.title}>Gestión de Usuarios</Text>
        <Text style={styles.subtitle}>{filteredUsers.length} usuarios encontrados</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar usuarios..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={loadUsers}>
        <Ionicons name="refresh" size={20} color={colors.background} />
        <Text style={styles.refreshText}>Actualizar</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  loadingText: {
    fontSize: 16,
    color: colors.title,
    marginTop: 10,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.title,
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.subtitle,
    marginTop: 5,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    shadowColor: colors.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: colors.text,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userDetails: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.title,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userStats: {
    marginTop: 5,
  },
  userStat: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  userRole: {
    fontSize: 12,
    color: colors.title,
    fontWeight: 'bold',
    marginTop: 2,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  blockButton: {
    backgroundColor: '#ff9800',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  refreshButton: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  refreshText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default UsersListScreen; 