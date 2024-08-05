import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebaseConfig";

export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await sendEmailVerification(user);
    console.log("Email de verificación enviado");
    await signOut(auth); // Forzar el cierre de sesión hasta que se verifique el correo
  } catch (error) {
    console.error("Error durante el registro:", error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    if (!user.emailVerified) {
      await signOut(auth);
      throw new Error(
        "El correo electrónico no está verificado. Por favor, verifica tu correo electrónico antes de iniciar sesión."
      );
    }
    console.log("Usuario autenticado:", user);
    return userCredential;
  } catch (error) {
    console.error("Error durante el inicio de sesión:", error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log("Usuario desautenticado");
  } catch (error) {
    console.error("Error durante el cierre de sesión:", error);
  }
};
