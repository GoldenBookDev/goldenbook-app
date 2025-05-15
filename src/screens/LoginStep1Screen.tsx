import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
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
import { isValidEmail } from '../utils/validation';

// Registra la finalización de la sesión web
WebBrowser.maybeCompleteAuthSession();

const LoginStep1Screen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Configuración de la solicitud de autenticación de Google corregida
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: Platform.select({
      ios: '659096031354-gl59hae39tch43jsq8oefud2fcrvgd61.apps.googleusercontent.com',
      android: '659096031354-rnak01htij2au9etjjo7apip752v51rm.apps.googleusercontent.com',
      web: '659096031354-d07tgprkpful0dn5tgbtkbfrvqok3leo.apps.googleusercontent.com',
    }) || '',
    scopes: ['profile', 'email']
  });

  // Validación de email
  useEffect(() => {
    setIsEmailValid(isValidEmail(email));
  }, [email]);

  // Manejar la respuesta de autenticación
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      
      // Esta vez usamos un enfoque con más registros de log para depuración
      console.log('Success response received');
      
      if (authentication) {
        console.log('Authentication received', !!authentication.accessToken);
        
        // Crear credencial de Firebase con el token de acceso
        const credential = GoogleAuthProvider.credential(
          null,
          authentication.accessToken
        );
        
        console.log('Credential created, signing in...');
        
        // Iniciar sesión con Firebase
        signInWithCredential(auth, credential)
          .then((result) => {
            console.log('Sign in successful!');
            console.log('User: ', result.user.displayName);
            
            Alert.alert(
              'Login exitoso',
              `Bienvenido ${result.user.displayName || result.user.email}`
            );
            
            navigation.navigate('LocationSelection');
          })
          .catch((error) => {
            console.error('Firebase sign in error:', error);
            setAuthError(error.message);
            Alert.alert('Error', error.message);
          });
      } else {
        console.error('No authentication data received');
        setAuthError('Failed to authenticate with Google');
      }
    } else if (response?.type === 'error') {
      console.error('Google auth error:', response.error);
      setAuthError(response.error?.message || 'Error al autenticar con Google');
    }
  }, [response, navigation]);

  // Continuar con email
  const handleContinue = () => {
    if (!isEmailValid) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }
    navigation.navigate('LoginStep2', { email });
  };

  // Función para iniciar la autenticación de Google
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    console.log('Iniciar autenticación con Google');
    
    try {
      await promptAsync();
    } catch (error: any) {
      console.error('Error initiating Google sign in:', error);
      setAuthError(error.message);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log in or sign up</Text>
      
      {/* Mostrar error de autenticación si existe */}
      {authError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{authError}</Text>
        </View>
      )}
      
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

      {/* Botón de Google */}
      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleSignIn}
        disabled={!request}
      >
        <View style={styles.googleContent}>
          <Image
            source={require('../assets/google-icon.png')}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
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
        onPress={() => navigation.navigate('LocationSelection')}
      >
        <Text style={styles.link}>Continue without an account</Text>
      </TouchableOpacity>
    </View>
  );
};

// Estilos
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
  errorContainer: {
    backgroundColor: '#FFEEEE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorText: {
    color: '#E53935',
    fontSize: Dimensions.get('window').width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
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