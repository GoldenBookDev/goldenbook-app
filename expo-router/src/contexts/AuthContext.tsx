import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  User,
  UserCredential,
} from "firebase/auth";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { signIn, signOutUser, signUp } from "../services/authService";
import { auth } from "../services/firebaseConfig";

type AuthContextType = {
  user: User | null;
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<UserCredential>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.emailVerified) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const userCredential = await signIn(email, password);
    setUser(userCredential.user);
    return userCredential;
  };

  const signUpWithEmail = async (email: string, password: string) => {
    await signUp(email, password);
  };

  const signOut = async () => {
    await signOutUser();
    setUser(null);
  };

  const signInWithGoogle = async (): Promise<UserCredential> => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const userCredential = await signInWithPopup(auth, provider);
    if (!userCredential.user.emailVerified) {
      await signOut();
      throw new Error(
        "El correo electrónico no está verificado. Por favor, verifica tu correo electrónico antes de iniciar sesión."
      );
    }
    setUser(userCredential.user);
    return userCredential;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
