import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    User,
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

/**
 * Register a new user with email and password.
 * Sends a verification email after successful registration.
 */
export const registerUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Send email verification
    await sendEmailVerification(user);
    return user;
  } catch (error: any) {
    console.error('Error during registration:', error);
    throw new Error(error.message);
  }
};

/**
 * Login an existing user with email and password.
 */
export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Optional: Check if the user's email is verified
    if (!user.emailVerified) {
      throw new Error('Please verify your email before logging in.');
    }
    return user;
  } catch (error: any) {
    console.error('Error during login:', error);
    throw new Error(error.message);
  }
};

/**
 * Send a password reset email to the user's email address.
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent.');
  } catch (error: any) {
    console.error('Error during password reset:', error);
    throw new Error(error.message);
  }
};