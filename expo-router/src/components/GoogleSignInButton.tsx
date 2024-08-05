import { useRouter } from "expo-router";
import React from "react";
import { FcGoogle } from "react-icons/fc";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Colors from "../constants/Colors";
import { useAuth } from "../contexts/AuthContext";
import { globalStyles } from "../styles/globalStyles";
import { styles } from "./GoogleSignInButtonStyles";

interface GoogleSignInButtonProps {
  loading: boolean;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ loading }) => {
  const { signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.replace("/home");
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <TouchableOpacity
      style={globalStyles.button}
      onPress={handleGoogleSignIn}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={Colors.light.activityIndicator} />
      ) : (
        <View style={styles.googleButtonContent}>
          <FcGoogle size={24} style={styles.googleIcon} />
          <Text style={globalStyles.buttonText}>Sign In with Google</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default GoogleSignInButton;
