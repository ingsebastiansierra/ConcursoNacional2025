import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

interface AuthScreenProps {
  onAuthSuccess?: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <View style={styles.container}>
      {showLogin ? (
        <LoginForm onSwitch={() => setShowLogin(false)} onAuthSuccess={onAuthSuccess} />
      ) : (
        <RegisterForm onSwitch={() => setShowLogin(true)} onAuthSuccess={onAuthSuccess} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
});

export default AuthScreen; 