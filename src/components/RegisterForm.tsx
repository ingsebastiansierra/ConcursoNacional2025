import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authService from '../services/authService';
import colors from '../theme/colors';

type Props = {
  onSwitch: () => void;
  onAuthSuccess?: () => void;
};

const RegisterForm: React.FC<Props> = ({ onSwitch, onAuthSuccess }) => {
  const styles = createStyles(colors);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);
    setInfo(null);
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
      setInfo('Registro exitoso. Te hemos enviado un correo de verificación. Por favor revisa tu bandeja de entrada y verifica tu correo antes de iniciar sesión.');
      setTimeout(() => {
        setInfo(null);
        onSwitch(); // Redirige al login
      }, 3500);
    } catch (err: any) {
      setError('No se pudo registrar. Intenta con otro correo.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Fondo curvo superior */}
      <View style={styles.curveTop} />
      <View style={styles.card}>
        <Text style={styles.title}>Registro</Text>
        <View style={styles.inputRow}>
          <Ionicons name="person" size={22} color={colors.primary} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            placeholderTextColor={colors.placeholder}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>
        <View style={styles.inputRow}>
          <Ionicons name="mail" size={22} color={colors.primary} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed" size={22} color={colors.primary} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={colors.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed" size={22} color={colors.primary} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            placeholderTextColor={colors.placeholder}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>
        {error && <Text style={styles.error}>{error}</Text>}
        {info && <Text style={{ color: '#388e3c', textAlign: 'center', marginTop: 10, fontWeight: 'bold' }}>{info}</Text>}
        <Text style={styles.switchText} onPress={onSwitch}>
          ¿Ya tienes cuenta? <Text style={styles.link}>Inicia sesión</Text>
        </Text>
      </View>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  curveTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    zIndex: -1,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    // backgroundColor: colors.background, // Eliminar para que se vea el fondo
    borderRadius: 20,
    padding: 40, // Igual que en LoginForm
    // Quitar sombra
    // shadowColor: '#000',
    // shadowOpacity: 0.10,
    // shadowRadius: 8,
    // shadowOffset: { width: 0, height: 2 },
    // elevation: 4,
    alignItems: 'center',
    marginTop: 120, // Bajar el formulario
    marginHorizontal: 24, // Margen a los lados
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    // backgroundColor: colors.card, // Eliminar para que se vea el fondo
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: colors.text,
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 10,
    marginBottom: 8,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: colors.error,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
  switchText: {
    marginTop: 22,
    color: colors.text,
    textAlign: 'center',
    fontSize: 15,
  },
  link: {
    color: colors.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default RegisterForm; 