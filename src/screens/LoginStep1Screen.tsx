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
  ActivityIndicator
} from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { auth } from '../config/firebaseConfig';
import { isValidEmail } from '../utils/validation';
import useAuthentication from '../hooks/useAuthentication';
import i18n from '../i18n'; // Importar i18n

const LoginStep1Screen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const { loginWithGoogle } = useAuthentication();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: '659096031354-rkpvbl0neg4kusuvvq0gijio5jlhc8tl.apps.googleusercontent.com', 
    iosClientId: '659096031354-gl59hae39tch43jsq8oefud2fcrvgd61.apps.googleusercontent.com',
    webClientId: '659096031354-d07tgprkpful0dn5tgbtkbfrvqok3leo.apps.googleusercontent.com',
    redirectUri: AuthSession.makeRedirectUri({
      useProxy: true,
    } as AuthSession.AuthSessionRedirectUriOptions),
  });

  useEffect(() => {
    setIsEmailValid(isValidEmail(email));
  }, [email]);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      
      setIsLoggingIn(true);
      
      loginWithGoogle(id_token)
        .then((success) => {
          if (success) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'LocationSelection' }],
            });
          } else {
            Alert.alert('Error', 'No se pudo iniciar sesión con Google');
          }
        })
        .catch((error) => {
          console.error("Error en login con Google:", error);
          Alert.alert('Error', error?.message || 'Error al iniciar sesión con Google');
        })
        .finally(() => {
          setIsLoggingIn(false);
        });
    }
  }, [response]);

  const handleContinue = () => {
    if (!isEmailValid) {
      alert(i18n.t('auth.enterValidEmail'));
      return;
    }
    navigation.navigate('LoginStep2', { email });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('auth.loginTitle')}</Text>
      {isLoggingIn && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00B383" />
        </View>
      )}
      <TextInput
        style={[
          styles.input,
          { borderColor: isEmailValid ? '#ADB5BD' : '#FF4D4F' },
        ]}
        placeholder={i18n.t('auth.email')}
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
        <Text style={styles.buttonText}>{i18n.t('auth.continue')}</Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>{i18n.t('auth.or')}</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={() => promptAsync()}
        disabled={isLoggingIn}
      >
        <View style={styles.googleContent}>
          <Image
            source={require('../assets/google-icon.png')}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>{i18n.t('auth.continueWithGoogle')}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>{i18n.t('auth.dontHaveAccount')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.signupLink}>{i18n.t('auth.signUp')}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => navigation.navigate('LocationSelection')}
      >
        <Text style={styles.link}>{i18n.t('auth.continueWithoutAccount')}</Text>
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
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