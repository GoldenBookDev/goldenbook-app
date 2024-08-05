// src/app/(tabs)/home/index.tsx
import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { Button } from "tamagui";
import { useAuth } from "../../../hooks/useAuth";
import { globalStyles } from "../../../styles/globalStyles";

const HomeScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/signin");
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.text}>Welcome, {user?.email}</Text>
      <Button onPress={handleSignOut}>
        <Text style={globalStyles.buttonText}>Sign Out</Text>
      </Button>
    </View>
  );
};

export default HomeScreen;
