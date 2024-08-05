// src/app/onboarding.tsx
import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { globalStyles } from "../styles/globalStyles";

const OnboardingScreen: React.FC = () => {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.text}>Welcome</Text>
      <Link href="/signin">
        <Text style={[globalStyles.text, { color: "#007BFF", marginTop: 16 }]}>
          Sign In
        </Text>
      </Link>
      <Link href="/signup">
        <Text style={[globalStyles.text, { color: "#007BFF", marginTop: 16 }]}>
          Sign Up
        </Text>
      </Link>
    </View>
  );
};

export default OnboardingScreen;
