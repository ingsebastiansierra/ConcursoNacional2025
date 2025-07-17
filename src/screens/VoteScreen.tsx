import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { subscribeToDrivers, likeDriver, subscribeToUserVotes, getDriverLikes, getContestConfig } from '../services/firestoreService';
import { getAuth } from 'firebase/auth';

interface Driver {
  id: string;
  NCompetidor: number;
  NumeroLikes: number;
  conductor: string;
  imageUrl: string;
  placa: string;
}

const MAX_VOTES = 10;

const VoteScreen = () => {
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
    const unsubscribeDrivers = subscribeToDrivers((data) => {
      setDrivers(data.sort((a, b) => a.NCompetidor - b.NCompetidor));
      setLoading(false);
    });
    let unsubscribeVotes = () => {};
    if (userId) {
      unsubscribeVotes = subscribeToUserVotes(userId, setVotesUsed);
    }

    // Verificar estado del concurso
    const checkContestStatus = async () => {
      try {
        const config = await getContestConfig();
        setContestActive(config.isActive);
      } catch (error) {
        console.error('Error verificando estado del concurso:', error);
      }
    };
    checkContestStatus();

    return () => {
      unsubscribeDrivers();
      unsubscribeVotes();
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
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.conductor}</Text>
        <Text style={styles.plate}>Placa: {item.placa}</Text>
        <Text style={styles.competitor}>Competidor #{item.NCompetidor}</Text>
        <View style={styles.likesRow}>
          <TouchableOpacity
            style={[
              styles.likeButton, 
              (votesUsed >= MAX_VOTES || !contestActive) && { opacity: 0.5 }
            ]}
            onPress={() => handleLike(item.id)}
            disabled={liking === item.id || votesUsed >= MAX_VOTES || !contestActive}
          >
            <Ionicons name="heart" size={24} color="#d32f2f" />
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
    return <ActivityIndicator size="large" color="#1a237e" style={{ flex: 1, marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Vota por tu piloto favorito!</Text>
      
      {!contestActive && (
        <View style={styles.contestPausedContainer}>
          <Ionicons name="pause-circle" size={32} color="#ff9800" />
          <Text style={styles.contestPausedText}>El concurso está pausado</Text>
          <Text style={styles.contestPausedSubtext}>No se pueden emitir votos en este momento</Text>
        </View>
      )}
      
      <Text style={styles.votesLeft}>Te quedan <Text style={{ color: votesUsed >= MAX_VOTES ? '#d32f2f' : '#1a237e', fontWeight: 'bold' }}>{MAX_VOTES - votesUsed}</Text> votos</Text>
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
                  <Ionicons name="person-circle" size={24} color="#1a237e" style={{ marginRight: 8 }} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f6fc',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a237e',
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
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  contestPausedContainer: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  contestPausedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e65100',
    marginTop: 8,
    textAlign: 'center',
  },
  contestPausedSubtext: {
    fontSize: 14,
    color: '#f57c00',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
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
    color: '#263238',
  },
  plate: {
    fontSize: 16,
    color: '#607d8b',
    marginTop: 2,
  },
  competitor: {
    fontSize: 14,
    color: '#90caf9',
    marginTop: 2,
    marginBottom: 6,
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
    backgroundColor: '#fff3f3',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#d32f2f',
  },
  likeText: {
    color: '#d32f2f',
    marginLeft: 6,
    fontWeight: 'bold',
  },
  likesCount: {
    fontSize: 16,
    color: '#d32f2f',
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
    color: '#1a237e',
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
    color: '#263238',
  },
  likeUserCount: {
    fontSize: 16,
    color: '#607d8b',
    marginLeft: 6,
  },
  closeButton: {
    marginTop: 18,
    backgroundColor: '#1a237e',
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