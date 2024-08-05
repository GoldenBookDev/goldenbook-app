import React from "react";
import { View } from "react-native";
import { globalStyles } from "../../styles/globalStyles";
import { SignInForm } from "./SignInForm";

const SignInScreen: React.FC = () => {
  return (
    <View style={globalStyles.container}>
      <SignInForm />
    </View>
  );
};

export default SignInScreen;
