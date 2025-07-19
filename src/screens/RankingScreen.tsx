import React, { useEffect, useState, useRef, memo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { subscribeToDrivers, subscribeToContestConfig, getContestConfig } from '../services/firestoreService';
import colors from '../theme/colors';

interface Driver {
  id: string;
  numeroCompetidor: number;
  NumeroLikes: number;
  conductor: string;
  imagen: string; // Cambiar de imageUrl a imagen
  placa: string;
}

const COLORS = [
  { border: '#43a047', shadow: 'rgba(67,160,71,0.25)' },    // 1° verde
  { border: '#1976d2', shadow: 'rgba(25,118,210,0.25)' },   // 2° azul
  { border: '#fb8c00', shadow: 'rgba(251,140,0,0.25)' },    // 3° naranja
];

const RankingScreen = () => {
  const styles = createStyles(colors);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [contestActive, setContestActive] = useState(true);

  const pulseAnim = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  useEffect(() => {
    // Suscripción en tiempo real a los pilotos
    const unsubscribeDrivers = subscribeToDrivers((data) => {
      setDrivers(data.sort((a, b) => b.NumeroLikes - a.NumeroLikes));
      setLoading(false);
    });

    // Suscripción en tiempo real a la configuración del concurso
    const unsubscribeConfig = subscribeToContestConfig((config) => {
      setContestActive(config.isActive);
    });

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

    // Cleanup de suscripciones
    return () => {
      unsubscribeDrivers();
      unsubscribeConfig();
    };
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
            <Text style={styles.cornerNumberText}>{item.numeroCompetidor}</Text>
          </View>
          <View style={{ position: 'relative', marginRight: 18 }}>
            <Image
              source={item.imagen && item.imagen.trim() !== ''
                ? { uri: item.imagen }
                : require('../../assets/icon.png')
              }
              style={styles.compactImage}
            />
          </View>
          <View style={styles.infoCompact}>
            <Text style={styles.nameCompact}>{item.conductor}</Text>
            <Text style={styles.plateCompact}>{item.placa}</Text>
            <View style={styles.likesRowCompact}>
              <Ionicons name="heart" size={16} color={colors.icon} />
              <Text style={styles.likesCountCompact}>{item.NumeroLikes}</Text>
            </View>
          </View>
        </Animated.View>
      );
    }
    return (
      <View style={styles.cardRow}>
        <View style={styles.cornerNumberCard}>
          <Text style={styles.cornerNumberText}>{item.numeroCompetidor}</Text>
        </View>
        <View style={{ position: 'relative', marginRight: 18 }}>
          <Image
            source={item.imagen && item.imagen.trim() !== ''
              ? { uri: item.imagen }
              : require('../../assets/icon.png')
            }
            style={styles.compactImage}
          />
        </View>
        <View style={styles.infoCompact}>
          <Text style={styles.nameCompact}>{item.conductor}</Text>
          <Text style={styles.plateCompact}>{item.placa}</Text>
          <View style={styles.likesRowCompact}>
            <Ionicons name="heart" size={16} color={colors.icon} />
            <Text style={styles.likesCountCompact}>{item.NumeroLikes}</Text>
          </View>
        </View>
      </View>
    );
  });

  if (loading) {
    return <ActivityIndicator size="large" color={colors.loading} style={{ flex: 1, marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ranking en Vivo</Text>
      
      {!contestActive && (
        <View style={styles.contestPausedContainer}>
          <Ionicons name="pause-circle" size={24} color={colors.icon} />
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
    marginBottom: 16,
    textAlign: 'center',
  },
  contestPausedContainer: {
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  contestPausedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.error,
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
    color: colors.primary,
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
    color: '#2c3e50',
  },
  plate: {
    fontSize: 15,
    color: '#7f8c8d',
    marginTop: 2,
  },
  competitor: {
    fontSize: 13,
    color: colors.primary,
    marginTop: 2,
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  likesCount: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  competitorCircle: {
    width: 40, // antes 54
    height: 40, // antes 54
    borderRadius: 20, // antes 27
    backgroundColor: '#fff5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8, // antes 14
  },
  competitorNumber: {
    fontSize: 20, // antes 28
    fontWeight: 'bold',
    color: colors.primary,
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
    backgroundColor: colors.card,
    borderRadius: 16, // antes 12
    marginBottom: 18, // antes 12
    elevation: 4, // antes 3
    shadowColor: colors.shadow,
    shadowOpacity: 0.15, // antes 0.10
    shadowRadius: 10, // antes 8
    shadowOffset: { width: 0, height: 3 }, // antes 2
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
    backgroundColor: '#fff5f5',
    borderRadius: 14, // antes 10
    paddingVertical: 4,
    paddingHorizontal: 8,
    zIndex: 1,
  },
  cornerNumberText: {
    fontSize: 20, // antes 16
    fontWeight: 'bold',
    color: colors.primary,
  },
  infoCompact: {
    flex: 1,
    marginLeft: 10,
  },
  nameCompact: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  plateCompact: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 2,
  },
  likesRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  likesCountCompact: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  cornerNumberCard: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#fff5f5',
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 8,
    zIndex: 1,
  },
});

export default RankingScreen; 