import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import VoteScreen from '../screens/VoteScreen';
import RankingScreen from '../screens/RankingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();

interface MainTabsProps {
  onLogout?: () => void;
}

const MainTabs: React.FC<MainTabsProps> = ({ onLogout }) => (
  <Tab.Navigator
    initialRouteName="Vota"
    screenOptions={({ route }) => ({
      headerShown: false,
              tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: '#95a5a6',
      tabBarStyle: { 
        backgroundColor: '#fff', 
        borderTopWidth: 0, 
        elevation: 8,
                  shadowColor: colors.primary,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: -2 },
      },
      tabBarIcon: ({ color, size }) => {
        let iconName = '';
        if (route.name === 'Vota') iconName = 'star-outline';
        else if (route.name === 'Ranking') iconName = 'trophy-outline';
        else if (route.name === 'Perfil') iconName = 'person-circle-outline';
        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Vota" component={VoteScreen} />
    <Tab.Screen name="Ranking" component={RankingScreen} />
    <Tab.Screen name="Perfil">
      {() => <ProfileScreen onLogout={onLogout} />}
    </Tab.Screen>
  </Tab.Navigator>
);

export default MainTabs; 