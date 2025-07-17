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
            toValue: 1.04, // antes 1.2
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
          }),
        ])
      ).start();
    });

    return () => unsubscribe();
  }, []);

  const MemoDriverCard = memo(({ item, index, pulseAnim }: { item: Driver; index: number; pulseAnim: Animated.Value[] }) => {
    const isTop3 = index < 3;
    const color = COLORS[index] || COLORS[2];
    if (isTop3) {
      // Solo animar la escala para depuración
      const animatedScale = pulseAnim[index].interpolate({ inputRange: [1, 1.08], outputRange: [1, 1.08] });
      return (
        <Animated.View
          style={[
            styles.cardRow,
            {
              position: 'relative',
              borderWidth: 3,
              borderColor: color.border,
              backgroundColor: '#fff',
              transform: [{ scale: animatedScale }],
            },
          ]}
        >
          <View style={styles.cornerNumberCard}>
            <Text style={styles.cornerNumberText}>{item.NCompetidor}</Text>
          </View>
          <View style={{ position: 'relative', marginRight: 18 }}>
            <Image
              source={item.imageUrl && item.imageUrl.trim() !== ''
                ? { uri: item.imageUrl }
                : require('../../assets/icon.png')
              }
              style={styles.compactImage}
            />
          </View>
          <View style={styles.infoCompact}>
            <Text style={styles.nameCompact}>{item.conductor}</Text>
            <Text style={styles.plateCompact}>{item.placa}</Text>
            <View style={styles.likesRowCompact}>
              <Ionicons name="heart" size={16} color="#d32f2f" />
              <Text style={styles.likesCountCompact}>{item.NumeroLikes}</Text>
            </View>
          </View>
        </Animated.View>
      );
    }
    return (
      <View style={styles.cardRow}>
        <View style={styles.cornerNumberCard}>
          <Text style={styles.cornerNumberText}>{item.NCompetidor}</Text>
        </View>
        <View style={{ position: 'relative', marginRight: 18 }}>
          <Image
            source={item.imageUrl && item.imageUrl.trim() !== ''
              ? { uri: item.imageUrl }
              : require('../../assets/icon.png')
            }
            style={styles.compactImage}
          />
        </View>
        <View style={styles.infoCompact}>
          <Text style={styles.nameCompact}>{item.conductor}</Text>
          <Text style={styles.plateCompact}>{item.placa}</Text>
          <View style={styles.likesRowCompact}>
            <Ionicons name="heart" size={16} color="#d32f2f" />
            <Text style={styles.likesCountCompact}>{item.NumeroLikes}</Text>
          </View>
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
  competitorCircle: {
    width: 40, // antes 54
    height: 40, // antes 54
    borderRadius: 20, // antes 27
    backgroundColor: '#e0f2f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8, // antes 14
  },
  competitorNumber: {
    fontSize: 20, // antes 28
    fontWeight: 'bold',
    color: '#1a237e',
  },
  bigImage: {
    width: 70, // antes 90
    height: 70, // antes 90
    borderRadius: 35, // antes 45
    marginRight: 10, // antes 16
    backgroundColor: '#eee',
  },
  animatedCard: {
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
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16, // antes 12
    marginBottom: 18, // antes 12
    elevation: 3, // antes 2
    shadowColor: '#000',
    shadowOpacity: 0.10, // antes 0.08
    shadowRadius: 8, // antes 4
    shadowOffset: { width: 0, height: 2 }, // antes 1
    padding: 12, // antes 10
    alignSelf: 'center',
    maxWidth: '98%', // antes 92%
    width: '98%', // antes 92%
  },
  compactImage: {
    width: 110, // antes 50
    height: 110, // antes 50
    borderRadius: 40, // antes 25
    marginRight: 0, // antes 10
    marginLeft: 40, // nuevo margen izquierdo para separar la imagen del borde
    backgroundColor: '#eee',
  },
  cornerNumber: {
    position: 'absolute',
    top: 2, // antes 0
    left: 2, // antes 0
    backgroundColor: '#e0f2f7',
    borderRadius: 14, // antes 10
    paddingVertical: 4,
    paddingHorizontal: 8,
    zIndex: 1,
  },
  cornerNumberText: {
    fontSize: 20, // antes 16
    fontWeight: 'bold',
    color: '#1a237e',
  },
  infoCompact: {
    flex: 1,
    marginLeft: 10,
  },
  nameCompact: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#263238',
  },
  plateCompact: {
    fontSize: 13,
    color: '#607d8b',
    marginTop: 2,
  },
  likesRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  likesCountCompact: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  cornerNumberCard: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#e0f2f7',
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 8,
    zIndex: 1,
  },
});

export default RankingScreen; 