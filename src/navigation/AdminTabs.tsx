import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminScreen from '../screens/AdminScreen';
import RankingScreen from '../screens/RankingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminFunctionsScreen from '../screens/AdminFunctionsScreen';
import UsersListScreen from '../screens/UsersListScreen';
import DriversListScreen from '../screens/DriversListScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

interface AdminTabsProps {
  onLogout?: () => void;
}

const AdminTabs: React.FC<AdminTabsProps> = ({ onLogout }) => {
  const [currentScreen, setCurrentScreen] = useState('AdminPanel');

  const handleNavigateToUsers = () => {
    setCurrentScreen('Users');
  };

  const handleNavigateToDrivers = () => {
    setCurrentScreen('Drivers');
  };

  return (
    <Tab.Navigator
      initialRouteName="AdminPanel"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1a237e',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 0, elevation: 8 },
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          if (route.name === 'AdminPanel') iconName = 'shield-checkmark';
          else if (route.name === 'Ranking') iconName = 'trophy-outline';
          else if (route.name === 'Perfil') iconName = 'person-circle-outline';
          else if (route.name === 'Funcionalidades') iconName = 'settings-outline';
          else if (route.name === 'Users') iconName = 'people';
          else if (route.name === 'Drivers') iconName = 'car-sport';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="AdminPanel" 
        children={() => (
          <AdminScreen 
            onLogout={onLogout}
            onNavigateToUsers={handleNavigateToUsers}
            onNavigateToDrivers={handleNavigateToDrivers}
          />
        )}
      />
      <Tab.Screen name="Users" children={() => <UsersListScreen onLogout={onLogout} />} />
      <Tab.Screen name="Drivers" children={() => <DriversListScreen onLogout={onLogout} />} />
      <Tab.Screen name="Ranking" component={RankingScreen} />
      <Tab.Screen name="Perfil" children={() => <ProfileScreen onLogout={onLogout} />} />
      <Tab.Screen name="Funcionalidades" children={() => <AdminFunctionsScreen onLogout={onLogout} />} />
    </Tab.Navigator>
  );
};

export default AdminTabs; 