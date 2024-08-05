import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";
import { globalStyles } from "../../styles/globalStyles";

export const SignUpForm: React.FC = () => {
  const { signUpWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signUpWithEmail(email, password);
      alert("Registro exitoso. Por favor, verifica tu correo electrónico.");
      router.replace("/signin");
    } catch (error) {
      setError((error as Error).message);
      console.error("Error durante el registro:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.text}>Sign Up</Text>
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
      <TextInput
        style={globalStyles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        secureTextEntry
        onChangeText={setConfirmPassword}
        placeholderTextColor={Colors.light.placeholderText}
      />
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      <TouchableOpacity
        style={globalStyles.button}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.light.activityIndicator} />
        ) : (
          <Text style={globalStyles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>
      <Link href="/signin">
        <Text
          style={[
            globalStyles.text,
            { marginTop: 16, color: Colors.light.linkColor },
          ]}
        >
          Already have an account? Sign In
        </Text>
      </Link>
    </View>
  );
};
