import React, { useEffect, useState, useRef, memo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { subscribeToDrivers, getContestConfig } from '../services/firestoreService';

interface Driver {
  id: string;
  NCompetidor: number;
  NumeroLikes: number;
  conductor: string;
  imageUrl: string;
  placa: string;
}

const COLORS = [
  { border: '#43a047', shadow: 'rgba(67,160,71,0.25)' },    // 1° verde
  { border: '#1976d2', shadow: 'rgba(25,118,210,0.25)' },   // 2° azul
  { border: '#fb8c00', shadow: 'rgba(251,140,0,0.25)' },    // 3° naranja
];

const RankingScreen = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [contestActive, setContestActive] = useState(true);

  const pulseAnim = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  useEffect(() => {
    const unsubscribe = subscribeToDrivers((data) => {
      setDrivers(data.sort((a, b) => b.NumeroLikes - a.NumeroLikes));
      setLoading(false);
    });

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

    return () => unsubscribe();
  }, []);

  const MemoDriverCard = memo(({ item, index, pulseAnim }: { item: Driver; index: number; pulseAnim: Animated.Value[] }) => {
    if (index < 3) {
      const color = COLORS[index];
      return (
        <Animated.View
          style={[
            styles.card,
            {
              borderColor: color.border,
              borderWidth: 2,
              shadowColor: color.border,
              shadowOpacity: 0.5,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              backgroundColor: '#fff',
              transform: [{ scale: pulseAnim[index] }],
              alignSelf: 'center',
              maxWidth: '92%',
              width: '92%',
            },
          ]}
        >
          <Text style={[styles.position, { color: color.border }]}>{index + 1}</Text>
          <Image
            source={item.imageUrl && item.imageUrl.trim() !== ''
              ? { uri: item.imageUrl }
              : require('../../assets/icon.png')
            }
            style={[
              styles.image,
              {
                borderColor: color.border,
                borderWidth: 2,
                shadowColor: color.shadow,
                shadowOpacity: 0.7,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 4 },
              },
            ]}
          />
          <View style={styles.info}>
            <Text style={styles.name}>{item.conductor}</Text>
            <Text style={styles.plate}>Placa: {item.placa}</Text>
            <Text style={styles.competitor}>Competidor #{item.NCompetidor}</Text>
          </View>
          <View style={styles.likesRow}>
            <Ionicons name="heart" size={22} color="#d32f2f" />
            <Text style={styles.likesCount}>{item.NumeroLikes}</Text>
          </View>
        </Animated.View>
      );
    }
    return (
      <View style={styles.card}>
        <Text style={styles.position}>{index + 1}</Text>
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
        </View>
        <View style={styles.likesRow}>
          <Ionicons name="heart" size={22} color="#d32f2f" />
          <Text style={styles.likesCount}>{item.NumeroLikes}</Text>
        </View>
      </View>
    );
  });

  if (loading) {
    return <ActivityIndicator size="large" color="#1a237e" style={{ flex: 1, marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ranking en Vivo</Text>
      
      {!contestActive && (
        <View style={styles.contestPausedContainer}>
          <Ionicons name="pause-circle" size={24} color="#ff9800" />
          <Text style={styles.contestPausedText}>Concurso Pausado</Text>
        </View>
      )}
      
      <FlatList
        data={drivers}
        renderItem={({ item, index }) => (
          <MemoDriverCard item={item} index={index} pulseAnim={pulseAnim} />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
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
    marginBottom: 16,
    textAlign: 'center',
  },
  contestPausedContainer: {
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff9800',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  contestPausedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e65100',
    marginLeft: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    padding: 10,
    alignSelf: 'center',
    maxWidth: '92%',
    width: '92%',
    marginTop: 5,
  },
  position: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a237e',
    width: 32,
    textAlign: 'center',
  },
  image: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#263238',
  },
  plate: {
    fontSize: 15,
    color: '#607d8b',
    marginTop: 2,
  },
  competitor: {
    fontSize: 13,
    color: '#90caf9',
    marginTop: 2,
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  likesCount: {
    fontSize: 18,
    color: '#d32f2f',
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default RankingScreen; 