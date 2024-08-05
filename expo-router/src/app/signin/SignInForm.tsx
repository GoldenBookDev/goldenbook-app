import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc"; // Importar el ícono de Google
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles as googleButtonStyles } from "../../components/GoogleSignInButtonStyles"; // Importar los estilos del botón de Google
import Colors from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";
import { globalStyles } from "../../styles/globalStyles";

export const SignInForm: React.FC = () => {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    setLoading(true);
    setError(""); // Reiniciar el mensaje de error
    try {
      await signInWithEmail(email, password);
      router.replace("/home");
    } catch (error) {
      setError((error as Error).message);
      console.error("Error signing in:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(""); // Reiniciar el mensaje de error
    try {
      await signInWithGoogle();
      router.replace("/home");
    } catch (error) {
      setError((error as Error).message);
      console.error("Error signing in with Google:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Text style={globalStyles.text}>Sign In</Text>
      <TextInput
        style={globalStyles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor={Colors.light.placeholderText}
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        placeholderTextColor={Colors.light.placeholderText}
      />
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      <TouchableOpacity
        style={globalStyles.button}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.light.activityIndicator} />
        ) : (
          <Text style={globalStyles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={globalStyles.button}
        onPress={handleGoogleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.light.activityIndicator} />
        ) : (
          <View style={googleButtonStyles.googleButtonContent}>
            <FcGoogle size={24} style={googleButtonStyles.googleIcon} />
            <Text style={globalStyles.buttonText}>Sign In with Google</Text>
          </View>
        )}
      </TouchableOpacity>
      <Link href="/signup">
        <Text
          style={[
            globalStyles.text,
            { marginTop: 16, color: Colors.light.linkColor },
          ]}
        >
          Don't have an account? Sign Up
        </Text>
      </Link>
    </>
  );
};
