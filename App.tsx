import React, { useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator'; // Tu navegador principal
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';

// Impide que la pantalla de splash se oculte automáticamente
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Precarga las fuentes
        await Font.loadAsync({
          'EuclidSquare-Regular': require('./src/assets/fonts/EuclidSquare-Regular.ttf'),
          'EuclidSquare-Medium': require('./src/assets/fonts/EuclidSquare-Medium.ttf'),
          'EuclidSquare-SemiBold': require('./src/assets/fonts/EuclidSquare-SemiBold.ttf'),
          'EuclidSquare-Bold': require('./src/assets/fonts/EuclidSquare-Bold.ttf'),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        // Indica que la aplicación está lista
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Este es el momento de ocultar la pantalla de splash
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </View>
  );
}