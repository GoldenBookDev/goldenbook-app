import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert } from 'react-native';
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

export const useUserActions = (navigation: any) => {
  const { user, isGuest } = useAuth();
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [updatingFavorites, setUpdatingFavorites] = useState<Set<string>>(new Set());
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [updatingLikes, setUpdatingLikes] = useState<Set<string>>(new Set());

  useFocusEffect(
    React.useCallback(() => {
      const loadUserData = async () => {
        if (user && !isGuest) {
          try {
            const [favorites, likes] = await Promise.all([
              getUserFavorites(user.uid),
              getUserLikes(user.uid)
            ]);
            setUserFavorites(favorites);
            setUserLikes(likes);
          } catch (error) {
            console.error('Error loading user data:', error);
          }
        } else {
          setUserFavorites([]);
          setUserLikes([]);
        }
      };

      loadUserData();
    }, [user, isGuest])
  );

  const handleFavoriteToggle = async (establishmentId: string) => {
    if (!user || isGuest) {
      Alert.alert(
        i18n.t('category.signInRequired'),
        i18n.t('category.signInToSave'),
        [
          { text: i18n.t('category.cancel'), style: 'cancel' },
          { text: i18n.t('menu.signIn'), onPress: () => navigation.navigate('LoginStep1') },
        ]
      );
      return;
    }

    const isFavorite = userFavorites.includes(establishmentId);
    setUpdatingFavorites(prev => new Set(prev).add(establishmentId));

    try {
      if (isFavorite) {
        const success = await removeFromFavorites(user.uid, establishmentId);
        if (success) {
          setUserFavorites(prev => prev.filter(id => id !== establishmentId));
        } else {
          Alert.alert('Error', 'Failed to remove from favorites. Please try again.');
        }
      } else {
        const success = await addToFavorites(user.uid, establishmentId);
        if (success) {
          setUserFavorites(prev => [...prev, establishmentId]);
        } else {
          Alert.alert('Error', 'Failed to add to favorites. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setUpdatingFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(establishmentId);
        return newSet;
      });
    }
  };

  const handleLikeToggle = async (establishmentId: string, onUpdate?: (increment: number) => void) => {
    if (!user || isGuest) {
      Alert.alert(
        i18n.t('category.signInRequired'),
        i18n.t('category.signInToLike'),
        [
          { text: i18n.t('category.cancel'), style: 'cancel' },
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
          onUpdate?.(-1);
        } else {
          Alert.alert('Error', 'Failed to remove like. Please try again.');
        }
      } else {
        const success = await addLike(user.uid, establishmentId);
        if (success) {
          setUserLikes(prev => [...prev, establishmentId]);
          onUpdate?.(1);
        } else {
          Alert.alert('Error', 'Failed to add like. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error updating like:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setUpdatingLikes(prev => {
        const newSet = new Set(prev);
        newSet.delete(establishmentId);
        return newSet;
      });
    }
  };

  return {
    userFavorites,
    updatingFavorites,
    userLikes,
    updatingLikes,
    handleFavoriteToggle,
    handleLikeToggle
  };
};