import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import i18n from '../i18n';

import ArrowLeftIcon from '../assets/images/icons/arrow-left-bg.svg';
import EyeOffIcon from '../assets/images/icons/eye-off.svg';
import EyeIcon from '../assets/images/icons/eye.svg';

const { width } = Dimensions.get('window');

const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout, deleteAccount } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Estados para el selector de idiomas
  const [currentLanguage, setCurrentLanguage] = useState<'pt' | 'en'>(i18n.locale as 'pt' | 'en');
  const [changingLanguage, setChangingLanguage] = useState(false);

  // Función para verificar si el usuario se logueó con Google
  const isGoogleUser = () => {
    return user?.providerData?.some(provider => provider.providerId === 'google.com') || false;
  };

  // Cargar idioma guardado al montar el componente
  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('@goldenbook_language');
        if (savedLanguage && (savedLanguage === 'pt' || savedLanguage === 'en')) {
          setCurrentLanguage(savedLanguage);
          i18n.locale = savedLanguage;
        }
      } catch (error) {
        console.error('Error loading saved language:', error);
      }
    };
    loadSavedLanguage();
  }, []);

  const goBackToHomeWithMenuOpen = () => {
    navigation.navigate('HomeScreen', {
      openMenu: true,
      selectedLocation: undefined,
      refreshTimestamp: Date.now()
    } as any);
  };

  // Función para cambiar idioma
  const changeLanguage = async (language: 'pt' | 'en') => {
    if (language === currentLanguage) return;

    setChangingLanguage(true);
    try {
      // Cambiar idioma en i18n
      i18n.locale = language;
      setCurrentLanguage(language);

      // Guardar preferencia en AsyncStorage
      await AsyncStorage.setItem('@goldenbook_language', language);

      // Pequeña pausa para mostrar el cambio visual
      setTimeout(() => {
        setChangingLanguage(false);
      }, 300);

    } catch (error) {
      console.error('Error changing language:', error);
      setChangingLanguage(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(i18n.t('profile.error'), i18n.t('settings.passwordFieldsRequired'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(i18n.t('profile.error'), i18n.t('settings.passwordMismatch'));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(i18n.t('profile.error'), i18n.t('settings.passwordTooShort'));
      return;
    }

    setUpdatingPassword(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        i18n.t('profile.success'),
        i18n.t('settings.passwordUpdateSuccess'),
        [
          {
            text: i18n.t('map.ok'),
            onPress: () => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error updating password:', error);
      Alert.alert(i18n.t('profile.error'), i18n.t('settings.passwordUpdateError'));
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    const confirmMessage = isGoogleUser()
      ? i18n.t('settings.deleteAccountConfirmGoogleMessage')
      : i18n.t('settings.deleteAccountConfirmMessage');

    Alert.alert(
      i18n.t('settings.deleteAccountConfirmTitle'),
      confirmMessage,
      [
        {
          text: i18n.t('profile.cancel'),
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await deleteAccount();

      Alert.alert(
        i18n.t('settings.deleteAccountSuccessTitle'),
        i18n.t('settings.deleteAccountSuccessMessage'),
        [
          {
            text: i18n.t('map.ok'),
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'LoginStep1' }],
              });
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error deleting account:', error);
      Alert.alert(i18n.t('profile.error'), error?.message || i18n.t('settings.deleteAccountError'));
    } finally {
      setDeletingAccount(false);
    }
  };

  const PasswordInput = ({
    label,
    value,
    onChangeText,
    showPassword,
    onToggleVisibility,
    placeholder
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    showPassword: boolean;
    onToggleVisibility: () => void;
    placeholder: string;
  }) => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordInputContainer}>
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#ADB5BD"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={onToggleVisibility}
        >
          {showPassword ? (
            <EyeOffIcon width={width * 0.05} height={width * 0.05} />
          ) : (
            <EyeIcon width={width * 0.05} height={width * 0.05} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Componente para las opciones de idioma
  const LanguageOption = ({
    language,
    flag,
    label
  }: {
    language: 'pt' | 'en';
    flag: string;
    label: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.languageOption,
        currentLanguage === language && styles.languageOptionActive
      ]}
      onPress={() => changeLanguage(language)}
      disabled={changingLanguage}
    >
      <View style={styles.languageContent}>
        <Text style={styles.languageFlag}>{flag}</Text>
        <Text style={[
          styles.languageLabel,
          currentLanguage === language && styles.languageLabelActive
        ]}>
          {label}
        </Text>
      </View>

      {currentLanguage === language && (
        <View style={styles.checkIconContainer}>
          {changingLanguage ? (
            <ActivityIndicator size="small" color="#E8A756" />
          ) : (
            <View style={styles.checkIcon}>
              <Text style={styles.checkMark}>✓</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBackToHomeWithMenuOpen}
        >
          <ArrowLeftIcon width={width * 0.08} height={width * 0.08} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t('menu.settings')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.settingsContainer}>

          {/* Sección de Idioma */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {currentLanguage === 'en' ? 'Language' : 'Idioma'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {currentLanguage === 'en'
                ? 'Choose your preferred language for the app.'
                : 'Escolha o seu idioma preferido para a aplicação.'
              }
            </Text>

            <View style={styles.languageContainer}>
              <LanguageOption
                language="pt"
                flag="🇵🇹"
                label="Português"
              />
              <LanguageOption
                language="en"
                flag="🇬🇧"
                label="English"
              />
            </View>
          </View>

          {/* Solo mostrar sección de cambio de contraseña para usuarios que NO son de Google */}
          {!isGoogleUser() && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{i18n.t('settings.password')}</Text>
              <Text style={styles.sectionSubtitle}>
                {i18n.t('settings.passwordSubtitle')}
              </Text>

              <PasswordInput
                label={i18n.t('settings.currentPassword')}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                showPassword={showCurrentPassword}
                onToggleVisibility={() => setShowCurrentPassword(!showCurrentPassword)}
                placeholder={i18n.t('settings.enterCurrentPassword')}
              />

              <View style={styles.formGroup}>
                <Text style={styles.label}>{i18n.t('settings.newPassword')}</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder={i18n.t('settings.enterNewPassword')}
                    placeholderTextColor="#ADB5BD"
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOffIcon width={width * 0.05} height={width * 0.05} />
                    ) : (
                      <EyeIcon width={width * 0.05} height={width * 0.05} />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.helperText}>
                  {i18n.t('settings.passwordRequirement')}
                </Text>
              </View>

              <PasswordInput
                label={i18n.t('settings.confirmPassword')}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                showPassword={showConfirmPassword}
                onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                placeholder={i18n.t('settings.confirmNewPassword')}
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  disabled={updatingPassword}
                >
                  <Text style={styles.cancelButtonText}>{i18n.t('profile.cancel')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.updateButton, updatingPassword && styles.disabledButton]}
                  onPress={handleChangePassword}
                  disabled={updatingPassword}
                >
                  {updatingPassword ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.updateButtonText}>{i18n.t('settings.updatePassword')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Mostrar información para usuarios de Google */}
          {isGoogleUser() && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{i18n.t('settings.googleAccountTitle')}</Text>
              <Text style={styles.sectionSubtitle}>
                {i18n.t('settings.googleAccountSubtitle')}
              </Text>
              <View style={styles.googleNoticeContainer}>
                <Text style={styles.googleNoticeText}>
                  {i18n.t('settings.googleAccountNotice')}
                </Text>
              </View>
            </View>
          )}

          {/* Sección de eliminar cuenta (siempre visible) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{i18n.t('settings.deleteAccountTitle')}</Text>
            <Text style={styles.sectionSubtitle}>
              {isGoogleUser()
                ? i18n.t('settings.deleteAccountGoogleSubtitle')
                : i18n.t('settings.deleteAccountSubtitle')
              }
            </Text>

            <TouchableOpacity
              style={[styles.deleteButton, deletingAccount && styles.disabledButton]}
              onPress={handleDeleteAccount}
              disabled={deletingAccount}
            >
              {deletingAccount ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.deleteButtonText}>{i18n.t('settings.deleteAccountButton')}</Text>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.04,
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
  },
  backButton: {
    padding: width * 0.02,
  },
  headerTitle: {
    fontSize: width * 0.05,
    fontFamily: 'EuclidSquare-SemiBold',
    color: '#1A1A2E',
  },
  headerRight: {
    width: width * 0.08,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: width * 0.1,
  },
  settingsContainer: {
    padding: width * 0.05,
  },
  section: {
    marginBottom: width * 0.08,
  },
  sectionTitle: {
    fontSize: width * 0.045,
    fontFamily: 'EuclidSquare-SemiBold',
    color: '#1A1A2E',
    marginBottom: width * 0.01,
  },
  sectionSubtitle: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
    marginBottom: width * 0.05,
  },
  // Estilos para el selector de idiomas
  languageContainer: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  languageOptionActive: {
    backgroundColor: '#FFF8E7',
    borderBottomColor: '#E8A756',
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: width * 0.06,
    marginRight: width * 0.03,
  },
  languageLabel: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Medium',
    color: '#1A1A2E',
  },
  languageLabelActive: {
    color: '#B8860B',
    fontFamily: 'EuclidSquare-SemiBold',
  },
  checkIconContainer: {
    marginLeft: width * 0.02,
  },
  checkIcon: {
    width: width * 0.06,
    height: width * 0.06,
    borderRadius: width * 0.03,
    backgroundColor: '#E8A756',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: width * 0.035,
    fontWeight: 'bold',
  },
  googleNoticeContainer: {
    backgroundColor: '#E3F2FD',
    padding: width * 0.04,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  googleNoticeText: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Medium',
    color: '#1565C0',
  },
  formGroup: {
    marginBottom: width * 0.04,
  },
  label: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Medium',
    color: '#1A1A2E',
    marginBottom: width * 0.01,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: width * 0.03,
    paddingVertical: Platform.OS === 'ios' ? width * 0.03 : width * 0.02,
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Regular',
    color: '#1A1A2E',
  },
  eyeButton: {
    padding: width * 0.02,
    marginRight: width * 0.01,
  },
  helperText: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
    marginTop: width * 0.008,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: width * 0.04,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: width * 0.035,
    alignItems: 'center',
    marginRight: width * 0.02,
  },
  cancelButtonText: {
    color: '#1A1A2E',
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Medium',
  },
  updateButton: {
    flex: 2,
    backgroundColor: '#E8A756',
    borderRadius: 8,
    paddingVertical: width * 0.035,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Medium',
  },
  deleteButton: {
    backgroundColor: '#E53935',
    borderRadius: 8,
    paddingVertical: width * 0.035,
    alignItems: 'center',
    marginTop: width * 0.02,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Medium',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default SettingsScreen;