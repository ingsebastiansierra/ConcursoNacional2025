import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from './src/screens/AuthScreen';
import MainTabs from './src/navigation/MainTabs';
import AdminTabs from './src/navigation/AdminTabs';
import WelcomeScreen from './src/screens/WelcomeScreen';
import { StatusBar } from 'expo-status-bar';

const Stack = createStackNavigator();

export default function App() {
  // Estados para manejar autenticación y tipo de usuario
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showLoginForm, setShowLoginForm] = useState(true); // Nuevo estado para controlar qué formulario mostrar

  // Debug: Log del estado actual
  console.log('App State:', { isAuthenticated, isAdmin, showWelcome, showLoginForm });

  const handleUserAuthSuccess = () => {
    console.log('User auth success');
    setIsAuthenticated(true);
    setIsAdmin(false);
  };

  const handleAdminAuthSuccess = () => {
    console.log('Admin auth success');
    setIsAuthenticated(true);
    setIsAdmin(true);
  };

  const handleLogout = () => {
    console.log('Logout');
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showWelcome ? (
          <Stack.Screen name="Welcome">
            {() => (
              <WelcomeScreen
                onLogin={() => {
                  setShowLoginForm(true);
                  setShowWelcome(false);
                }}
                onRegister={() => {
                  setShowLoginForm(false);
                  setShowWelcome(false);
                }}
              />
            )}
          </Stack.Screen>
        ) : !isAuthenticated ? (
          <Stack.Screen name="Auth">
            {() => (
              <AuthScreen
                initialShowLogin={showLoginForm}
                onAuthSuccess={handleUserAuthSuccess}
                onAdminAuthSuccess={handleAdminAuthSuccess}
              />
            )}
          </Stack.Screen>
        ) : isAdmin ? (
          <Stack.Screen name="AdminTabs">
            {() => <AdminTabs onLogout={handleLogout} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Main">
            {() => <MainTabs onLogout={handleLogout} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
