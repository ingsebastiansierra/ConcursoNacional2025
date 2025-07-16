import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { subscribeToDrivers } from '../services/firestoreService';

interface Driver {
  id: string;
  NCompetidor: number;
  NumeroLikes: number;
  conductor: string;
  imageUrl: string;
  placa: string;
}

const RankingScreen = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToDrivers((data) => {
      setDrivers(data.sort((a, b) => b.NumeroLikes - a.NumeroLikes));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const renderDriver = ({ item, index }: { item: Driver; index: number }) => (
    <View style={styles.card}>
      <Text style={styles.position}>{index + 1}</Text>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
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

  if (loading) {
    return <ActivityIndicator size="large" color="#1a237e" style={{ flex: 1, marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ranking en Vivo</Text>
      <FlatList
        data={drivers}
        renderItem={renderDriver}
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