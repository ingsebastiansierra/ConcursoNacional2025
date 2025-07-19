import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { subscribeToDrivers, likeDriver, subscribeToUserVotes, getDriverLikes, subscribeToContestConfig } from '../services/firestoreService';
import { getAuth } from 'firebase/auth';
import colors from '../theme/colors';

interface Driver {
  id: string;
  numeroCompetidor: number;
  NumeroLikes: number;
  conductor: string;
  imageUrl: string;
  placa: string;
}

const MAX_VOTES = 10;

const VoteScreen = () => {
  const styles = createStyles(colors);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState<string | null>(null);
  const [votesUsed, setVotesUsed] = useState<number>(0);
  const [likesModalVisible, setLikesModalVisible] = useState(false);
  const [likesList, setLikesList] = useState<{userId: string, userName: string}[]>([]);
  const [modalDriver, setModalDriver] = useState<Driver | null>(null);
  const [contestActive, setContestActive] = useState(true);
  const user = getAuth().currentUser;
  const userId = user?.uid || '';

  useEffect(() => {
    // Suscripción en tiempo real a los pilotos
    const unsubscribeDrivers = subscribeToDrivers((data) => {
      setDrivers(data.sort((a, b) => a.numeroCompetidor - b.numeroCompetidor));
      setLoading(false);
    });

    // Suscripción en tiempo real a los votos del usuario
    let unsubscribeVotes = () => {};
    if (userId) {
      unsubscribeVotes = subscribeToUserVotes(userId, setVotesUsed);
    }

    // Suscripción en tiempo real a la configuración del concurso
    const unsubscribeConfig = subscribeToContestConfig((config) => {
      setContestActive(config.isActive);
    });

    return () => {
      unsubscribeDrivers();
      unsubscribeVotes();
      unsubscribeConfig();
    };
  }, [userId]);

  const handleLike = async (id: string) => {
    if (!contestActive) {
      Alert.alert('Concurso Pausado', 'El concurso está pausado. No se pueden emitir votos en este momento.');
      return;
    }
    
    if (votesUsed >= MAX_VOTES) {
      Alert.alert('Límite alcanzado', 'Ya usaste tus 10 votos disponibles.');
      return;
    }
    
    setLiking(id);
    const result = await likeDriver(id, userId);
    setLiking(null);
    
    if (!result.success) {
      Alert.alert('Error', result.message);
    }
  };

  const handleShowLikes = async (driver: Driver) => {
    setModalDriver(driver);
    setLikesModalVisible(true);
    const likes = await getDriverLikes(driver.id);
    // Agrupar por usuario
    const grouped = likes.reduce((acc: Record<string, { userName: string; count: number }>, like) => {
      if (!acc[like.userId]) {
        acc[like.userId] = { userName: like.userName, count: 1 };
      } else {
        acc[like.userId].count += 1;
      }
      return acc;
    }, {});
    // Convertir a array
    const groupedArray = Object.values(grouped);
    setLikesList(groupedArray);
  };

  const renderDriver = ({ item }: { item: Driver }) => (
    <View style={styles.card}>
      <Image 
        source={item.imageUrl && item.imageUrl.trim() !== '' 
          ? { uri: item.imageUrl } 
          : require('../../assets/icon.png')
        } 
        style={styles.image}
        defaultSource={require('../../assets/icon.png')}
        onError={() => console.log('Error cargando imagen para el piloto:', item.conductor)}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.conductor}</Text>
        <Text style={styles.plate}>Placa: {item.placa}</Text>
        <Text style={styles.competitor}>Competidor #{item.numeroCompetidor}</Text>
        <View style={styles.likesRow}>
          <TouchableOpacity
            style={[
              styles.likeButton, 
              (votesUsed >= MAX_VOTES || !contestActive) && { opacity: 0.5 }
            ]}
            onPress={() => handleLike(item.id)}
            disabled={liking === item.id || votesUsed >= MAX_VOTES || !contestActive}
          >
            <Ionicons name="heart" size={24} color={colors.icon} />
            <Text style={styles.likeText}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleShowLikes(item)}>
            <Text style={styles.likesCount}>{item.NumeroLikes} Me gusta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color={colors.loading} style={{ flex: 1, marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Vota por tu piloto favorito!</Text>
      
      {!contestActive && (
        <View style={styles.contestPausedContainer}>
          <Ionicons name="pause-circle" size={32} color={colors.warning} />
          <Text style={styles.contestPausedText}>El concurso está pausado</Text>
          <Text style={styles.contestPausedSubtext}>No se pueden emitir votos en este momento</Text>
        </View>
      )}
      
              <Text style={styles.votesLeft}>Te quedan <Text style={{ color: votesUsed >= MAX_VOTES ? colors.error : colors.primary, fontWeight: 'bold' }}>{MAX_VOTES - votesUsed}</Text> votos</Text>
      {votesUsed >= MAX_VOTES && (
        <Text style={styles.warning}>Ya no tienes más likes disponibles.</Text>
      )}
      <FlatList
        data={drivers}
        renderItem={renderDriver}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
      <Modal
        visible={likesModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLikesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Likes de {modalDriver?.conductor}</Text>
            <FlatList
              data={likesList}
              keyExtractor={(_, idx) => idx.toString()}
              renderItem={({ item }) => (
                <View style={styles.likeUserRow}>
                  <Ionicons name="person-circle" size={24} color={colors.icon} style={{ marginRight: 8 }} />
                  <Text style={styles.likeUserName}>{item.userName}</Text>
                  <Text style={styles.likeUserCount}> — {item.count} like{item.count > 1 ? 's' : ''}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888' }}>Aún no hay likes</Text>}
            />
            <Pressable style={styles.closeButton} onPress={() => setLikesModalVisible(false)}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </Pressable>
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
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.title,
    marginTop: 32,
    marginBottom: 8,
    textAlign: 'center',
  },
  votesLeft: {
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  warning: {
    color: colors.error,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  contestPausedContainer: {
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  contestPausedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.error,
    marginTop: 8,
    textAlign: 'center',
  },
  contestPausedSubtext: {
    fontSize: 14,
    color: '#c0392b',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    padding: 12,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: '#eee',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  plate: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 2,
  },
  competitor: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 2,
    marginBottom: 6,
    fontWeight: '600',
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#fff5f5',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  likeText: {
    color: colors.primary,
    marginLeft: 6,
    fontWeight: 'bold',
  },
  likesCount: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.title,
    marginBottom: 16,
    textAlign: 'center',
  },
  likeUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  likeUserName: {
    fontSize: 17,
    color: '#2c3e50',
  },
  likeUserCount: {
    fontSize: 16,
    color: '#7f8c8d',
    marginLeft: 6,
  },
  closeButton: {
    marginTop: 18,
    backgroundColor: colors.buttonPrimary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default VoteScreen; 