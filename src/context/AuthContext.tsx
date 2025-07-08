import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteUser, onAuthStateChanged, signOut, User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../config/firebaseConfig';
import { deleteUserProfile, getUserProfile, saveUserPreferences } from '../services/userService';

type AuthContextType = {
  user: User | null;
  userData: any | null;
  isLoading: boolean;
  isGuest: boolean;
  setAsGuest: () => Promise<void>;
  clearGuestMode: () => Promise<void>;
  updateUserData: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
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
      setIsLoading(false);
    } catch (error) {
      console.error('Error setting guest mode:', error);
    }
  };

  // Clear guest mode
  const clearGuestMode = async () => {
    try {
      // Update local state immediately
      setIsGuest(false);

      // Clear AsyncStorage
      await AsyncStorage.removeItem('@goldenbook_guest_mode');
    } catch (error) {
      console.error('Error clearing guest mode:', error);
    }
  };

  // Update user data in storage and state
  const updateUserData = async (data: any) => {
    try {
      // Only update if not in guest mode
      const currentGuestMode = await checkGuestMode();
      if (currentGuestMode) {
        return;
      }

      await AsyncStorage.setItem('@goldenbook_user_data', JSON.stringify(data));
      setUserData(data);
      setIsGuest(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);

      // Clear local data
      await AsyncStorage.removeItem('@goldenbook_auth_token');
      await AsyncStorage.removeItem('@goldenbook_user_data');
      await AsyncStorage.removeItem('@goldenbook_guest_mode');

      // Update context state
      setUser(null);
      setUserData(null);
      setIsGuest(false);
    } catch (error: any) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  // Delete account function
  const deleteAccount = async () => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const userId = user.uid;

      // 1. Delete user data from Firestore
      try {
        await deleteUserProfile(userId);
      } catch (error) {
        console.warn('Error deleting user profile from Firestore:', error);
        // Continue with deletion even if this fails
      }

      // 2. Clear local data before deleting Auth account
      await AsyncStorage.removeItem('@goldenbook_auth_token');
      await AsyncStorage.removeItem('@goldenbook_user_data');
      await AsyncStorage.removeItem('@goldenbook_guest_mode');

      // 3. Delete Firebase Authentication account
      await deleteUser(user);

      // 4. Update context state
      setUser(null);
      setUserData(null);
      setIsGuest(false);

    } catch (error: any) {
      console.error('Error during account deletion:', error);

      // If error is due to required re-authentication
      if (error?.code === 'auth/requires-recent-login') {
        throw new Error('For security reasons, please log out and log back in, then try deleting your account again.');
      }

      throw error;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initAuth = async () => {
      setIsLoading(true);

      // Check if user is in guest mode
      const guestMode = await checkGuestMode();

      if (guestMode) {
        setIsGuest(true);
        setUser(null);
        setUserData(null);
        setIsLoading(false);
        return;
      }

      // Listen for auth state changes
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Small delay to allow clearGuestMode to complete
          await new Promise(resolve => setTimeout(resolve, 50));

          // Check if we're still in guest mode before proceeding
          const currentGuestMode = await checkGuestMode();

          if (currentGuestMode) {
            setIsLoading(false);
            return;
          }

          setUser(firebaseUser);
          setIsGuest(false);

          try {
            // Try to get user profile data from Firestore
            let userDataFromFirestore = null;
            try {
              userDataFromFirestore = await getUserProfile(firebaseUser.uid);
            } catch (error) {
              // No user profile found in Firestore, will use Firebase data
            }

            // If Firestore data exists, use it (customized user data)
            if (userDataFromFirestore) {
              const firestoreUserData = {
                uid: firebaseUser.uid,
                displayName: userDataFromFirestore.displayName,
                firstName: userDataFromFirestore.firstName || '',
                lastName: userDataFromFirestore.lastName || '',
                email: firebaseUser.email || '', // Always use current Firebase email
                photoURL: userDataFromFirestore.photoURL || firebaseUser.photoURL || '',
              };

              await AsyncStorage.setItem('@goldenbook_user_data', JSON.stringify(firestoreUserData));
              setUserData(firestoreUserData);
            } else {
              // If no Firestore data, create profile for first time
              try {
                const userProfile = {
                  displayName: firebaseUser.displayName || '',
                  firstName: '',
                  lastName: '',
                  email: firebaseUser.email || '',
                  photoURL: firebaseUser.photoURL || ''
                };

                const defaultPreferences = {
                  marketingConsent: true,
                  termsAcceptedAt: new Date(),
                  privacyPolicyAcceptedAt: new Date(),
                  language: 'en'
                };

                await saveUserPreferences(firebaseUser.uid, defaultPreferences, userProfile);

                const firebaseUserData = {
                  uid: firebaseUser.uid,
                  displayName: firebaseUser.displayName || '',
                  firstName: '',
                  lastName: '',
                  email: firebaseUser.email || '',
                  photoURL: firebaseUser.photoURL || '',
                };

                await AsyncStorage.setItem('@goldenbook_user_data', JSON.stringify(firebaseUserData));
                setUserData(firebaseUserData);

              } catch (error) {
                console.warn('Error creating complete user document:', error);
                // Fallback: use basic Firebase data
                const basicUserData = {
                  uid: firebaseUser.uid,
                  displayName: firebaseUser.displayName || '',
                  firstName: '',
                  lastName: '',
                  email: firebaseUser.email || '',
                  photoURL: firebaseUser.photoURL || '',
                };
                setUserData(basicUserData);
              }
            }
          } catch (error) {
            console.error('Error processing user data:', error);
          }
        } else {
          setUser(null);
          setUserData(null);

          // Only if not in guest mode, check if we should be
          const currentGuestMode = await checkGuestMode();
          if (currentGuestMode) {
            setIsGuest(true);
          } else {
            setIsGuest(false);
          }
        }

        setIsLoading(false);
      });
    };

    initAuth();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
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
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;