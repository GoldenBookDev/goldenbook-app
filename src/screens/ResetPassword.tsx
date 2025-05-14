import { Ionicons } from '@expo/vector-icons'; // Para el ícono de retroceso
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RootStackParamList } from '../navigation/navigationTypes';
import { resetPassword } from '../services/authService'; // Importa el servicio de autenticación
import { isValidEmail } from '../utils/validation'; // Importar la validación

type ResetPasswordProps = NativeStackScreenProps<
  RootStackParamList,
  'ResetPassword'
>;

const ResetPasswordScreen: React.FC<ResetPasswordProps> = ({
  navigation,
}) => {
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false); // Validación del email

  useEffect(() => {
    setIsEmailValid(isValidEmail(email)); // Actualiza la validación del email
  }, [email]);

  const handleSendResetLink = async () => {
    if (!isEmailValid) {
      alert('Please enter a valid email');
      return;
    }

    try {
      await resetPassword(email); // Usa el servicio de autenticación
      alert('Reset link sent to your email');
      navigation.goBack(); // Vuelve a la pantalla anterior
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

      {/* Contenido */}
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.subText}>
        We will send you an email with the link to reset your password. Enter
        the email associated with your account.
      </Text>

      <TextInput
        style={[
          styles.input,
          { borderColor: isEmailValid ? '#CED4DA' : '#FF4D4F' }, // Cambia el borde según la validación
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
        onPress={handleSendResetLink}
        disabled={!isEmailValid}
      >
        <Text style={styles.buttonText}>SEND RESET LINK</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Centra el contenido verticalmente
    alignItems: 'center', // Centra el contenido horizontalmente
    paddingHorizontal: '10%',
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: '6%',
    left: '6%',
  },
  closeButtonText: {
    fontSize: 24,
    fontFamily: 'EuclidSquare-Bold',
    color: '#495057',
  },
  title: {
    fontSize: Dimensions.get('window').width * 0.05,
    fontFamily: 'EuclidSquare-SemiBold',
    color: '#161B33',
    textAlign: 'center',
    marginBottom: '5%',
  },
  subText: {
    fontSize: Dimensions.get('window').width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: '5%',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#CED4DA',
    paddingVertical: '4%',
    paddingHorizontal: '5%',
    borderRadius: 8,
    fontFamily: 'EuclidSquare-Regular',
    fontSize: Dimensions.get('window').width * 0.035,
    color: '#161B33',
    marginBottom: '5%',
  },
  button: {
    width: '100%',
    backgroundColor: '#00B383',
    paddingVertical: '4%',
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CED4DA',
  },
  buttonText: {
    color: '#fff',
    fontSize: Dimensions.get('window').width * 0.035,
    fontFamily: 'EuclidSquare-SemiBold',
  },
});

export default ResetPasswordScreen;
