import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../i18n';
import { RootStackParamList } from '../navigation/navigationTypes';

// Import SVG components
import BeachIcon from '../assets/images/icons/beach.svg';
import CalendarIcon from '../assets/images/icons/calendar.svg';
import HandsIcon from '../assets/images/icons/hands.svg';
import PeopleIcon from '../assets/images/icons/people.svg';
import PlateIcon from '../assets/images/icons/plate.svg';
import ServicesIcon from '../assets/images/icons/services.svg';
import ShopIcon from '../assets/images/icons/shop.svg';
import SwimmerIcon from '../assets/images/icons/swimmer.svg';

// Import components
import CategoryHeader from '../components/CategoryHeader';
import CategoryTitle from '../components/CategoryTitle';
import EstablishmentItem from '../components/EstablishmentItem';
import EstablishmentsFilter from '../components/EstablishmentsFilter';
import FloatingMapButton from '../components/FloatingMapButton';
import SearchBar from '../components/SearchBar';
import SearchDropdown from '../components/SearchDropdown';
import SubcategoriesFilter from '../components/SubcategoriesFilter';

// Import hooks
import { useCategoryData } from '../hooks/useCategoryData';
import { useCategoryFilters } from '../hooks/useCategoryFilters';
import { useCategorySearch } from '../hooks/useCategorySearch';
import { useUserActions } from '../hooks/useUserActions';

// Category icon mapping
const iconMapping: { [key: string]: React.ComponentType<any> } = {
  'culture': HandsIcon,
  'gastronomy': PlateIcon,
  'sports': SwimmerIcon,
  'events': CalendarIcon,
  'shops': ShopIcon,
  'beaches': BeachIcon,
  'transport': ServicesIcon,
  'activities': PeopleIcon,
};

const { width } = Dimensions.get('window');

type CategoryScreenProps = NativeStackScreenProps<RootStackParamList, 'CategoryScreen'>;

const CategoryScreen = ({ route, navigation }: CategoryScreenProps) => {
  const { categoryId, categoryTitle, selectedLocation } = route.params;
  const searchInputRef = useRef<TextInput>(null);

  // Custom hooks
  const {
    loading,
    subcategories,
    establishments,
    error,
    locationName,
    updateEstablishmentReviewCount
  } = useCategoryData(categoryId, selectedLocation);

  const {
    filteredEstablishments,
    selectedSubcategory,
    selectedFilter,
    setSelectedSubcategory,
    setSelectedFilter
  } = useCategoryFilters(establishments);

  const {
    searchQuery,
    searchResults,
    isSearchFocused,
    handleSearchChange,
    handleSearchFocus,
    handleSearchBlur,
    handleSelectEstablishment,
    handleShowAllResults
  } = useCategorySearch(establishments, navigation, selectedLocation, categoryId);

  const {
    userFavorites,
    updatingFavorites,
    userLikes,
    updatingLikes,
    handleFavoriteToggle,
    handleLikeToggle
  } = useUserActions(navigation);

  // Render functions
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
      showCategory={false} // No mostrar categoría en vista de categoría específica
    />
  );

  const renderHeader = () => (
    <>
      <View style={styles.titleSection}>
        <CategoryTitle
          icon={iconMapping[categoryId] || HandsIcon}
          title={categoryTitle}
        />

        <View style={styles.searchContainer}>
          <SearchBar
            placeholder={`${i18n.t('category.searchIn')} ${categoryTitle}`}
            value={searchQuery}
            onChangeText={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            style={styles.searchBar}
            ref={searchInputRef}
          />
        </View>
      </View>

      <SubcategoriesFilter
        subcategories={subcategories}
        selectedSubcategory={selectedSubcategory}
        onSubcategorySelect={setSelectedSubcategory}
      />

      <EstablishmentsFilter
        selectedFilter={selectedFilter}
        onFilterSelect={setSelectedFilter}
      />

      {filteredEstablishments.length === 0 && !loading && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>
            {selectedSubcategory
              ? i18n.t('category.noEstablishmentsSubcategory')
              : i18n.t('category.noEstablishments')}
          </Text>
        </View>
      )}
    </>
  );

  const renderSearchDropdown = () => {
    if (!isSearchFocused || searchQuery.trim() === '') {
      return null;
    }

    return (
      <View style={styles.dropdownWrapper}>
        <SearchDropdown
          results={searchResults}
          onSelectEstablishment={handleSelectEstablishment}
          onShowAllResults={handleShowAllResults}
          visible={true}
        />
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

  if (error) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <CategoryHeader
        locationName={locationName}
        onBack={() => navigation.goBack()}
      />

      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        {renderSearchDropdown()}

        <FlatList
          data={filteredEstablishments}
          renderItem={renderEstablishmentItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.establishmentsContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={true}
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
  titleSection: {
    backgroundColor: 'white',
    paddingBottom: width * 0.01,
  },
  searchContainer: {
    position: 'relative',
    marginHorizontal: width * 0.04,
    marginBottom: width * 0.02,
  },
  searchBar: {},
  dropdownWrapper: {
    position: 'absolute',
    top: width * 0.25,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  establishmentsContainer: {
    paddingTop: width * 0.02,
    paddingBottom: width * 0.05,
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
  errorText: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Regular',
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: width * 0.03,
  },
});

export default CategoryScreen;