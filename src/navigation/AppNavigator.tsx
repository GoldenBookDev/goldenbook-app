import { RootStackParamList } from '@navigation/navigationTypes';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from '@screens//MapScreen';
import AnimationScreen from '@screens/AnimationScreen';
import CategoryScreen from '@screens/CategoryScreen';
import EstablishmentScreen from '@screens/EstablishmentScreen';
import HomeScreen from '@screens/HomeScreen';
import LocationSelectionScreen from '@screens/LocationSelectionScreen';
import LoginStep1Screen from '@screens/LoginStep1Screen';
import LoginStep2Screen from '@screens/LoginStep2Screen';
import MyFavoritesScreen from '@screens/MyFavoritesScreen';
import OnboardingScreen from '@screens/OnboardingScreen';
import ProfileScreen from '@screens/ProfileScreen';
import RegisterScreen from '@screens/RegisterScreen';
import ResetPasswordScreen from '@screens/ResetPassword';
import SearchResultsScreen from '@screens/SearchResultsScreen';
import SettingsScreen from '@screens/SettingsScreen';
import * as Linking from 'expo-linking';
import React, { useEffect } from 'react';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Configuración de deep links - EXPORTAR para usar en App.tsx
export const linking = {
  prefixes: [
    'com.bwebstudio.goldenbook://', // Scheme original para OAuth
    'goldenbook://', // Scheme adicional para deep links
    'https://meek-toffee-0a1ea2.netlify.app'
  ],
  config: {
    screens: {
      EstablishmentScreen: {
        path: '/establishment/:establishmentId',
        parse: {
          establishmentId: (establishmentId: string) => establishmentId,
        },
      },
      HomeScreen: '*', // Fallback para cualquier otra URL
    },
  },
};

const AppNavigator: React.FC = () => {
  // Manejar deep links cuando la app se abre
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('🔗 Deep link recibido:', url);
      // El NavigationContainer manejará automáticamente la navegación
    };

    // Manejar deep link cuando la app está cerrada
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Manejar deep link cuando la app está en background
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription?.remove();
  }, []);

  return (
    <Stack.Navigator initialRouteName="AnimationScreen" screenOptions={{ headerShown: false }}>
      {/* Pantalla de animación */}
      <Stack.Screen name="AnimationScreen" component={AnimationScreen} />
      {/* Onboarding */}
      <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
      {/* Home */}
      <Stack.Screen name="LoginStep1" component={LoginStep1Screen} />
      <Stack.Screen name="LoginStep2" component={LoginStep2Screen} />

      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

      <Stack.Screen name="LocationSelection" component={LocationSelectionScreen} />
      <Stack.Screen name="MapScreen" component={MapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
      <Stack.Screen name="EstablishmentScreen" component={EstablishmentScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
      <Stack.Screen name="MyFavoritesScreen" component={MyFavoritesScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;