import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import i18n from '../i18n';
import { getUserProfile, updateUserProfile } from '../services/userService';

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

export const useProfile = (navigation: any) => {
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
        processUserData(userData);
        setLoading(false);
        return;
      }

      const profileData = await getUserProfile(user.uid);
      if (profileData) {
        setProfile(profileData);
        processUserData(profileData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert(i18n.t('profile.error'), 'Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const processUserData = (data: any) => {
    if (data.firstName && data.lastName) {
      setFirstName(data.firstName);
      setLastName(data.lastName);
    } else {
      const fullName = data.displayName || '';
      const lastSpaceIndex = fullName.lastIndexOf(' ');

      if (lastSpaceIndex !== -1) {
        setFirstName(fullName.substring(0, lastSpaceIndex));
        setLastName(fullName.substring(lastSpaceIndex + 1));
      } else {
        setFirstName(fullName);
        setLastName('');
      }
    }
    setPhoto(data.photoURL);
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
      const profileData: { displayName: string; photoURL?: string } = { displayName };

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
      [{ text: i18n.t('map.ok'), onPress: () => console.log("Image picker functionality is disabled") }]
    );
  };

  return {
    loading,
    updating,
    profile,
    firstName,
    lastName,
    photo,
    setFirstName,
    setLastName,
    goBackToHomeWithMenuOpen,
    handleUpdateProfile,
    pickImage
  };
};