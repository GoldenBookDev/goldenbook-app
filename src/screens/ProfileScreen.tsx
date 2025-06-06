import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, getUserProfile } from '../services/userService';
import i18n from '../i18n';

import ArrowLeftIcon from '../assets/images/icons/arrow-left-bg.svg';
import UserIcon from '../assets/images/icons/user.svg';
import PlusIcon from '../assets/images/icons/plus.svg';

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
    } catch (error) {
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

      const profileData: { displayName: string; photoURL?: string } = {
        displayName
      };

      if (photo !== null) {
        profileData.photoURL = photo;
      }

      const updatedUserData = {
        uid: user.uid,
        email: user.email || '',
        ...(userData || {}),
        displayName: displayName,
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
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(i18n.t('profile.error'), i18n.t('profile.failedToUpdate'));
    } finally {
      setUpdating(false);
    }
  };

  const pickImage = async () => {
    Alert.alert(
      i18n.t('profile.comingSoon'),
      i18n.t('profile.photoUploadFuture'),
      [
        {
          text: i18n.t('map.ok'),
          onPress: () => console.log("Image picker functionality is disabled")
        }
      ]
    );
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
              <Text style={styles.label}>{i18n.t('profile.yourPhoto')} *</Text>
              <Text style={styles.photoHelperText}>{i18n.t('profile.displayedOnProfile')}</Text>

              <TouchableOpacity
                onPress={pickImage}
                style={styles.photoContainerWrapper}>
                <View style={styles.photoContainer}>
                  {photo ? (
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
                <Text style={styles.uploadText}>{i18n.t('profile.clickToUpload')}</Text>
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
                disabled={updating}
              >
                <Text style={styles.cancelButtonText}>{i18n.t('profile.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.updateButton, styles.verticalButton, updating && styles.disabledButton]}
                onPress={handleUpdateProfile}
                disabled={updating}
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
    width: width * 0.08, // To balance the header
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
  // New photo upload section styling
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
    flexDirection: 'column', // CAMBIO: de 'row' a 'column'
    marginTop: width * 0.04,
    gap: width * 0.03, // AGREGAR: espacio entre botones
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: width * 0.035,
    alignItems: 'center',
    // marginRight: width * 0.02, // ELIMINAR
  },
  updateButton: {
    backgroundColor: '#E8A756',
    borderRadius: 8,
    paddingVertical: width * 0.035,
    alignItems: 'center',
  },
  // AGREGAR nuevo estilo:
  verticalButton: {
    width: '100%', // Toma todo el ancho disponible
    minHeight: width * 0.12, // Altura mínima consistente
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