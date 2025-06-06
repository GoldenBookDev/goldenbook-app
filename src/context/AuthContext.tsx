import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebaseConfig';
import { onAuthStateChanged, User, signOut, deleteUser } from 'firebase/auth';
import { getUserProfile, deleteUserProfile } from '../services/userService';

type AuthContextType = {
  user: User | null;
  userData: any | null;
  isLoading: boolean;
  isGuest: boolean;
  setAsGuest: () => Promise<void>;
  clearGuestMode: () => Promise<void>;
  updateUserData: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>; // Nueva función para eliminar cuenta
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Check if user is in guest mode
  const checkGuestMode = async () => {
    try {
      const guestMode = await AsyncStorage.getItem('@goldenbook_guest_mode');
      return guestMode === 'true';
    } catch (error) {
      console.error('Error checking guest mode:', error);
      return false;
    }
  };

  // Set user as guest
  const setAsGuest = async () => {
    try {
      await AsyncStorage.setItem('@goldenbook_guest_mode', 'true');
      setIsGuest(true);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Error setting guest mode:', error);
    }
  };

  // Clear guest mode
  const clearGuestMode = async () => {
    try {
      await AsyncStorage.removeItem('@goldenbook_guest_mode');
      setIsGuest(false);
    } catch (error) {
      console.error('Error clearing guest mode:', error);
    }
  };

  // Update user data in storage and state
  const updateUserData = async (data: any) => {
    try {
      await AsyncStorage.setItem('@goldenbook_user_data', JSON.stringify(data));
      setUserData(data);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  // Nueva función logout
  const logout = async () => {
    try {
      // Cerrar sesión en Firebase
      await signOut(auth);
      
      // Limpiar datos locales
      await AsyncStorage.removeItem('@goldenbook_auth_token');
      await AsyncStorage.removeItem('@goldenbook_user_data');
      await AsyncStorage.removeItem('@goldenbook_guest_mode');
      
      // Actualizar estado del contexto
      setUser(null);
      setUserData(null);
      setIsGuest(false);
      
      console.log("Logout successful from AuthContext");
    } catch (error: any) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  // Nueva función para eliminar cuenta
  const deleteAccount = async () => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const userId = user.uid;
      
      console.log('Starting account deletion process for user:', userId);
      
      // 1. Eliminar datos del usuario de Firestore
      try {
        await deleteUserProfile(userId);
        console.log('User profile deleted from Firestore');
      } catch (error) {
        console.warn('Error deleting user profile from Firestore:', error);
        // Continuar con la eliminación aunque falle esto
      }
      
      // 2. Limpiar datos locales antes de eliminar la cuenta de Auth
      await AsyncStorage.removeItem('@goldenbook_auth_token');
      await AsyncStorage.removeItem('@goldenbook_user_data');
      await AsyncStorage.removeItem('@goldenbook_guest_mode');
      
      // 3. Eliminar la cuenta de Firebase Authentication
      await deleteUser(user);
      
      // 4. Actualizar estado del contexto
      setUser(null);
      setUserData(null);
      setIsGuest(false);
      
      console.log("Account deletion successful from AuthContext");
    } catch (error: any) {
      console.error('Error during account deletion:', error);
      
      // Si el error es por reautenticación requerida
      if (error?.code === 'auth/requires-recent-login') {
        throw new Error('For security reasons, please log out and log back in, then try deleting your account again.');
      }
      
      throw error;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      // Check if user is in guest mode
      const guestMode = await checkGuestMode();
      setIsGuest(guestMode);
      
      if (guestMode) {
        setIsLoading(false);
        return;
      }
      
      // Listen for auth state changes
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          
          try {
            // PRIMERO: Intentar obtener datos del perfil desde Firestore
            let userDataFromFirestore = null;
            try {
              userDataFromFirestore = await getUserProfile(firebaseUser.uid);
            } catch (error) {
              console.log('No user profile found in Firestore, will use Google data');
            }
            
            // Si hay datos en Firestore, usarlos (datos personalizados del usuario)
            if (userDataFromFirestore && userDataFromFirestore.displayName) {
              const firestoreUserData = {
                uid: firebaseUser.uid,
                displayName: userDataFromFirestore.displayName,
                firstName: userDataFromFirestore.firstName || '',
                lastName: userDataFromFirestore.lastName || '',
                email: firebaseUser.email || '', // Siempre usar el email actual de Google
                photoURL: userDataFromFirestore.photoURL || firebaseUser.photoURL || '',
              };
              
              await AsyncStorage.setItem('@goldenbook_user_data', JSON.stringify(firestoreUserData));
              setUserData(firestoreUserData);
              
              console.log('Using customized profile from Firestore:', firestoreUserData.displayName);
            } else {
              // Si no hay datos en Firestore, usar datos de Google (primera vez)
              const googleUserData = {
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName || '',
                email: firebaseUser.email || '',
                photoURL: firebaseUser.photoURL || '',
              };
              
              await AsyncStorage.setItem('@goldenbook_user_data', JSON.stringify(googleUserData));
              setUserData(googleUserData);
              
              console.log('Using Google profile data:', googleUserData.displayName);
            }
          } catch (error) {
            console.error('Error getting user data:', error);
            
            // Fallback: usar datos de Google si hay error
            const fallbackUserData = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || '',
            };
            
            await AsyncStorage.setItem('@goldenbook_user_data', JSON.stringify(fallbackUserData));
            setUserData(fallbackUserData);
          }
        } else {
          setUser(null);
          setUserData(null);
        }
        
        setIsLoading(false);
      });
      
      // Clean up subscription
      return () => unsubscribe();
    };
    
    initAuth();
  }, []);

  const value = {
    user,
    userData,
    isLoading,
    isGuest,
    setAsGuest,
    clearGuestMode,
    updateUserData,
    logout,
    deleteAccount, // Agregar la función de deleteAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;