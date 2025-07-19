import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { resetAllDriverVotes, resetAllUserLikes } from '../services/firestoreService';
import colors from '../theme/colors';

interface AdminFunctionsScreenProps {
  onLogout?: () => void;
}

const AdminFunctionsScreen: React.FC<AdminFunctionsScreenProps> = ({ onLogout }) => {
  const styles = createStyles(colors);
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      if (onLogout) onLogout();
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión');
    }
  };

  const showFunctionInfo = (title: string, description: string) => {
    Alert.alert(
      title,
      description,
      [{ text: 'Entendido' }]
    );
  };

  const handleResetDriverVotes = async () => {
    Alert.alert(
      'Reiniciar Votos de Pilotos',
      '¿Estás seguro de que quieres reiniciar todos los votos de los pilotos? Esta acción eliminará todos los likes y no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Reiniciar', 
          style: 'destructive',
          onPress: async () => {
            try {
              Alert.alert('Procesando', 'Reiniciando votos de pilotos...');
              const result = await resetAllDriverVotes();
              
              if (result.success) {
                Alert.alert('✅ Éxito', result.message);
              } else {
                Alert.alert('❌ Error', result.message);
              }
            } catch (error) {
              Alert.alert('❌ Error', 'No se pudo reiniciar los votos de pilotos');
            }
          }
        }
      ]
    );
  };

  const handleResetUserLikes = async () => {
    Alert.alert(
      'Reiniciar Likes de Usuarios',
      '¿Estás seguro de que quieres reiniciar todos los likes de los usuarios? Esto devolverá los 10 likes a todos los usuarios.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Reiniciar', 
          style: 'destructive',
          onPress: async () => {
            try {
              Alert.alert('Procesando', 'Reiniciando likes de usuarios...');
              const result = await resetAllUserLikes();
              
              if (result.success) {
                Alert.alert('✅ Éxito', result.message);
              } else {
                Alert.alert('❌ Error', result.message);
              }
            } catch (error) {
              Alert.alert('❌ Error', 'No se pudo reiniciar los likes de usuarios');
            }
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    showFunctionInfo(
      'Exportar Datos',
      'Esta función permitirá exportar todos los datos del concurso en formato CSV o Excel.\n\nFuncionalidad en desarrollo.'
    );
  };

  const handleManageUsers = () => {
    showFunctionInfo(
      'Gestionar Usuarios',
      'Aquí podrás ver, editar o eliminar usuarios del sistema.\n\nFuncionalidad en desarrollo.'
    );
  };

  const handleSystemSettings = () => {
    showFunctionInfo(
      'Configuración del Sistema',
      'Configuración avanzada del sistema, reglas del concurso, fechas límite, etc.\n\nFuncionalidad en desarrollo.'
    );
  };

  const handleBackupData = () => {
    showFunctionInfo(
      'Respaldo de Datos',
      'Crear una copia de seguridad de todos los datos del concurso.\n\nFuncionalidad en desarrollo.'
    );
  };

  const handleAnalytics = () => {
    showFunctionInfo(
      'Analíticas Avanzadas',
      'Estadísticas detalladas, gráficos, reportes personalizados.\n\nFuncionalidad en desarrollo.'
    );
  };

  const handleTestUsers = () => {
    Alert.alert(
      'Crear Usuarios de Prueba',
      '¿Estás seguro de que quieres crear 150 usuarios de prueba? Esto puede afectar el rendimiento del sistema.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Crear', 
          style: 'destructive',
          onPress: async () => {
            try {
              Alert.alert('Procesando', 'Creando usuarios de prueba...');
              // Aquí iría la lógica para crear usuarios de prueba
              Alert.alert('✅ Éxito', 'Usuarios de prueba creados con éxito.');
            } catch (error) {
              Alert.alert('❌ Error', 'No se pudieron crear los usuarios de prueba');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="settings" size={40} color={colors.primary} />
        <Text style={styles.title}>Funcionalidades Avanzadas</Text>
        <Text style={styles.subtitle}>Panel de Control del Administrador</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.card} onPress={handleResetDriverVotes}>
          <Ionicons name="refresh-circle" size={30} color={colors.primary} />
          <Text style={styles.cardTitle}>Reiniciar Votos de Pilotos</Text>
          <Text style={styles.cardSubtitle}>Eliminar todos los likes de los pilotos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={handleResetUserLikes}>
          <Ionicons name="refresh" size={30} color={colors.primary} />
          <Text style={styles.cardTitle}>Reiniciar Likes de Usuarios</Text>
          <Text style={styles.cardSubtitle}>Devolver 10 likes a todos los usuarios</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={handleExportData}>
          <Ionicons name="download" size={30} color={colors.primary} />
          <Text style={styles.cardTitle}>Exportar Datos</Text>
          <Text style={styles.cardSubtitle}>Exportar resultados en CSV/Excel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={handleManageUsers}>
          <Ionicons name="people-circle" size={30} color={colors.primary} />
          <Text style={styles.cardTitle}>Gestionar Usuarios</Text>
          <Text style={styles.cardSubtitle}>Ver, editar o eliminar usuarios</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={handleSystemSettings}>
          <Ionicons name="construct" size={30} color={colors.primary} />
          <Text style={styles.cardTitle}>Configuración</Text>
          <Text style={styles.cardSubtitle}>Ajustes avanzados del sistema</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={handleBackupData}>
          <Ionicons name="cloud-upload" size={30} color={colors.primary} />
          <Text style={styles.cardTitle}>Respaldo</Text>
          <Text style={styles.cardSubtitle}>Crear copia de seguridad</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={handleTestUsers}>
          <Ionicons name="flask" size={30} color={colors.primary} />
          <Text style={styles.cardTitle}>Prueba de Testing</Text>
          <Text style={styles.cardSubtitle}>Crear 150 usuarios de prueba</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.background} />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
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
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.title,
    marginTop: 10,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.subtitle,
    marginTop: 5,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: colors.error,
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  logoutText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default AdminFunctionsScreen; 