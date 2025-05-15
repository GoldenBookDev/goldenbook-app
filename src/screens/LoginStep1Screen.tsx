// LoginStep1Screen.tsx
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { isValidEmail } from '../utils/validation';

// Registra el resultado del navegador web
WebBrowser.maybeCompleteAuthSession();

const LoginStep1Screen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);

  // Validación de email
  useEffect(() => {
    setIsEmailValid(isValidEmail(email));
  }, [email]);

  // Continuar con email y contraseña
  const handleContinue = () => {
    if (!isEmailValid) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }
    navigation.navigate('LoginStep2', { email });
  };

  // Autenticación con Google deshabilitada temporalmente
  const handleGoogleSignIn = () => {
    Alert.alert(
      'Autenticación con Google temporalmente deshabilitada',
      'Por favor, utiliza el método de correo electrónico y contraseña o continúa como invitado mientras resolvemos este problema.'
    );
  };

  // Continuar como invitado
  const continueAsGuest = () => {
    navigation.navigate('LocationSelection');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log in or sign up</Text>
      
      {/* Input de email */}
      <TextInput
        style={[
          styles.input,
          { borderColor: isEmailValid ? '#ADB5BD' : '#FF4D4F' },
        ]}
        placeholder="Email"
        placeholderTextColor="#6C757D"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      
      {/* Botón para continuar con email */}
      <TouchableOpacity
        style={[styles.button, !isEmailValid && styles.disabledButton]}
        onPress={handleContinue}
        disabled={!isEmailValid}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      {/* Separador */}
      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.line} />
      </View>

      {/* Botón de Google (deshabilitado temporalmente) */}
      <TouchableOpacity
        style={[styles.googleButton, { opacity: 0.5 }]}
        onPress={handleGoogleSignIn}
      >
        <View style={styles.googleContent}>
          <Image
            source={require('../assets/google-icon.png')}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Continue with Google (maintenance)</Text>
        </View>
      </TouchableOpacity>

      {/* Enlaces adicionales */}
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.signupLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={styles.linkContainer}
        onPress={continueAsGuest}
      >
        <Text style={styles.link}>Continue without an account</Text>
      </TouchableOpacity>
    </View>
  );
};

// Mantén los estilos originales...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: '10%',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: Dimensions.get('window').width * 0.04,
    fontFamily: 'EuclidSquare-SemiBold',
    textAlign: 'center',
    marginBottom: '5%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ADB5BD',
    paddingVertical: '4%',
    paddingHorizontal: '5%',
    borderRadius: 8,
    marginBottom: '5%',
    color: '#495057',
    fontFamily: 'EuclidSquare-Regular',
    fontSize: Dimensions.get('window').width * 0.04,
  },
  button: {
    backgroundColor: '#00B383',
    paddingVertical: '4%',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: '10%',
  },
  disabledButton: {
    backgroundColor: '#CED4DA',
  },
  buttonText: {
    color: '#fff',
    fontSize: Dimensions.get('window').width * 0.04,
    fontFamily: 'EuclidSquare-Regular',
  },
  googleButton: {
    borderColor: '#495057',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: '3%',
    marginBottom: '5%',
  },
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#495057',
    fontSize: Dimensions.get('window').width * 0.035,
    fontFamily: 'EuclidSquare-SemiBold',
  },
  linkContainer: {
    marginTop: '3%',
    alignItems: 'center',
  },
  link: {
    color: '#495057',
    fontSize: Dimensions.get('window').width * 0.035,
    fontFamily: 'EuclidSquare-SemiBold',
    textDecorationLine: 'underline',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '10%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ADB5BD',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#6C757D',
    fontFamily: 'EuclidSquare-Regular',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: '3%',
  },
  signupText: {
    fontSize: Dimensions.get('window').width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
    marginBottom: '3%',
  },
  signupLink: {
    color: '#495057',
    fontSize: Dimensions.get('window').width * 0.035,
    fontFamily: 'EuclidSquare-SemiBold',
    textDecorationLine: 'underline',
  },
});

export default LoginStep1Screen;