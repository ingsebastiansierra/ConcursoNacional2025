import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authService from '../services/authService';

type Props = {
  onSwitch: () => void;
  onAuthSuccess?: () => void;
};

const RegisterForm: React.FC<Props> = ({ onSwitch, onAuthSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);
    if (!name.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      await authService.register(email, password, name);
      if (onAuthSuccess) onAuthSuccess();
    } catch (err: any) {
      setError('No se pudo registrar. Intenta con otro correo.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Registro</Text>
        <View style={styles.inputRow}>
          <Ionicons name="person" size={22} color="#607d8b" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>
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
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed" size={22} color="#607d8b" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>
        <Button title="Registrarse" onPress={handleRegister} color="#1a237e" />
        {error && <Text style={styles.error}>{error}</Text>}
        <Text style={styles.switchText} onPress={onSwitch}>
          ¿Ya tienes cuenta? <Text style={styles.link}>Inicia sesión</Text>
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

export default RegisterForm; 