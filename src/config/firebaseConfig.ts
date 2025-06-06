import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCeWEBIzPHaNv_6LSFUfQFJatH85uwoMgg",
  authDomain: "goldenbook-a1cd1.firebaseapp.com",
  projectId: "goldenbook-a1cd1",
  storageBucket: "goldenbook-a1cd1.appspot.com",
  messagingSenderId: "659096031354",
  appId: "1:659096031354:android:29260c886aa50f65f86bc3",
};

// Inicializa Firebase solo si no está ya inicializado
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Configurar autenticación con persistencia
let auth: Auth;
if (getApps().length === 0) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} else {
  auth = getAuth(app);
}

// Inicializa Firestore
const db: Firestore = getFirestore(app);

export { auth, app, db };