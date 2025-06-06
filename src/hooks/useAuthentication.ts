import { useState } from 'react';
import { auth } from '../config/firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider,
  signInWithCredential,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  UserCredential
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export const useAuthentication = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { clearGuestMode, updateUserData } = useAuth();

  // Register with email and password
const registerWithEmail = async (email: string, password: string): Promise<boolean> => {
  setLoading(true);
  setError(null);
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Send verification email
    await sendEmailVerification(user);
    
    // Save user data
    const userData = {
      uid: user.uid,
      displayName: user.displayName || email.split('@')[0],
      email: user.email,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
    
    await AsyncStorage.setItem('@goldenbook_auth_token', await user.getIdToken());
    await AsyncStorage.setItem('@goldenbook_user_data', JSON.stringify(userData));
    await clearGuestMode();
    await updateUserData(userData);
    
   // En tu función registerWithEmail, después de obtener el usuario
    try {
      // Crear perfil de usuario en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        profile: {
          displayName: user.displayName || email.split('@')[0],
          photoURL: user.photoURL || null,
          email: user.email,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        favorites: [],   // Array vacío para favoritos
        bookmarks: []    // Array vacío para marcadores
      });
      console.log("✅ Perfil de usuario creado en Firestore");
    } catch (firestoreError) {
      console.error("❌ Error al crear perfil de usuario:", firestoreError);
      // Continuar aunque falle Firestore
    }
    
    setLoading(false);
    return true;
  } catch (err: any) {
    setError(err.message || 'Registration failed');
    setLoading(false);
    return false;
  }
};

  // Login with email and password
  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Optional: Check if email is verified
      if (!user.emailVerified) {
        setError('Please verify your email before logging in');
        setLoading(false);
        return false;
      }
      
      // Save user data
      const userData = {
        uid: user.uid,
        displayName: user.displayName || email.split('@')[0],
        email: user.email,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };
      
      await AsyncStorage.setItem('@goldenbook_auth_token', await user.getIdToken());
      await AsyncStorage.setItem('@goldenbook_user_data', JSON.stringify(userData));
      await clearGuestMode();
      await updateUserData(userData);
      
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
      return false;
    }
  };

  // Login with Google
const loginWithGoogle = async (idToken: string): Promise<boolean> => {
  setLoading(true);
  setError(null);
  
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;
    
    // Save user data
    const userData = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
    
    // Guardar en AsyncStorage
    try {
      await AsyncStorage.setItem('@goldenbook_auth_token', await user.getIdToken());
      await AsyncStorage.setItem('@goldenbook_user_data', JSON.stringify(userData));
      await clearGuestMode();
      await updateUserData(userData);
    } catch (storageError) {
      console.error("Error guardando datos en AsyncStorage:", storageError);
      // Continuar aunque falle, para no bloquear el flujo
    }
    
    // Actualizar Firestore - una sola vez
    try {
      // Verificar si el perfil del usuario ya existe
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        // Solo crear si no existe
        await setDoc(userDocRef, {
          profile: {
            displayName: user.displayName || '',
            photoURL: user.photoURL || null,
            email: user.email,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          favorites: [],
          bookmarks: []
        });
        console.log("✅ Perfil de usuario creado en Firestore para usuario de Google");
      } else {
        // Solo actualizar una vez
        await updateDoc(userDocRef, {
          'profile.updatedAt': new Date()
        });
        console.log("✅ Información de usuario actualizada en Firestore");
      }
    } catch (firestoreError) {
      console.error("❌ Error al gestionar perfil de usuario:", firestoreError);
      // Continuar aunque falle Firestore
    }
    
    setLoading(false);
    return true;
  } catch (err: any) {
    console.error("Error en loginWithGoogle:", err);
    setError(err.message || 'Google login failed');
    setLoading(false);
    return false;
  }
};

  // Login as guest
  const loginAsGuest = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await AsyncStorage.setItem('@goldenbook_guest_mode', 'true');
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to enter guest mode');
      setLoading(false);
      return false;
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
      setLoading(false);
      return false;
    }
  };

  // Logout
  const logout = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('@goldenbook_auth_token');
      await AsyncStorage.removeItem('@goldenbook_user_data');
      await AsyncStorage.removeItem('@goldenbook_guest_mode');
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      setLoading(false);
      return false;
    }
  };

  return {
    loading,
    error,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    loginAsGuest,
    resetPassword,
    logout
  };
};

export default useAuthentication;