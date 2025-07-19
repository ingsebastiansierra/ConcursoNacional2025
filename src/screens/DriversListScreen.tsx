import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput, Modal, Button, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import colors from '../theme/colors';
import { subscribeToDrivers } from '../services/firestoreService';

interface DriversListScreenProps {
  onLogout?: () => void;
}

interface Driver {
  id: string;
  conductor: string;
  numeroCompetidor: number;
  NumeroLikes: number;
  placa: string;
  imageUrl?: string;
  likes?: any[];
}

const DriversListScreen: React.FC<DriversListScreenProps> = ({ onLogout }) => {
  const styles = createStyles(colors);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [editName, setEditName] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [editPlate, setEditPlate] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      const driversCol = collection(db, 'drivers');
      const driversSnapshot = await getDocs(driversCol);
      
      const driversData: Driver[] = [];
      
      for (const driverDoc of driversSnapshot.docs) {
        const driverData = driverDoc.data();
        
        // Obtener likes del piloto
        const likesCol = collection(db, 'drivers', driverDoc.id, 'likes');
        const likesSnapshot = await getDocs(likesCol);
        const likes = likesSnapshot.docs.map(doc => doc.data());
        
        driversData.push({
          id: driverDoc.id,
          conductor: driverData.conductor || 'Sin nombre',
          numeroCompetidor: driverData.numeroCompetidor || 0,
          NumeroLikes: driverData.NumeroLikes || 0,
          placa: driverData.placa || 'Sin placa',
          imageUrl: driverData.imageUrl,
          likes
        });
      }
      
      // Ordenar por número de likes (más votos primero)
      driversData.sort((a, b) => (b.NumeroLikes || 0) - (a.NumeroLikes || 0));
      
      setDrivers(driversData);
      setFilteredDrivers(driversData);
    } catch (error) {
      console.error('Error cargando pilotos:', error);
      Alert.alert('Error', 'No se pudieron cargar los pilotos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Suscripción en tiempo real a los pilotos
    const unsubscribe = subscribeToDrivers((driversData) => {
      // Ordenar por número de likes (más votos primero)
      const sortedDrivers = driversData.sort((a, b) => (b.NumeroLikes || 0) - (a.NumeroLikes || 0));
      setDrivers(sortedDrivers);
      setFilteredDrivers(sortedDrivers);
      setLoading(false);
    });

    // Cleanup de suscripción
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredDrivers(drivers);
    } else {
      const filtered = drivers.filter(driver =>
        driver.conductor.toLowerCase().includes(searchText.toLowerCase()) ||
        driver.placa.toLowerCase().includes(searchText.toLowerCase()) ||
        driver.numeroCompetidor.toString().includes(searchText)
      );
      setFilteredDrivers(filtered);
    }
  }, [searchText, drivers]);

  const handleResetDriverVotes = (driver: Driver) => {
    Alert.alert(
      'Reiniciar Votos del Piloto',
      `¿Estás seguro de que quieres reiniciar los votos de ${driver.conductor}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = getFirestore();
              await updateDoc(doc(db, 'drivers', driver.id), { NumeroLikes: 0 });
              
              // Eliminar todos los likes de la subcolección
              const likesCol = collection(db, 'drivers', driver.id, 'likes');
              const likesSnapshot = await getDocs(likesCol);
              
              for (const likeDoc of likesSnapshot.docs) {
                await deleteDoc(doc(db, 'drivers', driver.id, 'likes', likeDoc.id));
              }
              
              Alert.alert('✅ Éxito', 'Votos del piloto reiniciados correctamente');
              loadDrivers(); // Recargar lista
            } catch (error) {
              Alert.alert('❌ Error', 'No se pudieron reiniciar los votos del piloto');
            }
          }
        }
      ]
    );
  };

  const handleDeleteDriver = (driver: Driver) => {
    Alert.alert(
      'Eliminar Piloto',
      `¿Estás seguro de que quieres eliminar a ${driver.conductor}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = getFirestore();
              
              // Eliminar todos los likes de la subcolección
              const likesCol = collection(db, 'drivers', driver.id, 'likes');
              const likesSnapshot = await getDocs(likesCol);
              
              for (const likeDoc of likesSnapshot.docs) {
                await deleteDoc(doc(db, 'drivers', driver.id, 'likes', likeDoc.id));
              }
              
              // Eliminar el piloto
              await deleteDoc(doc(db, 'drivers', driver.id));
              
              Alert.alert('✅ Éxito', 'Piloto eliminado correctamente');
              loadDrivers(); // Recargar lista
            } catch (error) {
              Alert.alert('❌ Error', 'No se pudo eliminar el piloto');
            }
          }
        }
      ]
    );
  };

  const handleEditDriver = async (driver: Driver) => {
    try {
      const db = getFirestore();
      const driverRef = doc(db, 'drivers', driver.id);
      const driverDoc = await getDoc(driverRef);
      const driverData = driverDoc.data();
      setEditDriver(driver);
      setEditName(driverData?.conductor || '');
      setEditNumber(driverData?.numeroCompetidor ? String(driverData.numeroCompetidor) : '');
      setEditPlate(driverData?.placa || '');
      setEditImageUrl(driverData?.imageUrl || '');
      setEditModalVisible(true);
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudieron cargar los datos del piloto para editar');
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setEditImageUrl(result.assets[0].uri);
    }
  };

  const handleSaveEdit = async () => {
    if (!editDriver) return;
    try {
      const db = getFirestore();
      const driverRef = doc(db, 'drivers', editDriver.id);
      await updateDoc(driverRef, {
        conductor: editName,
        numeroCompetidor: Number(editNumber),
        placa: editPlate,
        imageUrl: editImageUrl,
      });
      setEditModalVisible(false);
      setEditDriver(null);
      loadDrivers();
      Alert.alert('✅ Éxito', 'Piloto actualizado correctamente');
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo actualizar el piloto');
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return colors.trophyGold; // Oro
      case 1: return colors.trophySilver; // Plata
      case 2: return colors.trophyBronze; // Bronce
      default: return colors.textSecondary;
    }
  };

  const renderDriverItem = ({ item, index }: { item: Driver; index: number }) => (
    <View style={styles.driverCard}>
      <View style={styles.driverInfo}>
        <View style={styles.driverHeader}>
          <View style={[styles.rankBadge, { backgroundColor: getRankColor(index) }]}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>{item.conductor}</Text>
            <Text style={styles.driverPlate}>Placa: {item.placa}</Text>
            <Text style={styles.driverCompetitor}>Competidor #{item.numeroCompetidor}</Text>
            <Text style={styles.driverVotes}>{item.NumeroLikes || 0} votos</Text>
          </View>
        </View>
        <View style={styles.driverStats}>
          <Text style={styles.driverStat}>
            Likes únicos: {item.likes?.length || 0}
          </Text>
          <Text style={styles.driverStat}>
            Promedio: {item.NumeroLikes > 0 ? (item.NumeroLikes / (item.likes?.length || 1)).toFixed(1) : 0}
          </Text>
        </View>
      </View>
      <View style={styles.driverActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]} 
          onPress={() => handleEditDriver(item)}
        >
          <Ionicons name="create" size={16} color={colors.background} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.resetButton]} 
          onPress={() => handleResetDriverVotes(item)}
        >
          <Ionicons name="refresh" size={16} color={colors.background} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={() => handleDeleteDriver(item)}
        >
          <Ionicons name="trash" size={16} color={colors.background} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="refresh" size={40} color={colors.loading} />
        <Text style={styles.loadingText}>Cargando pilotos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="car-sport" size={40} color={colors.icon} />
        <Text style={styles.title}>Gestión de Pilotos</Text>
        <Text style={styles.subtitle}>{filteredDrivers.length} pilotos encontrados</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, placa o número..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Drivers List */}
      <FlatList
        data={filteredDrivers}
        renderItem={renderDriverItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={loadDrivers}>
        <Ionicons name="refresh" size={20} color={colors.background} />
        <Text style={styles.refreshText}>Actualizar</Text>
      </TouchableOpacity>

      {/* Modal de edición */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Piloto</Text>
            {/* Imagen actual */}
            {editImageUrl ? (
              <Image source={{ uri: editImageUrl }} style={styles.modalImage} />
            ) : (
              <View style={styles.modalImagePlaceholder}>
                <Ionicons name="image" size={36} color={colors.subtitle} />
              </View>
            )}
            <TouchableOpacity onPress={handlePickImage} style={styles.modalImageButton}>
              <Text style={styles.modalImageButtonText}>Cambiar imagen</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.modalInput}
              placeholder="Nombre"
              placeholderTextColor={colors.placeholder}
              value={editName}
              onChangeText={setEditName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Número de Competidor"
              placeholderTextColor={colors.placeholder}
              value={editNumber}
              onChangeText={setEditNumber}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Placa"
              placeholderTextColor={colors.placeholder}
              value={editPlate}
              onChangeText={setEditPlate}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Link de la foto (imageUrl)"
              placeholderTextColor={colors.placeholder}
              value={editImageUrl}
              onChangeText={text => {
                // Si es un link de Google Drive, convertirlo automáticamente
                const match = text.match(/drive\.google\.com\/file\/d\/([\w-]+)\//);
                if (match) {
                  const id = match[1];
                  setEditImageUrl(`https://drive.google.com/uc?export=view&id=${id}`);
                } else {
                  setEditImageUrl(text);
                }
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveButton} onPress={handleSaveEdit}>
                <Text style={styles.modalSaveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  driverCard: {
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
  driverInfo: {
    flex: 1,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  rankText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 14,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.title,
  },
  driverPlate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  driverCompetitor: {
    fontSize: 12,
    color: colors.title,
    fontWeight: 'bold',
    marginTop: 2,
  },
  driverVotes: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: 'bold',
  },
  driverStats: {
    marginTop: 5,
  },
  driverStat: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  driverActions: {
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
  editButton: {
    backgroundColor: colors.primary, // Rojo del tema para editar
  },
  resetButton: {
    backgroundColor: colors.warning,
  },
  deleteButton: {
    backgroundColor: colors.error,
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
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Estilos del modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: 320,
    shadowColor: colors.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.title,
    textAlign: 'center',
  },
  modalImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageButton: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalImageButtonText: {
    color: colors.primary,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalCancelButtonText: {
    color: colors.subtitle,
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalSaveButtonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DriversListScreen; 