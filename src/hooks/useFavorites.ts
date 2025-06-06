import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import i18n from '../i18n';
import { Establishment, getEstablishmentById } from '../services/firestoreService';
import { getUserFavorites, getUserLikes, removeFromFavorites } from '../services/userService';

export const useFavorites = () => {
  const { user, isGuest } = useAuth();
  const [favorites, setFavorites] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingFavorites, setRemovingFavorites] = useState<Set<string>>(new Set());
  const [userLikes, setUserLikes] = useState<string[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [user, isGuest])
  );

  const loadFavorites = async () => {
    if (!user || isGuest) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [favoriteIds, likes] = await Promise.all([
        getUserFavorites(user.uid),
        getUserLikes(user.uid)
      ]);

      setUserLikes(likes);

      if (favoriteIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const favoriteEstablishments = await Promise.all(
        favoriteIds.map(async (id) => {
          try {
            const establishment = await getEstablishmentById(id);
            return establishment;
          } catch (error) {
            console.warn(`Failed to load establishment ${id}:`, error);
            return null;
          }
        })
      );

      const validFavorites = favoriteEstablishments.filter(
        (establishment): establishment is Establishment =>
          establishment !== null && establishment !== undefined
      );

      setFavorites(validFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert(i18n.t('profile.error'), 'Failed to load your favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (establishmentId: string) => {
    if (!user || isGuest) return;

    setRemovingFavorites(prev => new Set(prev).add(establishmentId));

    try {
      const success = await removeFromFavorites(user.uid, establishmentId);

      if (success) {
        setFavorites(prev => prev.filter(item => item.id !== establishmentId));
      } else {
        Alert.alert(i18n.t('profile.error'), 'Failed to remove from favorites. Please try again.');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      Alert.alert(i18n.t('profile.error'), 'Failed to remove from favorites. Please try again.');
    } finally {
      setRemovingFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(establishmentId);
        return newSet;
      });
    }
  };

  const updateEstablishmentReviewCount = (establishmentId: string, increment: number) => {
    setFavorites(prevFavorites =>
      prevFavorites.map(fav =>
        fav.id === establishmentId
          ? { ...fav, reviewCount: Math.max(0, (fav.reviewCount || 0) + increment) }
          : fav
      )
    );
  };

  return {
    favorites,
    loading,
    removingFavorites,
    userLikes,
    handleRemoveFromFavorites,
    updateEstablishmentReviewCount
  };
};