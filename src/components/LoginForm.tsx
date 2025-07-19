import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authService from '../services/authService';
import { getAuth } from 'firebase/auth';
import { User } from 'firebase/auth';
import colors from '../theme/colors';

type Props = {
  onSwitch: () => void;
  onAuthSuccess?: () => void;
  onAdminAuthSuccess?: () => void;
};

const LoginForm: React.FC<Props> = ({ onSwitch, onAuthSuccess, onAdminAuthSuccess }) => {
  const styles = createStyles(colors);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [unverifiedUser, setUnverifiedUser] = useState<User | null>(null);

  const handleLogin = async () => {
    setError(null);
    setInfo(null);
    setUnverifiedUser(null);
    setLoading(true);
    
    try {
      const userCredential = await authService.login(email, password);
      const user = userCredential.user;
      
      if (!user.emailVerified) {
        setError('Tu correo no ha sido verificado. Por favor revisa tu bandeja de entrada y haz clic en el enlace de verificación.');
        setUnverifiedUser(user);
        setLoading(false);
        return;
      }
      
      // Verificar si es administrador
      const isUserAdmin = await authService.isAdmin(user);
      
      if (isUserAdmin) {
        // Si es administrador, llamar a la función específica
        console.log('User is admin, calling onAdminAuthSuccess');
        if (onAdminAuthSuccess) {
          onAdminAuthSuccess();
        }
      } else {
        // Si es usuario normal, llamar a la función normal
        console.log('User is not admin, calling onAuthSuccess');
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

  const handleResendVerification = async () => {
    if (unverifiedUser) {
      try {
        await authService.sendVerificationEmail(unverifiedUser);
        setInfo('Correo de verificación reenviado. Revisa tu bandeja de entrada.');
      } catch (err) {
        setError('No se pudo reenviar el correo. Intenta más tarde.');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Fondo curvo superior */}
      <View style={styles.curveTop} />
      <View style={styles.card}>
        <Text style={styles.title}>Iniciar Sesión</Text>
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
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
        </TouchableOpacity>
        {error && <Text style={styles.error}>{error}</Text>}
        {info && <Text style={{ color: '#388e3c', textAlign: 'center', marginTop: 10, fontWeight: 'bold' }}>{info}</Text>}
        {unverifiedUser && (
          <TouchableOpacity style={styles.buttonOutline} onPress={handleResendVerification}>
            <Text style={styles.buttonTextOutline}>Reenviar correo de verificación</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.switchText} onPress={onSwitch}>
          ¿No tienes cuenta? <Text style={styles.link}>Regístrate</Text>
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
    padding: 40, // Reducir padding para que no se vea tan pegado
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
    backgroundColor: colors.card,
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
  buttonOutline: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonTextOutline: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 15,
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

export default LoginForm; 