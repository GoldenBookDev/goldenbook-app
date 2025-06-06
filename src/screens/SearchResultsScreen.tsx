import { NativeStackScreenProps } from '@react-navigation/native-stack';
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
import { RootStackParamList } from '../navigation/navigationTypes';

// Import components
import EstablishmentItem from '../components/EstablishmentItem';
import FloatingMapButton from '../components/FloatingMapButton';
import SearchHeader from '../components/SearchHeader';
import SearchResultsHeader from '../components/SearchResultsHeader';

// Import hooks
import { useSearchResults } from '../hooks/useSearchResults';
import { useUserActions } from '../hooks/useUserActions';

type SearchResultsScreenProps = NativeStackScreenProps<RootStackParamList, 'SearchResults'>;

const { width } = Dimensions.get('window');

const SearchResultsScreen = ({ route, navigation }: SearchResultsScreenProps) => {
  const { query, selectedLocation, categoryId } = route.params;

  // Custom hooks
  const {
    searchQuery,
    searchResults,
    locationName,
    loading,
    selectedFilter,
    setSelectedFilter,
    handleSearchChange,
    updateEstablishmentReviewCount
  } = useSearchResults(query, selectedLocation, categoryId);

  const {
    userFavorites,
    updatingFavorites,
    userLikes,
    updatingLikes,
    handleFavoriteToggle,
    handleLikeToggle
  } = useUserActions(navigation);

  const handleSearchSubmit = () => {
    console.log('Search submitted:', searchQuery);
  };

  const renderEstablishmentItem = ({ item }: { item: any }) => (
    <EstablishmentItem
      item={item}
      isFavorite={userFavorites.includes(item.id)}
      isUpdatingFavorite={updatingFavorites.has(item.id)}
      isLiked={userLikes.includes(item.id)}
      isUpdatingLike={updatingLikes.has(item.id)}
      onPress={() => navigation.navigate('EstablishmentScreen', { establishmentId: item.id })}
      onFavoriteToggle={() => handleFavoriteToggle(item.id)}
      onLikeToggle={() => handleLikeToggle(item.id, (increment) =>
        updateEstablishmentReviewCount(item.id, increment)
      )}
      showCategory={true} // Mostrar categoría en resultados de búsqueda
    />
  );

  const renderHeader = () => (
    <SearchResultsHeader
      searchQuery={searchQuery}
      locationName={locationName}
      resultsCount={searchResults.length}
      selectedFilter={selectedFilter}
      onSearchChange={handleSearchChange}
      onFilterSelect={setSelectedFilter}
      onSearchSubmit={handleSearchSubmit}
    />
  );

  const renderEmptyComponent = () => {
    if (searchQuery.trim() === '') return null;

    return (
      <View style={styles.noResultsContainer}>
        <Text style={styles.noResultsText}>
          No results found for "{searchQuery}"
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#00B383" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <SearchHeader
        locationName={locationName}
        onBack={() => navigation.goBack()}
      />

      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <FlatList
          data={searchResults}
          renderItem={renderEstablishmentItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.establishmentsContainer}
          showsVerticalScrollIndicator={false}
        />

        <FloatingMapButton
          onPress={() => navigation.navigate('MapScreen', {
            selectedLocation: selectedLocation || undefined
          })}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  establishmentsContainer: {
    paddingBottom: width * 0.2,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: width * 0.10,
    backgroundColor: 'white',
  },
  noResultsText: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
    textAlign: 'center',
  },
});

export default SearchResultsScreen;