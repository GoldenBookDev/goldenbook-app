import { RootStackParamList } from '@navigation/navigationTypes';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from '@screens//MapScreen';
import AnimationScreen from '@screens/AnimationScreen';
import HomeScreen from '@screens/HomeScreen';
import LocationSelectionScreen from '@screens/LocationSelectionScreen';
import LoginStep1Screen from '@screens/LoginStep1Screen';
import LoginStep2Screen from '@screens/LoginStep2Screen';
import OnboardingScreen from '@screens/OnboardingScreen';
import RegisterScreen from '@screens/RegisterScreen';
import ResetPasswordScreen from '@screens/ResetPassword';
import CategoryScreen from '@screens/CategoryScreen';
import EstablishmentScreen from '@screens/EstablishmentScreen';
import SearchResultsScreen from '@screens/SearchResultsScreen';

import React from 'react';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
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
      <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
      <Stack.Screen name="EstablishmentScreen" component={EstablishmentScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />

    </Stack.Navigator>
  );
};

export default AppNavigator;
