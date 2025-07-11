import * as AppleAuthentication from 'expo-apple-authentication';
import {
  createUserWithEmailAndPassword,
  OAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  User
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
    try {
      await sendEmailVerification(user);
      console.log('✅ Verification email sent successfully to:', user.email);
    } catch (emailError) {
      console.warn('⚠️ Failed to send verification email:', emailError);
      // Don't fail registration if email sending fails
    }

    return user;
  } catch (error: any) {
    console.error('Error during registration:', error);
    throw new Error(error.message);
  }
};

/**
 * Login an existing user with email and password.
 * @param email - User's email address
 * @param password - User's password
 * @param requireVerification - Whether to require email verification
 * @param allowUnverifiedInDev - Allow unverified users in development
 */
export const loginUser = async (
  email: string,
  password: string,
  requireVerification: boolean = false,
  allowUnverifiedInDev: boolean = __DEV__ ?? true
): Promise<User | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      if (allowUnverifiedInDev && __DEV__) {
        console.warn('🚧 DEV MODE: Email not verified for:', user.email, '- allowing login');
        return user;
      }

      if (requireVerification) {
        throw new Error('Please verify your email before logging in. Check your inbox and spam folder.');
      } else {
        console.warn('⚠️ Email not verified for:', user.email, '- but verification not required');
      }
    } else {
      console.log('✅ Email verified for:', user.email);
    }

    return user;
  } catch (error: any) {
    console.error('Error during login:', error);

    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address format.');
    } else if (error.code === 'auth/user-disabled') {
      throw new Error('This account has been disabled. Please contact support.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    }

    throw new Error(error.message);
  }
};

/**
 * Sign in with Apple.
 * Uses expo-apple-authentication to get an identity token, then logs in to Firebase.
 */
export const signInWithApple = async (): Promise<boolean> => {
  try {
    const appleCredential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!appleCredential.identityToken) {
      throw new Error('Apple Sign-In failed: no identity token returned.');
    }

    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({
      idToken: appleCredential.identityToken,
    });

    await signInWithCredential(auth, credential);

    console.log('✅ Apple Sign-In success');
    return true;
  } catch (error: any) {
    if (error.code === 'ERR_CANCELED') {
      console.log('Apple sign in cancelled by user');
      return false;
    }
    console.error('Apple sign in error:', error);
    throw new Error(error.message || 'Apple Sign-In failed.');
  }
};

/**
 * Send a password reset email to the user's email address.
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('✅ Password reset email sent to:', email);
  } catch (error: any) {
    console.error('Error during password reset:', error);

    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address format.');
    }

    throw new Error(error.message);
  }
};

/**
 * Resend email verification for the current user
 */
export const resendEmailVerification = async (user?: User): Promise<void> => {
  try {
    const currentUser = user || auth.currentUser;

    if (!currentUser) {
      throw new Error('No user is currently signed in.');
    }

    if (currentUser.emailVerified) {
      throw new Error('Email is already verified.');
    }

    await sendEmailVerification(currentUser);
    console.log('✅ Verification email resent to:', currentUser.email);
  } catch (error: any) {
    console.error('Error resending verification email:', error);

    if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please wait before requesting another verification email.');
    }

    throw new Error(error.message);
  }
};
