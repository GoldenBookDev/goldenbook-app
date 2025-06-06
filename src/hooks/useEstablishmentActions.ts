import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Share } from 'react-native';
import { useAuth } from '../context/AuthContext';
import i18n from '../i18n';
import {
    addLike,
    addToFavorites,
    getUserFavorites,
    getUserLikes,
    removeFromFavorites,
    removeLike
} from '../services/userService';

export const useEstablishmentActions = (
  establishmentId: string, 
  establishment: any, 
  navigation: any
) => {
  const { user, isGuest } = useAuth();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState<boolean>(false);
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [updatingLikes, setUpdatingLikes] = useState<Set<string>>(new Set());

  useFocusEffect(
    React.useCallback(() => {
      const checkUserStatus = async () => {
        if (user && !isGuest) {
          try {
            const [favorites, likes] = await Promise.all([
              getUserFavorites(user.uid),
              getUserLikes(user.uid)
            ]);
            setIsFavorite(favorites.includes(establishmentId));
            setUserLikes(likes);
          } catch (error) {
            console.error('Error checking user status:', error);
          }
        } else {
          setIsFavorite(false);
          setUserLikes([]);
        }
      };

      checkUserStatus();
    }, [user, isGuest, establishmentId])
  );

  const handleFavoriteToggle = async () => {
    if (!user || isGuest) {
      Alert.alert(
        i18n.t('establishment.signInRequired'),
        i18n.t('establishment.signInToSave'),
        [
          { text: i18n.t('establishment.cancel'), style: 'cancel' },
          { text: i18n.t('menu.signIn'), onPress: () => navigation.navigate('LoginStep1') },
        ]
      );
      return;
    }

    setIsUpdatingFavorite(true);

    try {
      if (isFavorite) {
        const success = await removeFromFavorites(user.uid, establishmentId);
        if (success) {
          setIsFavorite(false);
        } else {
          Alert.alert(i18n.t('profile.error'), 'Failed to remove from favorites. Please try again.');
        }
      } else {
        const success = await addToFavorites(user.uid, establishmentId);
        if (success) {
          setIsFavorite(true);
        } else {
          Alert.alert(i18n.t('profile.error'), 'Failed to add to favorites. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      Alert.alert(i18n.t('profile.error'), 'Something went wrong. Please try again.');
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!user || isGuest) {
      Alert.alert(
        i18n.t('establishment.signInRequired'),
        i18n.t('establishment.signInToLike'),
        [
          { text: i18n.t('establishment.cancel'), style: 'cancel' },
          { text: i18n.t('menu.signIn'), onPress: () => navigation.navigate('LoginStep1') },
        ]
      );
      return;
    }

    const isLiked = userLikes.includes(establishmentId);
    setUpdatingLikes(prev => new Set(prev).add(establishmentId));

    try {
      if (isLiked) {
        const success = await removeLike(user.uid, establishmentId);
        if (success) {
          setUserLikes(prev => prev.filter(id => id !== establishmentId));
        }
      } else {
        const success = await addLike(user.uid, establishmentId);
        if (success) {
          setUserLikes(prev => [...prev, establishmentId]);
        }
      }
    } catch (error) {
      console.error('Error updating like:', error);
      Alert.alert(i18n.t('profile.error'), 'Something went wrong. Please try again.');
    } finally {
      setUpdatingLikes(prev => {
        const newSet = new Set(prev);
        newSet.delete(establishmentId);
        return newSet;
      });
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `https://meek-toffee-0a1ea2.netlify.app/establishment/${establishmentId}`;
      const establishmentName = establishment.name.charAt(0).toUpperCase() + establishment.name.slice(1).toLowerCase();
      const shareMessage = `${establishmentName} - ${establishment.city}`;

      const result = await Share.share({
        title: establishmentName,
        message: `${shareMessage}\n${shareUrl}`,
      }, {
        dialogTitle: 'Share this place',
        subject: establishmentName,
      });

      if (result.action === Share.sharedAction) {
        console.log('✅ Contenido compartido exitosamente');
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      Alert.alert('Error', 'Could not share this content. Please try again.');
    }
  };

  return {
    isFavorite,
    isUpdatingFavorite,
    userLikes,
    updatingLikes,
    handleFavoriteToggle,
    handleLikeToggle,
    handleShare
  };
};