import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
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
import { getUserProfile, updateUserProfile, uploadProfileImage } from '../services/userService';

import ArrowLeftIcon from '../assets/images/icons/arrow-left-bg.svg';
import PlusIcon from '../assets/images/icons/plus.svg';
import UserIcon from '../assets/images/icons/user.svg';

const { width } = Dimensions.get('window');

interface UserProfile {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string | null;
  email?: string;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, updateUserData, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (userData && userData.displayName) {
        setProfile(userData);

        if (userData.firstName && userData.lastName) {
          setFirstName(userData.firstName);
          setLastName(userData.lastName);
        } else {
          const fullName = userData.displayName || '';
          const lastSpaceIndex = fullName.lastIndexOf(' ');

          if (lastSpaceIndex !== -1) {
            setFirstName(fullName.substring(0, lastSpaceIndex));
            setLastName(fullName.substring(lastSpaceIndex + 1));
          } else {
            setFirstName(fullName);
            setLastName('');
          }
        }

        setPhoto(userData.photoURL);
        setLoading(false);
        return;
      }

      const profileData = await getUserProfile(user.uid);

      if (profileData) {
        setProfile(profileData);

        if (profileData.firstName && profileData.lastName) {
          setFirstName(profileData.firstName);
          setLastName(profileData.lastName);
        } else {
          const fullName = profileData.displayName || '';
          const lastSpaceIndex = fullName.lastIndexOf(' ');

          if (lastSpaceIndex !== -1) {
            setFirstName(fullName.substring(0, lastSpaceIndex));
            setLastName(fullName.substring(lastSpaceIndex + 1));
          } else {
            setFirstName(fullName);
            setLastName('');
          }
        }

        setPhoto(profileData.photoURL);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      Alert.alert(i18n.t('profile.error'), 'Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const goBackToHomeWithMenuOpen = () => {
    navigation.navigate('HomeScreen', {
      openMenu: true,
      selectedLocation: undefined,
      refreshTimestamp: Date.now()
    } as any);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setUpdating(true);
    try {
      const displayName = `${firstName} ${lastName}`.trim();

      const profileData: {
        displayName: string;
        firstName: string;
        lastName: string;
        photoURL?: string
      } = {
        displayName,
        firstName,
        lastName
      };

      if (photo !== null) {
        profileData.photoURL = photo;
      }

      const updatedUserData = {
        uid: user.uid,
        email: user.email || '',
        ...(userData || {}),
        displayName: displayName,
        firstName: firstName,
        lastName: lastName,
        photoURL: photo || '',
      };

      await updateUserData(updatedUserData);

      const success = await updateUserProfile(user.uid, profileData);

      if (success) {
        setProfile((prev: UserProfile | null) => {
          if (!prev) return updatedUserData;
          return { ...prev, ...updatedUserData };
        });

        Alert.alert(i18n.t('profile.success'), i18n.t('profile.profileUpdatedSuccessfully'), [
          {
            text: i18n.t('map.ok'),
            onPress: () => goBackToHomeWithMenuOpen()
          }
        ]);
      } else {
        Alert.alert(i18n.t('profile.error'), 'Failed to update profile in database. Please try again.');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert(i18n.t('profile.error'), i18n.t('profile.failedToUpdate'));
    } finally {
      setUpdating(false);
    }
  };

  const pickImage = async () => {
    try {
      // Solicitar permisos para la galería
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          i18n.t('profile.error'),
          'Necesitamos permisos para acceder a tu galería de fotos',
          [{ text: i18n.t('map.ok') }]
        );
        return;
      }

      // Mostrar opciones: Cámara o Galería
      Alert.alert(
        i18n.t('profile.selectPhotoSource'),
        i18n.t('profile.choosePhotoOption'),
        [
          {
            text: i18n.t('profile.camera'),
            onPress: () => openCamera(),
          },
          {
            text: i18n.t('profile.gallery'),
            onPress: () => openGallery(),
          },
          {
            text: i18n.t('common.cancel'),
            style: 'cancel',
          },
        ]
      );
    } catch (error: any) {
      console.error('Error requesting permissions:', error);
      Alert.alert(i18n.t('profile.error'), 'Error al solicitar permisos');
    }
  };

