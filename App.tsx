import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from './src/screens/AuthScreen';
import MainTabs from './src/navigation/MainTabs';
import { StatusBar } from 'expo-status-bar';

const Stack = createStackNavigator();

export default function App() {
  // Simulación de autenticación (luego conectar a Firebase Auth)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Pasar setIsAuthenticated a AuthScreen para cambiar el estado tras login/registro
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth">
            {() => <AuthScreen onAuthSuccess={() => setIsAuthenticated(true)} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Main">
            {() => <MainTabs onLogout={() => setIsAuthenticated(false)} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
