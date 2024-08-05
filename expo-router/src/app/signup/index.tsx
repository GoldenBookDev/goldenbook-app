import React from "react";
import { View } from "react-native";
import { globalStyles } from "../../styles/globalStyles";
import { SignUpForm } from "./SignUpForm";

const SignUpScreen: React.FC = () => {
  return (
    <View style={globalStyles.container}>
      <SignUpForm />
    </View>
  );
};

export default SignUpScreen;
