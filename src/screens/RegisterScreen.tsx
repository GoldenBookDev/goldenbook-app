import { Ionicons } from '@expo/vector-icons'; // Íconos de ojo
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import CheckBox from 'expo-checkbox';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RootStackParamList } from '../navigation/navigationTypes';
import { registerUser } from '../services/authService'; // Importa authService
import { isValidEmail, isValidPassword } from '../utils/validation';

type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isMarketingChecked, setIsMarketingChecked] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  useEffect(() => {
    // Valida el email y actualiza el error
    if (email && !isValidEmail(email)) {
      setEmailError('Please enter a valid email');
    } else {
      setEmailError('');
    }

    // Valida la contraseña y actualiza el error
    if (password && !isValidPassword(password)) {
      setPasswordError(
        'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, and a number.'
      );
    } else {
      setPasswordError('');
    }

    // Valida la confirmación de contraseña
    if (confirmPassword && confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  }, [email, password, confirmPassword]);

  const handleRegister = async () => {
    if (emailError || passwordError || confirmPasswordError) {
      Alert.alert('Error', 'Please fix the errors before continuing');
      return;
    }

    try {
      const user = await registerUser(email, password); // Usa authService para registrar
      Alert.alert(
        'Success',
        `Account created successfully! A verification email has been sent to ${user?.email}.`
      );
      navigation.navigate('LoginStep1');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete registration</Text>
      <TextInput
        style={[
          styles.input,
          { borderColor: emailError ? '#FF4D4F' : '#CED4DA' },
        ]}
        placeholder="Email"
        placeholderTextColor="#6C757D"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      <Text style={styles.subText}>
        We will send you an email to confirm your account
      </Text>

      <View style={styles.passwordContainer}>
        <TextInput
          style={[
            styles.input,
            { borderColor: passwordError ? '#FF4D4F' : '#CED4DA' },
          ]}
          placeholder="Password"
          placeholderTextColor="#6C757D"
          secureTextEntry={!isPasswordVisible}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Ionicons
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            size={20}
            color="#495057"
          />
        </TouchableOpacity>
      </View>
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      <View style={styles.passwordContainer}>
        <TextInput
          style={[
            styles.input,
            { borderColor: confirmPasswordError ? '#FF4D4F' : '#CED4DA' },
          ]}
          placeholder="Confirm Password"
          placeholderTextColor="#6C757D"
          secureTextEntry={!isConfirmPasswordVisible}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() =>
            setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
          }
        >
          <Ionicons
            name={isConfirmPasswordVisible ? 'eye-off' : 'eye'}
            size={20}
            color="#495057"
          />
        </TouchableOpacity>
      </View>
      {confirmPasswordError ? (
        <Text style={styles.errorText}>{confirmPasswordError}</Text>
      ) : null}

      <Text style={styles.termsText}>
        By selecting Accept and continue, I accept the{' '}
        <Text style={styles.linkText}>Terms and conditions</Text> and{' '}
        <Text style={styles.linkText}>Privacy policy</Text> of Goldenbook.
      </Text>

      <TouchableOpacity
        style={[
          styles.button,
          (emailError || passwordError || confirmPasswordError || !email || !password || !confirmPassword) &&
            styles.disabledButton,
        ]}
        onPress={handleRegister}
        disabled={
          !!(emailError || passwordError || confirmPasswordError || !email || !password || !confirmPassword)
        }
      >
        <Text style={styles.buttonText}>ACCEPT AND CONTINUE</Text>
      </TouchableOpacity>

      <Text style={styles.promotionText}>
        Goldenbook will send you push notifications and promotional emails with
        the most relevant recommendations and exclusive seasonal offers. You
        can unsubscribe at any moment.
      </Text>

      <View style={styles.checkboxContainer}>
        <CheckBox
          value={isMarketingChecked}
          onValueChange={setIsMarketingChecked}
          color={isMarketingChecked ? '#00B383' : undefined}
          style={styles.checkbox}
        />
        <Text style={styles.checkboxLabel}>
          I don’t wish to receive commercial messages by Goldenbook
        </Text>
      </View>

      <View style={styles.divider} />

      <TouchableOpacity onPress={() => navigation.navigate('LoginStep1')}>
        <Text style={styles.link}>Already have an account? Log in</Text>
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
    color: '#161B33',
    textAlign: 'center',
    marginBottom: '5%',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    paddingVertical: '4%',
    paddingHorizontal: '5%',
    borderRadius: 8,
    marginBottom: '3%',
    fontFamily: 'EuclidSquare-Regular',
    fontSize: Dimensions.get('window').width * 0.035,
    color: '#161B33',
  },
  errorText: {
    color: '#FF4D4F',
    fontSize: Dimensions.get('window').width * 0.03,
    marginBottom: '2%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '5%',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
  },
  subText: {
    fontSize: Dimensions.get('window').width * 0.03,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
    marginBottom: '5%',
  },
  termsText: {
    fontSize: Dimensions.get('window').width * 0.035,
    fontFamily: 'EuclidSquare-Medium',
    color: '#6C757D',
    marginTop: '3%',
    marginBottom: '5%',
    textAlign: 'left',
  },
  linkText: {
    color: '#1977F2',
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#00B383',
    paddingVertical: '4%',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: '3%',
    marginBottom: '5%',
  },
  disabledButton: {
    backgroundColor: '#CED4DA',
  },
  buttonText: {
    color: '#fff',
    fontSize: Dimensions.get('window').width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
  },
  promotionText: {
    fontSize: Dimensions.get('window').width * 0.03,
    fontFamily: 'EuclidSquare-Medium',
    color: '#6C757D',
    textAlign: 'left',
    marginBottom: '5%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '5%',
    marginTop: '3%',
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: Dimensions.get('window').width * 0.03,
    fontFamily: 'EuclidSquare-Medium',
    color: '#161B33',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#CED4DA',
    marginVertical: '3%',
  },
  link: {
    textAlign: 'left',
    color: '#1977F2',
    marginTop: '3%',
    fontSize: Dimensions.get('window').width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
  },
});

export default RegisterScreen;
