import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');

interface WelcomeScreenProps {
  onLogin: () => void;
  onRegister: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLogin, onRegister }) => {
  const styles = createStyles(colors);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  return (
    <ImageBackground source={require('../assets/fondos/fondo_principal.png')} style={styles.bgImage} resizeMode="cover">
      <View style={styles.overlay}>
        {/* Icono de tractomula en círculo blanco */}
        <View style={styles.iconCircle}>
          <Ionicons name="bus" size={48} color={colors.primary} />
        </View>
        <Text style={styles.title}>Concurso Nacional de Tractomulas 2025</Text>
        <Text style={styles.slogan}>Vive la pasión por la carretera!</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'login' ? styles.tabButtonActive : styles.tabButtonInactive]}
            onPress={() => {
              console.log('Login button pressed');
              setActiveTab('login');
              onLogin();
            }}
          >
            <Text style={[styles.tabButtonText, activeTab === 'login' ? styles.tabButtonTextActive : styles.tabButtonTextInactive]}>Iniciar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'register' ? styles.tabButtonActiveOutline : styles.tabButtonInactive]}
            onPress={() => {
              console.log('Register button pressed');
              setActiveTab('register');
              onRegister();
            }}
          >
            <Text style={[styles.tabButtonText, activeTab === 'register' ? styles.tabButtonTextActiveOutline : styles.tabButtonTextInactive]}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center', // Cambiado de 'flex-start' a 'center' para centrar verticalmente
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 0,
  },
  // Fondo artístico con blobs y waves
  bgLayer1: {
    position: 'absolute',
    top: -80,
    left: -60,
    width: width * 1.3,
    height: 340,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 180,
    borderBottomRightRadius: 220,
    borderTopRightRadius: 120,
    opacity: 0.95,
    zIndex: -3,
  },
  bgLayer2: {
    position: 'absolute',
    top: 120,
    left: -40,
    width: width * 1.1,
    height: 180,
    backgroundColor: '#fff',
    borderTopLeftRadius: 120,
    borderTopRightRadius: 180,
    borderBottomRightRadius: 120,
    opacity: 0.7,
    zIndex: -2,
  },
  bgLayer3: {
    position: 'absolute',
    top: 220,
    right: -60,
    width: width * 0.8,
    height: 120,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
    borderBottomLeftRadius: 120,
    opacity: 0.5,
    zIndex: -1,
  },
  iconCircle: {
    backgroundColor: colors.background,
    borderRadius: 50,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 24,
    elevation: 6,
    shadowColor: colors.primary,
    shadowOpacity: 0.20,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  slogan: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 0,
  },
  tabButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 130,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  tabButtonActiveOutline: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  tabButtonInactive: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabButtonTextActive: {
    color: colors.background,
  },
  tabButtonTextActiveOutline: {
    color: colors.primary,
  },
  tabButtonTextInactive: {
    color: colors.primary,
  },
});

export default WelcomeScreen; 