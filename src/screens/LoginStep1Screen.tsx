import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
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
import { auth } from '../config/firebaseConfig';
import { isValidEmail } from '../utils/validation'; // Importar validación

const LoginStep1Screen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: Platform.select({
      ios: '659096031354-gl59hae39tch43jsq8oefud2fcrvgd61.apps.googleusercontent.com',
      android: '659096031354-rnak01htij2au9etjjo7apip752v51rm.apps.googleusercontent.com',
      web: '659096031354-d07tgprkpful0dn5tgbtkbfrvqok3leo.apps.googleusercontent.com',
    }),
    ...(Platform.OS !== 'web' && {
      expoClientId: '659096031354-d07tgprkpful0dn5tgbtkbfrvqok3leo.apps.googleusercontent.com',
    }),
    redirectUri: AuthSession.makeRedirectUri({
      useProxy: true,
    } as AuthSession.AuthSessionRedirectUriOptions),
  });

  useEffect(() => {
    setIsEmailValid(isValidEmail(email)); // Actualiza el estado según la validación
  }, [email]);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((userCredential) => {
          Alert.alert(
            'Login exitoso',
            `Bienvenido ${userCredential.user.displayName}`
          );
          navigation.navigate('LocationSelection');
        })
        .catch((error) => {
          Alert.alert('Error', error.message);
        });
    }
  }, [response]);

  const handleContinue = () => {
    if (!isEmailValid) {
      alert('Please enter a valid email');
      return;
    }
    navigation.navigate('LoginStep2', { email });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log in or sign up</Text>
      <TextInput
        style={[
          styles.input,
          { borderColor: isEmailValid ? '#ADB5BD' : '#FF4D4F' }, // Cambia el borde si es inválido
        ]}
        placeholder="Email"
        placeholderTextColor="#6C757D"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity
        style={[styles.button, !isEmailValid && styles.disabledButton]}
        onPress={handleContinue}
        disabled={!isEmailValid}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={() => promptAsync()}
      >
        <View style={styles.googleContent}>
          <Image
            source={require('../assets/google-icon.png')}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.signupLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => navigation.navigate('LocationSelection')}
      >
        <Text style={styles.link}>Continue without an account</Text>
      </TouchableOpacity>
    </View>
  );
};

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
