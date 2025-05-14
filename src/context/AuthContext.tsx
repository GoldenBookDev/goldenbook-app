import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';

type AuthContextType = {
  user: User | null;
  userData: any | null;
  isLoading: boolean;
  isGuest: boolean;
  setAsGuest: () => Promise<void>;
  clearGuestMode: () => Promise<void>;
  updateUserData: (data: any) => Promise<void>;
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
            // Get user data from AsyncStorage
            const userDataString = await AsyncStorage.getItem('@goldenbook_user_data');
            if (userDataString) {
              const parsedUserData = JSON.parse(userDataString);
              setUserData(parsedUserData);
            } else {
              // Initialize user data if not available
              const initialUserData = {
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName || '',
                email: firebaseUser.email || '',
                photoURL: firebaseUser.photoURL || '',
              };
              await AsyncStorage.setItem('@goldenbook_user_data', JSON.stringify(initialUserData));
              setUserData(initialUserData);
            }
          } catch (error) {
            console.error('Error getting user data:', error);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;