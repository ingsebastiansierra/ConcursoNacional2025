import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, RefreshControl, Modal, TextInput, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import {
  getContestStats,
  getTopDrivers,
  getRecentUsers,
  getRecentVotes,
  getContestConfig,
  updateContestConfig,
  addNewDriver
} from '../services/firestoreService';

interface AdminScreenProps {
  onLogout?: () => void;
  onNavigateToUsers?: () => void;
  onNavigateToDrivers?: () => void;
}

interface ContestStats {
  totalUsers: number;
  totalDrivers: number;
  totalVotes: number;
  topDriver: any;
}

const COLORS = [
  { border: '#43a047', shadow: 'rgba(67,160,71,0.25)' },    // 1° verde
  { border: '#1976d2', shadow: 'rgba(25,118,210,0.25)' },   // 2° azul
  { border: '#fb8c00', shadow: 'rgba(251,140,0,0.25)' },    // 3° naranja
];

const AdminScreen: React.FC<AdminScreenProps> = ({ onLogout, onNavigateToUsers, onNavigateToDrivers }) => {
  const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<ContestStats>({
    totalUsers: 0,
    totalDrivers: 0,
    totalVotes: 0,
    topDriver: null
  });
  const [topDrivers, setTopDrivers] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentVotes, setRecentVotes] = useState<any[]>([]);
  const [contestConfig, setContestConfig] = useState<any>(null);
  
  // Estados para el modal de agregar piloto
  const [addDriverModalVisible, setAddDriverModalVisible] = useState(false);
  const [newDriver, setNewDriver] = useState({
    conductor: '',
    NCompetidor: '',
    placa: '',
    imageUrl: ''
  });
  const [addingDriver, setAddingDriver] = useState(false);

  const pulseAnim = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, topDriversData, recentUsersData, recentVotesData, configData] = await Promise.all([
        getContestStats(),
        getTopDrivers(3),
        getRecentUsers(5),
        getRecentVotes(5),
        getContestConfig()
      ]);

      setStats(statsData);
      setTopDrivers(topDriversData);
      setRecentUsers(recentUsersData);
      setRecentVotes(recentVotesData);
      setContestConfig(configData);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadDashboardData();
    // Animación de pálpito para los 3 primeros
    pulseAnim.forEach((anim, idx) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1.08,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      if (onLogout) onLogout();
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión');
    }
  };

  const handleToggleContest = async () => {
    if (!contestConfig) return;

    const newStatus = !contestConfig.isActive;
    const action = newStatus ? 'activar' : 'pausar';
    
    Alert.alert(
      `${newStatus ? 'Activar' : 'Pausar'} Concurso`,
      `¿Estás seguro de que quieres ${action} el concurso?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: async () => {
            try {
              const result = await updateContestConfig({ isActive: newStatus });
              if (result.success) {
                setContestConfig({ ...contestConfig, isActive: newStatus });
                Alert.alert('✅ Éxito', `Concurso ${action}do correctamente`);
              } else {
                Alert.alert('❌ Error', result.message);
              }
            } catch (error) {
              Alert.alert('❌ Error', 'No se pudo cambiar el estado del concurso');
            }
          }
        }
      ]
    );
  };

  const handleNavigateToUsers = () => {
    if (onNavigateToUsers) {
      onNavigateToUsers();
    }
  };

  const handleNavigateToDrivers = () => {
    if (onNavigateToDrivers) {
      onNavigateToDrivers();
    }
  };

  const handleAddDriver = async () => {
    // Validar campos
    if (!newDriver.conductor.trim()) {
      Alert.alert('Error', 'El nombre del conductor es obligatorio');
      return;
    }
    if (!newDriver.NCompetidor.trim()) {
      Alert.alert('Error', 'El número de competidor es obligatorio');
      return;
    }
    if (!newDriver.placa.trim()) {
      Alert.alert('Error', 'La placa es obligatoria');
      return;
    }

    const numeroCompetidor = parseInt(newDriver.NCompetidor);
    if (isNaN(numeroCompetidor) || numeroCompetidor <= 0) {
      Alert.alert('Error', 'El número de competidor debe ser un número válido');
      return;
    }

    setAddingDriver(true);
    try {
      const result = await addNewDriver({
        conductor: newDriver.conductor.trim(),
        NCompetidor: numeroCompetidor,
        placa: newDriver.placa.trim(),
        imageUrl: newDriver.imageUrl.trim()
      });

      if (result.success) {
        Alert.alert('✅ Éxito', result.message);
        setAddDriverModalVisible(false);
        setNewDriver({ conductor: '', NCompetidor: '', placa: '', imageUrl: '' });
        loadDashboardData(); // Recargar datos
      } else {
        Alert.alert('❌ Error', result.message);
      }
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo agregar el piloto');
    } finally {
      setAddingDriver(false);
    }
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="refresh" size={40} color="#1a237e" />
        <Text style={styles.loadingText}>Cargando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={40} color="#1a237e" />
        <Text style={styles.title}>Panel de Administrador</Text>
        <Text style={styles.subtitle}>Dashboard del Concurso</Text>
      </View>

      {/* Estado del Concurso */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trophy" size={24} color="#1a237e" />
          <Text style={styles.sectionTitle}>Estado del Concurso</Text>
        </View>
        <View style={styles.contestStatusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Estado:</Text>
            <View style={[styles.statusBadge, { backgroundColor: contestConfig?.isActive ? '#4caf50' : '#f44336' }]}>
              <Text style={styles.statusText}>
                {contestConfig?.isActive ? 'ACTIVO' : 'PAUSADO'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.toggleButton} onPress={handleToggleContest}>
            <Ionicons 
              name={contestConfig?.isActive ? 'pause' : 'play'} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.toggleButtonText}>
              {contestConfig?.isActive ? 'Pausar' : 'Activar'} Concurso
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Gestión de Pilotos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="car-sport" size={24} color="#1a237e" />
          <Text style={styles.sectionTitle}>Gestión de Pilotos</Text>
        </View>
        <View style={styles.managementGrid}>
          <TouchableOpacity style={styles.managementCard} onPress={handleNavigateToDrivers}>
            <Ionicons name="list" size={30} color="#1a237e" />
            <Text style={styles.managementTitle}>Ver Pilotos</Text>
            <Text style={styles.managementSubtitle}>Gestionar pilotos existentes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.managementCard} onPress={() => setAddDriverModalVisible(true)}>
            <Ionicons name="add-circle" size={30} color="#4caf50" />
            <Text style={styles.managementTitle}>Agregar Piloto</Text>
            <Text style={styles.managementSubtitle}>Nuevo participante</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Estadísticas Principales */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="stats-chart" size={24} color="#1a237e" />
          <Text style={styles.sectionTitle}>Estadísticas Principales</Text>
        </View>
        <View style={styles.statsGrid}>
          <TouchableOpacity style={styles.statCard} onPress={handleNavigateToUsers}>
            <Ionicons name="people" size={30} color="#1a237e" />
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Usuarios</Text>
            <View style={styles.statClickable}>
              <Ionicons name="chevron-forward" size={16} color="#1a237e" />
              <Text style={styles.statClickableText}>Ver todos</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={handleNavigateToDrivers}>
            <Ionicons name="car-sport" size={30} color="#1a237e" />
            <Text style={styles.statNumber}>{stats.totalDrivers}</Text>
            <Text style={styles.statLabel}>Pilotos</Text>
            <View style={styles.statClickable}>
              <Ionicons name="chevron-forward" size={16} color="#1a237e" />
              <Text style={styles.statClickableText}>Ver todos</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.statCard}>
            <Ionicons name="heart" size={30} color="#1a237e" />
            <Text style={styles.statNumber}>{stats.totalVotes}</Text>
            <Text style={styles.statLabel}>Votos</Text>
          </View>
        </View>
      </View>

      {/* Top 3 Pilotos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trophy" size={24} color="#1a237e" />
          <Text style={styles.sectionTitle}>Top 3 Pilotos</Text>
        </View>
        {topDrivers.length > 0 ? (
          topDrivers.map((driver, index) => (
            index < 3 ? (
              <Animated.View
                key={driver.id}
                style={[
                  styles.topDriverCard,
                  {
                    borderColor: COLORS[index].border,
                    borderWidth: 2,
                    shadowColor: COLORS[index].shadow,
                    shadowOpacity: 0.5,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 4 },
                    backgroundColor: '#fff',
                    alignSelf: 'center',
                    maxWidth: '92%',
                    width: '92%',
                    transform: [{ scale: pulseAnim[index] }],
                  },
                ]}
              >
                <View style={[styles.rankBadge, { borderColor: COLORS[index].border }] }>
                  <Text style={[styles.rankText, { color: COLORS[index].border }]}>{index + 1}</Text>
                </View>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{driver.conductor || 'Piloto'}</Text>
                  <Text style={styles.driverVotes}>{driver.NumeroLikes || 0} votos</Text>
                </View>
                <Ionicons name="trophy" size={24} color={index === 0 ? '#ffd700' : index === 1 ? '#1976d2' : '#fb8c00'} />
              </Animated.View>
            ) : (
              <View key={driver.id} style={styles.topDriverCard}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{driver.conductor || 'Piloto'}</Text>
                  <Text style={styles.driverVotes}>{driver.NumeroLikes || 0} votos</Text>
                </View>
                <Ionicons name="trophy" size={24} color="#c0c0c0" />
              </View>
            )
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No hay votos aún</Text>
          </View>
        )}
      </View>

      {/* Actividad Reciente */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time" size={24} color="#1a237e" />
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
        </View>
        
        {/* Últimos Usuarios */}
        <View style={styles.activitySection}>
          <Text style={styles.activityTitle}>Últimos Usuarios Registrados</Text>
          {recentUsers.length > 0 ? (
            recentUsers.map((user, index) => (
              <View key={user.id} style={styles.activityItem}>
                <Ionicons name="person-circle" size={20} color="#1a237e" />
                <View style={styles.activityInfo}>
                  <Text style={styles.activityText}>{user.name || user.email}</Text>
                  <Text style={styles.activityTime}>{formatTimeAgo(user.createdAt)}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay usuarios registrados</Text>
          )}
        </View>

        {/* Últimos Votos */}
        <View style={styles.activitySection}>
          <Text style={styles.activityTitle}>Últimos Votos Emitidos</Text>
          {recentVotes.length > 0 ? (
            recentVotes.map((vote, index) => (
              <View key={vote.id} style={styles.activityItem}>
                <Ionicons name="heart" size={20} color="#e91e63" />
                <View style={styles.activityInfo}>
                  <Text style={styles.activityText}>
                    {vote.userName} votó por {vote.driverName}
                  </Text>
                  <Text style={styles.activityTime}>{formatTimeAgo(vote.likedAt)}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay votos recientes</Text>
          )}
        </View>
      </View>

      {/* Botón de Cerrar Sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      {/* Modal para Agregar Piloto */}
      <Modal
        visible={addDriverModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddDriverModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Nuevo Piloto</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre del Conductor *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Juan Pérez"
                value={newDriver.conductor}
                onChangeText={(text) => setNewDriver({...newDriver, conductor: text})}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Número de Competidor *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 1"
                value={newDriver.NCompetidor}
                onChangeText={(text) => setNewDriver({...newDriver, NCompetidor: text})}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Placa del Vehículo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: ABC123"
                value={newDriver.placa}
                onChangeText={(text) => setNewDriver({...newDriver, placa: text})}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>URL de la Imagen (Opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://ejemplo.com/imagen.jpg"
                value={newDriver.imageUrl}
                onChangeText={(text) => setNewDriver({...newDriver, imageUrl: text})}
                keyboardType="url"
              />
            </View>

            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setAddDriverModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalButton, styles.addButton]} 
                onPress={handleAddDriver}
                disabled={addingDriver}
              >
                <Text style={styles.addButtonText}>
                  {addingDriver ? 'Agregando...' : 'Agregar Piloto'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f6fc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f6fc',
  },
  loadingText: {
    fontSize: 16,
    color: '#1a237e',
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
    color: '#1a237e',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#607d8b',
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
    marginLeft: 10,
  },
  contestStatusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statusLabel: {
    fontSize: 16,
    color: '#607d8b',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  toggleButton: {
    backgroundColor: '#1a237e',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  managementGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  managementCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  managementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginTop: 10,
    textAlign: 'center',
  },
  managementSubtitle: {
    fontSize: 12,
    color: '#607d8b',
    marginTop: 5,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#607d8b',
    marginTop: 2,
  },
  statClickable: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statClickableText: {
    fontSize: 10,
    color: '#1a237e',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  topDriverCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1a237e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  driverVotes: {
    fontSize: 14,
    color: '#607d8b',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#ccc',
    fontSize: 16,
    marginTop: 10,
  },
  activitySection: {
    marginBottom: 20,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  activityInfo: {
    flex: 1,
    marginLeft: 10,
  },
  activityText: {
    fontSize: 14,
    color: '#263238',
  },
  activityTime: {
    fontSize: 12,
    color: '#607d8b',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  addButton: {
    backgroundColor: '#4caf50',
  },
  cancelButtonText: {
    color: '#607d8b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AdminScreen; 