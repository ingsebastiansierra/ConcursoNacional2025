import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

// Importa la imagen de fondo
import loginFondo from '../assets/fondos/login_fondo.png';

interface AuthScreenProps {
  initialShowLogin?: boolean;
  onAuthSuccess?: () => void;
  onAdminAuthSuccess?: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ initialShowLogin = true, onAuthSuccess, onAdminAuthSuccess }) => {
  const [showLogin, setShowLogin] = useState(initialShowLogin);

  console.log('AuthScreen - initialShowLogin:', initialShowLogin, 'showLogin:', showLogin);

  return (
    <ImageBackground source={loginFondo} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        {showLogin ? (
          <LoginForm 
            onSwitch={() => setShowLogin(false)} 
            onAuthSuccess={onAuthSuccess}
            onAdminAuthSuccess={onAdminAuthSuccess}
          />
        ) : (
          <RegisterForm 
            onSwitch={() => setShowLogin(true)} 
            onAuthSuccess={onAuthSuccess} 
          />
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    // backgroundColor: 'rgba(255,255,255,0.85)', // Eliminar para que no tape el fondo
  },
});

export default AuthScreen; 