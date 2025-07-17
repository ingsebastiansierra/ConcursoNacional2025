import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from './src/screens/AuthScreen';
import MainTabs from './src/navigation/MainTabs';
import AdminTabs from './src/navigation/AdminTabs';
import { StatusBar } from 'expo-status-bar';

const Stack = createStackNavigator();

export default function App() {
  // Estados para manejar autenticación y tipo de usuario
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleUserAuthSuccess = () => {
    setIsAuthenticated(true);
    setIsAdmin(false);
  };

  const handleAdminAuthSuccess = () => {
    setIsAuthenticated(true);
    setIsAdmin(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth">
            {() => (
              <AuthScreen 
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
