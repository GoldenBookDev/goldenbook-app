import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDTPKWJrmWJBhCPRV0CEIweYGVtdeDLATE",
  authDomain: "goldenbook-a1cd1.firebaseapp.com",
  projectId: "goldenbook-a1cd1",
  storageBucket: "goldenbook-a1cd1.appspot.com",
  messagingSenderId: "659096031354",
  appId: "1:659096031354:android:29260c886aa50f65f86bc3",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);   // Para autenticación con Firebase (email/Google)
export const db = getFirestore(app); // Para manejar Firestore