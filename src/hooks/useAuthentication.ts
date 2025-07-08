import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { auth, db } from '../config/firebaseConfig';
import { useAuth } from '../context/AuthContext';

export const useAuthentication = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { clearGuestMode } = useAuth();

  // Register with email and password
  const registerWithEmail = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Send verification email
      await sendEmailVerification(user);
      
      // Clear guest mode, AuthContext will handle the rest
      await clearGuestMode();
      
      // Create Firestore profile (without AsyncStorage, AuthContext handles it)
      try {
        await setDoc(doc(db, 'users', user.uid), {
          profile: {
            displayName: user.displayName || email.split('@')[0],
            photoURL: user.photoURL || null,
            email: user.email,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          favorites: [],   
          bookmarks: []    
        });
      } catch (firestoreError) {
        console.error("Error creating Firestore profile:", firestoreError);
        // Continue even if Firestore fails
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
      
      // Clear guest mode, AuthContext handles the rest automatically
      await clearGuestMode();
      
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
      return false;
    }
  };

  // Google login - simplified to let AuthContext handle everything
  const loginWithGoogle = async (idToken: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Clear guest mode BEFORE Firebase auth
      await clearGuestMode();
      
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      
      // Verify/create Firestore profile asynchronously (don't block)
      setTimeout(async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (!userDocSnap.exists()) {
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
          } else {
            await updateDoc(userDocRef, {
              'profile.updatedAt': new Date()
            });
          }
        } catch (firestoreError) {
          console.error("Error managing Firestore profile:", firestoreError);
        }
      }, 100);
      
      setLoading(false);
      return true;
    } catch (err: any) {
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
      // Simplified: Just AsyncStorage, context will update automatically
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

  // Logout - simplified to use AuthContext
  const logout = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simplified: Just Firebase signOut, AuthContext handles the rest
      await signOut(auth);
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