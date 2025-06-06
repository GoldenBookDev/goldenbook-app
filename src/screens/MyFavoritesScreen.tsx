import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import i18n from '../i18n';

// Import components
import EmptyState from '../components/EmptyState';
import FavoriteEstablishmentItem from '../components/FavoriteEstablishmentItem';
import ScreenHeader from '../components/ScreenHeader';

// Import hooks
import { useFavorites } from '../hooks/useFavorites';
import { useUserActions } from '../hooks/useUserActions';

// Icons
import HeartIcon from '../assets/images/icons/heart.svg';

const { width } = Dimensions.get('window');

const MyFavoritesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isGuest } = useAuth();

  // Custom hooks
  const {
    favorites,
    loading,
    removingFavorites,
    userLikes,
    handleRemoveFromFavorites,
    updateEstablishmentReviewCount
  } = useFavorites();

  const {
    updatingLikes,
    handleLikeToggle
  } = useUserActions(navigation);

  const handleEstablishmentPress = (establishmentId: string) => {
    navigation.navigate('EstablishmentScreen', { establishmentId });
  };

  const renderFavoriteItem = ({ item }: { item: any }) => (
    <FavoriteEstablishmentItem
      item={item}
      isRemoving={removingFavorites.has(item.id)}
      isLiked={userLikes.includes(item.id)}
      isUpdatingLike={updatingLikes.has(item.id)}
      onPress={() => handleEstablishmentPress(item.id)}
      onRemoveFromFavorites={() => handleRemoveFromFavorites(item.id)}
      onLikeToggle={() => handleLikeToggle(item.id, (increment) =>
        updateEstablishmentReviewCount(item.id, increment)
      )}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      icon={<HeartIcon width={width * 0.2} height={width * 0.2} fill="#E8A756" />}
      title={i18n.t('favorites.noFavoritesYet')}
      description={i18n.t('favorites.discoverAmazingPlaces')}
      buttonText={i18n.t('favorites.startExploring')}
      onButtonPress={() => navigation.navigate('HomeScreen')}
    />
  );

  const renderGuestState = () => (
    <EmptyState
      icon={<Text style={screenStyles.emptyStateIcon}>🔒</Text>}
      title={i18n.t('favorites.signInToSeeFavorites')}
      description={i18n.t('favorites.createAccountToSave')}
      buttonText={i18n.t('menu.signIn')}
      onButtonPress={() => navigation.navigate('LoginStep1')}
    />
  );

  const renderLoadingState = () => (
    <View style={screenStyles.loadingContainer}>
      <ActivityIndicator size="large" color="#E8A756" />
      <Text style={screenStyles.loadingText}>{i18n.t('favorites.loadingFavorites')}</Text>
    </View>
  );

  const renderContent = () => {
    if (loading) return renderLoadingState();
    if (isGuest) return renderGuestState();
    if (favorites.length === 0) return renderEmptyState();

    return (
      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={screenStyles.favoritesContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={screenStyles.container}>
      <ScreenHeader
        title={i18n.t('favorites.myFavorites')}
        onBack={() => navigation.goBack()}
      />
      {renderContent()}
    </SafeAreaView>
  );
};

const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: width * 0.03,
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
  },
  favoritesContainer: {
    paddingTop: width * 0.02,
    paddingBottom: width * 0.05,
  },
  emptyStateIcon: {
    fontSize: width * 0.2,
    marginBottom: width * 0.04,
  },
});

export default MyFavoritesScreen;