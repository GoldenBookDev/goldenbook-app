import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCeWEBIzPHaNv_6LSFUfQFJatH85uwoMgg',
  authDomain: 'goldenbook-a1cd1.firebaseapp.com',
  projectId: 'goldenbook-a1cd1',
  storageBucket: 'goldenbook-a1cd1.appspot.com',
  messagingSenderId: '659096031354',
  appId: '1:659096031354:android:29260c886aa50f65f86bc3',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

const db: Firestore = getFirestore(app);

export { app, auth, db };
