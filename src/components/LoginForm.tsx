import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authService from '../services/authService';
import { getAuth } from 'firebase/auth';

type Props = {
  onSwitch: () => void;
  onAuthSuccess?: () => void;
  onAdminAuthSuccess?: () => void;
};

const LoginForm: React.FC<Props> = ({ onSwitch, onAuthSuccess, onAdminAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const userCredential = await authService.login(email, password);
      const user = userCredential.user;
      
      // Verificar si es administrador
      const isUserAdmin = await authService.isAdmin(user);
      
      if (isUserAdmin) {
        // Si es administrador, llamar a la función específica
        if (onAdminAuthSuccess) {
          onAdminAuthSuccess();
        }
      } else {
        // Si es usuario normal, llamar a la función normal
        if (onAuthSuccess) {
          onAuthSuccess();
        }
      }
    } catch (err: any) {
      setError('Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Iniciar Sesión</Text>
        <View style={styles.inputRow}>
          <Ionicons name="mail" size={22} color="#607d8b" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed" size={22} color="#607d8b" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <Button 
          title={loading ? "Entrando..." : "Entrar"} 
          onPress={handleLogin} 
          color="#1a237e"
          disabled={loading}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <Text style={styles.switchText} onPress={onSwitch}>
          ¿No tienes cuenta? <Text style={styles.link}>Regístrate</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f6fc',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    backgroundColor: '#f6f8fa',
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#263238',
    backgroundColor: 'transparent',
  },
  error: {
    color: '#d32f2f',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
  switchText: {
    marginTop: 22,
    color: '#607d8b',
    textAlign: 'center',
    fontSize: 15,
  },
  link: {
    color: '#1a237e',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LoginForm; 