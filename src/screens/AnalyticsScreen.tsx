import React, { useState, useEffect } fromreact';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import[object Object]Ionicons } from '@expo/vector-icons';
import [object Object] getDetailedStats, getRecentActivity } from../services/firestoreService';
import { useNavigation } from @react-navigation/native';

interface AnalyticsScreenProps[object Object]  onLogout?: () => void;
}

const AnalyticsScreen: React.FC<AnalyticsScreenProps> = () =>[object Object] conststats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  consterror, setError] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    loadAnalytics();
  }, 

  const loadAnalytics = async () => {
    setLoading(true);
    setError(false);
    try {
      const [detailedStats, activity] = await Promise.all([
        getDetailedStats(),
        getRecentActivity()
      ]);
      setStats(detailedStats);
      setRecentActivity(activity);
    } catch (e) {
      setError(true);
    } finally [object Object]  setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style=[object Object][styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size=large" color="#1237 />       <Text style={styles.loadingText}>Cargando analíticas...</Text>
      </View>
    );
  }

  if (error || !stats) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size=[object Object]48olor="#d32 />       <Text style={styles.errorText}>Error al cargar las analíticas</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadAnalytics}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style=[object Object]styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size=[object Object]24olor="#137/>
        </TouchableOpacity>
        <Ionicons name=analytics" size=[object Object]40olor="#1237 />       <Text style={styles.title}>Analíticas del Concurso</Text>
        <Text style={styles.subtitle}>Estadísticas detalladas y reportes</Text>
      </View>

      <View style={styles.content}>
        {/* Estadísticas principales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Estadísticas Generales</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Usuarios"
              value={stats.totalUsers}
              icon="people"
              color="#1a237e"
            />
            <StatCard
              title="Total Pilotos"
              value={stats.totalDrivers}
              icon="car-sport"
              color="#4caf50    />
            <StatCard
              title="Total Votos"
              value={stats.totalVotes}
              icon="heart"
              color="#d32f"
            />
            <StatCard
              title="Usuarios Activos"
              value={stats.activeUsers}
              subtitle={`${stats.participationRate}% participación`}
              icon="checkmark-circle"
              color="#ff9800      />
          </View>
        </View>

        {/* Promedio y distribución */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Métricas de Participación</Text>
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Promedio de Votos por Usuario</Text>
            <Text style={styles.metricValue}>{stats.averageVotesPerUser}</Text>
          </View>
          <View style={styles.distributionContainer}>
            <Text style={styles.distributionTitle}>Distribución de Votos</Text>
            {stats.voteDistribution && Object.entries(stats.voteDistribution).map(([range, count]: any) => (
              <View key={range} style={styles.distributionRow}>
                <Text style={styles.distributionRange}>{range}</Text>
                <Text style={styles.distributionCount}>{count} usuarios</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top pilotos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Top Pilotos</Text>
          {stats.topDrivers && stats.topDrivers.map((driver: any, index: number) => (
            <View key={driver.id || index} style={styles.topDriverCard}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{driver.conductor}</Text>
                <Text style={styles.driverPlate}>Placa: {driver.placa}</Text>
              </View>
              <View style={styles.voteCount}>
                <Ionicons name="heart" size=[object Object]16olor="#d32f2f" />
                <Text style={styles.voteText}>{driver.NumeroLikes || 0}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Actividad reciente */}
        {recentActivity && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🕒 Actividad Reciente (7 días)</Text>
            <View style={styles.activityCard}>
              <Text style={styles.activityTitle}>Nuevos Usuarios</Text>
              <Text style={styles.activityCount}>{recentActivity.recentUsers.length}</Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityTitle}>Votos Emitidos</Text>
              <Text style={styles.activityCount}>{recentActivity.recentVotes.length}</Text>
            </View>
            {recentActivity.recentVotes.length > 0 && (
              <View style={styles.recentVotesContainer}>
                <Text style={styles.recentVotesTitle}>Últimos Votos</Text>
                {recentActivity.recentVotes.slice(0, 5((vote: any, index: number) => (
                  <View key={vote.id || index} style={styles.voteItem}>
                    <Text style={styles.voteUser}>{vote.userName}</Text>
                    <Text style={styles.voteAction}>votó por</Text>
                    <Text style={styles.voteDriver}>{vote.driverName}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

  [object Object]/* Botón de actualizar */}
        <TouchableOpacity style={styles.refreshButton} onPress={loadAnalytics}>
          <Ionicons name=refresh" size={20} color="#fff" />
          <Text style={styles.refreshText}>Actualizar Datos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:#f2f6fc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center,
    alignItems: 'center',
    backgroundColor:#f2f6fc',
  },
  loadingText:[object Object]
    marginTop: 16,
    fontSize: 16    color:#1a237,
  errorContainer: {
    flex: 1,
    justifyContent: 'center,
    alignItems: 'center',
    backgroundColor:#f2f6,
  },
  errorText:[object Object]
    marginTop: 16,
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
  retryButton:[object Object]
    marginTop: 16,
    backgroundColor: '#1a237 paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: [object Object]   color: '#fff',
    fontSize: 16
    fontWeight: 'bold',
  },
  header:[object Object]
    alignItems: 'center,
    marginTop: 60,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 60
    left: 20,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: #000
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: [object Object] width: 0, height: 2 },
    elevation: 3,
  },
  title: [object Object]    fontSize: 28
    fontWeight: bold,    color: '#1a237e,
    marginTop: 10,
    textAlign: 'center,
  },
  subtitle: [object Object]    fontSize:16,
    color: '#6789ab,
    marginTop:5,
    textAlign: 'center,  },
  content:[object Object]
    padding: 20  },
  section: [object Object]
    marginBottom: 30 },
  sectionTitle: [object Object]    fontSize: 20
    fontWeight: bold,    color: '#1a237e',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row,   flexWrap: 'wrap',
    justifyContent: space-between,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius:12
    padding: 16,
    marginBottom: 12    width:48%',
    borderLeftWidth: 4,
    shadowColor: #000
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: [object Object] width: 0, height: 2 },
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row,
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: [object Object]    fontSize: 14
    fontWeight: bold',
    color: '#263238,
    marginLeft: 8,
  },
  statValue: [object Object]    fontSize: 24
    fontWeight: 'bold',
  },
  statSubtitle: [object Object]    fontSize:12,
    color: '#6789ab,
    marginTop: 4,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius:12
    padding: 20,
    marginBottom: 16
    alignItems: 'center,
    shadowColor: #000
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: [object Object] width: 0, height: 2 },
    elevation: 3,
  },
  metricTitle: [object Object]    fontSize: 16
    fontWeight: bold',
    color: '#263238,
    marginBottom: 8,
  },
  metricValue: [object Object]    fontSize: 32
    fontWeight: bold,    color:#1a237e },
  distributionContainer: {
    backgroundColor: '#fff',
    borderRadius:12
    padding: 16,
    shadowColor: #000
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: [object Object] width: 0, height: 2 },
    elevation: 3,
  },
  distributionTitle: [object Object]    fontSize: 16
    fontWeight: bold',
    color: '#263238,
    marginBottom: 12,
  },
  distributionRow: {
    flexDirection: 'row',
    justifyContent:space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor:#f0f0f0 },
  distributionRange: [object Object]    fontSize:14,
    color:#263238 },
  distributionCount: [object Object]    fontSize: 14
    fontWeight: bold,    color:#1a237e',
  },
  topDriverCard: {
    backgroundColor: '#fff',
    borderRadius:12
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row,
    alignItems: 'center,
    shadowColor: #000
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: [object Object] width: 0, height: 2 },
    elevation:3,
  },
  rankBadge:[object Object]    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a237e',
    justifyContent: 'center,
    alignItems: 'center,
    marginRight: 12,
  },
  rankText: [object Object]   color: '#fff',
    fontSize: 16
    fontWeight: 'bold',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: [object Object]    fontSize: 16
    fontWeight: bold',
    color:#263238  },
  driverPlate: [object Object]    fontSize:14,
    color: '#6789ab,
    marginTop: 2,
  },
  voteCount: {
    flexDirection: 'row,
    alignItems: 'center,
  },
  voteText: [object Object]    fontSize: 16
    fontWeight: bold',
    color: '#d32f,
    marginLeft: 4 },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius:12
    padding: 16,
    marginBottom: 12
    alignItems: 'center,
    shadowColor: #000
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: [object Object] width: 0, height: 2 },
    elevation: 3},
  activityTitle: [object Object]    fontSize: 16
    fontWeight: bold',
    color: '#263238,
    marginBottom: 8},
  activityCount: [object Object]    fontSize: 24
    fontWeight: bold,    color:#1a237e',
  },
  recentVotesContainer: {
    backgroundColor: '#fff',
    borderRadius:12
    padding: 16
    marginTop: 12,
    shadowColor: #000
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: [object Object] width: 0, height: 2 },
    elevation:3  },
  recentVotesTitle: [object Object]    fontSize: 16
    fontWeight: bold',
    color: '#263238,
    marginBottom: 12,
  },
  voteItem: {
    flexDirection: 'row,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor:#f0f0f0,
  },
  voteUser: [object Object]    fontSize: 14
    fontWeight: bold,    color:#1a237
  },
  voteAction: [object Object]    fontSize:14,
    color: '#6789  marginHorizontal: 8,
  },
  voteDriver: [object Object]    fontSize: 14
    fontWeight: bold,
    color:#4caf50},
  refreshButton: {
    backgroundColor: '#1a237e',
    borderRadius: 8
    padding: 15,
    flexDirection: 'row,
    alignItems: 'center',
    justifyContent: 'center,
    marginTop: 20  },
  refreshText: [object Object]   color: '#fff',
    fontSize: 16
    fontWeight: bold,
    marginLeft: 8,
  },
});

export default AnalyticsScreen; 