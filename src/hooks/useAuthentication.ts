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
      
      await AsyncStorage.setItem('@goldenbook_auth_token', await user.getIdToken());
      await AsyncStorage.setItem('@goldenbook_user_data', JSON.stringify(userData));
      await clearGuestMode();
      await updateUserData(userData);
      
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