  const openCamera = async () => {
    try {
      // Solicitar permisos para la cámara
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          i18n.t('profile.error'),
          'Necesitamos permisos para usar la cámara',
          [{ text: i18n.t('map.ok') }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'], // API actualizada
        allowsEditing: true,
        aspect: [1, 1], // Cuadrado para foto de perfil
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error: any) {
      console.error('Error opening camera:', error);
      Alert.alert(i18n.t('profile.error'), 'Error al abrir la cámara');
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // API actualizada
        allowsEditing: true,
        aspect: [1, 1], // Cuadrado para foto de perfil
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error: any) {
      console.error('Error opening gallery:', error);
      Alert.alert(i18n.t('profile.error'), 'Error al abrir la galería');
    }
  };

  const uploadImage = async (imageUri: string) => {
    if (!user) {
      Alert.alert(i18n.t('profile.error'), 'Usuario no autenticado');
      return;
    }

    console.log('Attempting to upload image:', imageUri);
    setUploadingImage(true);

    try {
      const downloadURL = await uploadProfileImage(user.uid, imageUri);

      if (downloadURL) {
        console.log('Image uploaded successfully, URL:', downloadURL);
        setPhoto(downloadURL);

        // Actualizar inmediatamente en el contexto
        const updatedUserData = {
          uid: user.uid,
          email: user.email || '',
          ...(userData || {}),
          photoURL: downloadURL,
        };
        await updateUserData(updatedUserData);

        Alert.alert(
          i18n.t('profile.success'),
          i18n.t('profile.photoUploadedSuccessfully')
        );
      } else {
        throw new Error('Failed to get download URL');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      console.error('Error details:', error?.message || 'Unknown error');

      Alert.alert(
        i18n.t('profile.error'),
        `${i18n.t('profile.photoUploadFailed')}\n\nDetalle: ${error?.message || 'Error desconocido'}`
      );
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E8A756" />
        <Text style={styles.loadingText}>{i18n.t('profile.loadingProfile')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBackToHomeWithMenuOpen}
        >
          <ArrowLeftIcon width={width * 0.08} height={width * 0.08} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t('profile.profile')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileContainer}>
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>{i18n.t('profile.personalInfo')}</Text>
            <Text style={styles.sectionSubtitle}>{i18n.t('profile.updatePhotoAndDetails')}</Text>

            <View style={styles.photoUploadSection}>
              <Text style={styles.label}>{i18n.t('profile.yourPhoto')}</Text>
              <Text style={styles.photoHelperText}>{i18n.t('profile.displayedOnProfile')}</Text>

              <TouchableOpacity
                onPress={pickImage}
                style={styles.photoContainerWrapper}
                disabled={uploadingImage}
              >
                <View style={styles.photoContainer}>
                  {uploadingImage ? (
                    <ActivityIndicator size="large" color="#E8A756" />
                  ) : photo ? (
                    <Image source={{ uri: photo }} style={styles.profilePhoto} />
                  ) : (
                    <UserIcon width={width * 0.15} height={width * 0.15} />
                  )}
                  <View style={styles.uploadButton}>
                    <PlusIcon width={width * 0.03} height={width * 0.03} />
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.uploadTextContainer}>
                <Text style={styles.uploadText}>
                  {uploadingImage ? i18n.t('profile.uploadingPhoto') : i18n.t('profile.clickToUpload')}
                </Text>
                <Text style={styles.uploadHelperText}>
                  {i18n.t('profile.supportedFormats')}
                </Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{i18n.t('profile.firstName')} *</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder={i18n.t('profile.enterFirstName')}
                placeholderTextColor="#ADB5BD"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{i18n.t('profile.lastName')} *</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder={i18n.t('profile.enterLastName')}
                placeholderTextColor="#ADB5BD"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{i18n.t('profile.email')}</Text>
              <Text style={styles.infoText}>{profile?.email || user?.email}</Text>
              <Text style={styles.helperText}>{i18n.t('profile.emailCannotChange')}</Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.cancelButton, styles.verticalButton]}
                onPress={goBackToHomeWithMenuOpen}
                disabled={updating || uploadingImage}
              >
                <Text style={styles.cancelButtonText}>{i18n.t('profile.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.updateButton,
                  styles.verticalButton,
                  (updating || uploadingImage) && styles.disabledButton
                ]}
                onPress={handleUpdateProfile}
                disabled={updating || uploadingImage}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.updateButtonText}>{i18n.t('profile.updateProfileInfo')}</Text>
                )}
              </TouchableOpacity>
            </View>
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
  profileContainer: {
    padding: width * 0.05,
  },
  infoSection: {
    marginTop: width * 0.02,
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
  photoUploadSection: {
    marginBottom: width * 0.05,
  },
  photoContainerWrapper: {
    marginVertical: width * 0.02,
  },
  photoContainer: {
    position: 'relative',
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: width * 0.1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#E8A756',
    width: width * 0.06,
    height: width * 0.06,
    borderRadius: width * 0.03,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  photoHelperText: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
    marginBottom: width * 0.02,
  },
  uploadTextContainer: {
    marginTop: width * 0.02,
  },
  uploadText: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Medium',
    color: '#1A1A2E',
  },
  uploadHelperText: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
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
  input: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    paddingHorizontal: width * 0.03,
    paddingVertical: Platform.OS === 'ios' ? width * 0.03 : width * 0.02,
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Regular',
    color: '#1A1A2E',
  },
  infoText: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Regular',
    color: '#1A1A2E',
    paddingVertical: width * 0.01,
  },
  helperText: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
    marginTop: width * 0.01,
  },
  buttonContainer: {
    flexDirection: 'column',
    marginTop: width * 0.04,
    gap: width * 0.03,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: width * 0.035,
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#E8A756',
    borderRadius: 8,
    paddingVertical: width * 0.035,
    alignItems: 'center',
  },
  verticalButton: {
    width: '100%',
    minHeight: width * 0.12,
  },
  cancelButtonText: {
    color: '#1A1A2E',
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Medium',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Medium',
  },
  disabledButton: {
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: width * 0.03,
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
  }
});

export default ProfileScreen;