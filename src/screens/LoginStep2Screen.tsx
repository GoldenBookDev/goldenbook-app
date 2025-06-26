import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import usePermissions from '../hooks/usePermissions'; // Importar el hook
import i18n from '../i18n';
import { RootStackParamList } from '../navigation/navigationTypes';
import { loginUser } from '../services/authService';

type LoginStep2Props = NativeStackScreenProps<RootStackParamList, 'LoginStep2'>;

const LoginStep2Screen: React.FC<LoginStep2Props> = ({ route, navigation }) => {
  const { email } = route.params;
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Hook de permisos que se ejecutará después del login exitoso
  const { requestAllPermissions, isLoading: isRequestingPermissions } = usePermissions({
    requestOnMount: false,
    onComplete: () => {
      // Navegar a LocationSelection cuando los permisos terminen
      navigation.reset({
        index: 0,
        routes: [{ name: 'LocationSelection' }],
      });
    },
    showAlertOnDenied: true,
  });

  const handleLogin = async () => {
    if (!password.trim()) {
      alert(i18n.t('auth.enterPassword'));
      return;
    }

    try {
      setIsLoggingIn(true);
      const user = await loginUser(email, password);

      // En lugar de navegar directamente, solicitar permisos primero
      requestAllPermissions();
    } catch (error: any) {
      alert(error.message);
      setIsLoggingIn(false);
    }
  };

  // Mostrar loading si está logueando o solicitando permisos
  const showLoading = isLoggingIn || isRequestingPermissions;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        disabled={showLoading}
      >
        <Ionicons name="arrow-back" size={24} color="#495057" />
      </TouchableOpacity>

      {showLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00B383" />
          <Text style={styles.loadingText}>
            {isRequestingPermissions
              ? i18n.t('permissions.requesting')
              : i18n.t('auth.signingIn')
            }
          </Text>
        </View>
      )}

      <Text style={styles.title}>{i18n.t('auth.welcomeTo')}</Text>

      <Image
        source={require('../assets/LOGOGB1.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder={i18n.t('auth.password')}
          placeholderTextColor="#6C757D"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          editable={!showLoading}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
          disabled={showLoading}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="#495057"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, (!password.trim() || showLoading) && styles.disabledButton]}
        onPress={handleLogin}
        disabled={!password.trim() || showLoading}
      >
        <Text style={styles.buttonText}>{i18n.t('auth.login')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('ResetPassword')}
        disabled={showLoading}
      >
        <Text style={styles.link}>{i18n.t('auth.forgotPassword')}</Text>
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  loadingText: {
    marginTop: 10,
    fontSize: Dimensions.get('window').width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
    textAlign: 'center',
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
    fontSize: Dimensions.get('window').width * 0.04,
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