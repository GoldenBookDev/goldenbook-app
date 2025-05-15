// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Activar la depuración detallada
import { setLogLevel } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyDTPKWJrmWJBhCPRV0CEIweYGVtdeDLATE",
  authDomain: "goldenbook-a1cd1.firebaseapp.com",
  projectId: "goldenbook-a1cd1",
  storageBucket: "goldenbook-a1cd1.appspot.com",
  messagingSenderId: "659096031354",
  appId: "1:659096031354:android:29260c886aa50f65f86bc3",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Activar logs detallados
if (__DEV__) {
  setLogLevel('debug');
}

// Inicializa Auth con persistencia
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Firestore se mantiene igual
export const db = getFirestore(app);