import { Ionicons } from '@expo/vector-icons'; // Para el ícono de retroceso y el ojo
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RootStackParamList } from '../navigation/navigationTypes';
import { loginUser } from '../services/authService'; // Importa authService

type LoginStep2Props = NativeStackScreenProps<RootStackParamList, 'LoginStep2'>;

const LoginStep2Screen: React.FC<LoginStep2Props> = ({ route, navigation }) => {
  const { email } = route.params;
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña

  const handleLogin = async () => {
    try {
      const user = await loginUser(email, password); // Usa authService para iniciar sesión
      alert(`Welcome back, ${user?.email}`);
      navigation.navigate('HomeScreen');
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Botón de retroceso */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#495057" />
      </TouchableOpacity>

      {/* Título */}
      <Text style={styles.title}>Welcome to</Text>

      {/* Logo */}
      <Image
        source={require('../assets/LOGOGB1.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Input de contraseña con funcionalidad de mostrar/ocultar */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#6C757D"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="#495057"
          />
        </TouchableOpacity>
      </View>

      {/* Botón de inicio de sesión */}
      <TouchableOpacity
        style={[styles.button, !password && styles.disabledButton]}
        onPress={handleLogin}
        disabled={!password}
      >
        <Text style={styles.buttonText}>LOG IN</Text>
      </TouchableOpacity>

      {/* Enlace de recuperación de contraseña */}
      <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
        <Text style={styles.link}>Forgot password?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '10%',
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: '6%',
    left: '6%',
  },
  logo: {
    width: Dimensions.get('window').width * 0.5,
    height: Dimensions.get('window').height * 0.1,
    marginBottom: '5%',
  },
  title: {
    fontSize: Dimensions.get('window').width * 0.05,
    fontFamily: 'EuclidSquare-SemiBold',
    color: '#161B33',
    textAlign: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    marginBottom: '5%',
  },
  input: {
    flex: 1,
    paddingVertical: '4%',
    paddingHorizontal: '5%',
    fontFamily: 'EuclidSquare-Regular',
    fontSize: Dimensions.get('window').width * 0.035,
    color: '#161B33',
  },
  eyeIcon: {
    paddingHorizontal: '3%',
  },
  button: {
    width: '100%',
    backgroundColor: '#00B383',
    paddingVertical: '4%',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: '5%',
  },
  disabledButton: {
    backgroundColor: '#CED4DA',
  },
  buttonText: {
    color: '#fff',
    fontSize: Dimensions.get('window').width * 0.035,
    fontFamily: 'EuclidSquare-SemiBold',
  },
  link: {
    marginTop: '3%',
    color: '#495057',
    fontSize: Dimensions.get('window').width * 0.035,
    fontFamily: 'EuclidSquare-SemiBold',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});

export default LoginStep2Screen;
