import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/navigationTypes';

// Import SVG components
import ArrowLeftIcon from '../assets/images/icons/arrow-left-bg.svg';
import ThumbIcon from '../assets/images/icons/thumb.svg';
import LandLayerLocationIcon from '../assets/images/icons/land-layer-location.svg';

// Import custom components
import SearchBar from '../components/SearchBar';

// Import search utilities and Firestore service
import { searchEstablishmentsByName, sortEstablishments } from '../utils/searchUtils';
import { Establishment, getEstablishments, getLocationById } from '../services/firestoreService';

type SearchResultsScreenProps = NativeStackScreenProps<RootStackParamList, 'SearchResults'>;

const { width } = Dimensions.get('window');

const SearchResultsScreen = ({ route, navigation }: SearchResultsScreenProps) => {
  // Get parameters from navigation
  const { query, selectedLocation, categoryId } = route.params;
  
  const [searchQuery, setSearchQuery] = useState<string>(query || '');
  const [searchResults, setSearchResults] = useState<Establishment[]>([]);
  const [allEstablishments, setAllEstablishments] = useState<Establishment[]>([]);
  const [locationName, setLocationName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('recommended');

  const filters = [
    { id: 'recommended', title: 'Recommended' },
    { id: 'most_liked', title: 'Most liked' },
    { id: 'newest', title: 'Newest' }
  ];

  // Load location name and all establishments
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Obtener datos de ubicación
        const locationData = await getLocationById(selectedLocation);
        if (locationData) {
          setLocationName(locationData.name);
        }
  
        // IMPORTANTE: Si hay categoryId, obtenemos los establecimientos de esa categoría específica
        // De lo contrario, obtenemos todos los establecimientos
        let establishments;
        if (categoryId) {
          console.log(`Cargando establecimientos para la ubicación ${selectedLocation} y categoría ${categoryId}`);
          establishments = await getEstablishments(selectedLocation, categoryId);
          console.log(`Cargados ${establishments.length} establecimientos para la categoría ${categoryId}`);
        } else {
          establishments = await getEstablishments(selectedLocation);
        }
        
        setAllEstablishments(establishments);
        
        // Realizar búsqueda inicial con la consulta proporcionada
        if (query) {
          const filteredResults = establishments.filter(est => {
            const name = est.name || '';
            return name.toLowerCase().includes(query.toLowerCase().trim());
          });
          setSearchResults(filteredResults);
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };
  
    loadData();
  }, [selectedLocation, categoryId, query]);

  // Apply filter when it changes
  useEffect(() => {
    const sortedResults = sortEstablishments([...searchResults], selectedFilter);
    setSearchResults(sortedResults);
  }, [selectedFilter]);

  // Handle search input change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    
    if (text.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    // Filtrar los establecimientos actuales por nombre
    const results = allEstablishments.filter(establishment => {
      const name = establishment.name || '';
      return name.toLowerCase().includes(text.toLowerCase().trim());
    });
    
    setSearchResults(results);
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    // This function is already handled by handleSearchChange
    console.log('Search submitted:', searchQuery);
  };

  // Render establishment item
  const renderEstablishmentItem = ({ item }: { item: Establishment }) => {
    // Convert Google Drive URL if needed
    const getImageUrl = (url: string) => {
      if (url && url.includes('drive.google.com/file/d/')) {
        // Extract Google Drive file ID
        const match = url.match(/\/d\/(.+?)\/view/);
        if (match && match[1]) {
          return `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
      }
      return url || '';
    };

    const imageUrl = item.mainImage ? getImageUrl(item.mainImage) : '';
    const primaryCategory = item.categories && item.categories.length > 0 ? item.categories[0] : '';

    return (
      <TouchableOpacity 
        style={styles.establishmentCard}
        onPress={() => {
          navigation.navigate('EstablishmentScreen', { establishmentId: item.id });
        }}
      >
        <View style={styles.establishmentImageContainer}>
          <Image 
            source={imageUrl ? { uri: imageUrl } : require('../assets/images/porto.jpg')} 
            style={styles.establishmentImage} 
          />
          <TouchableOpacity style={styles.favoriteButton}>
            <View style={styles.favoriteIconContainer}>
              <Text style={styles.favoriteIcon}>♡</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.establishmentInfo}>
          <View style={styles.establishmentTitleRow}>
            <Text style={styles.establishmentName}>{item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}</Text>
            <Text style={styles.establishmentCategory}>
              {primaryCategory.charAt(0).toUpperCase() + primaryCategory.slice(1)}
            </Text>
          </View>
          
          <Text style={styles.establishmentLocation}>
            {item.address} · {item.city}
          </Text>
          
          <View style={styles.establishmentDetails}>
            <View style={styles.ratingContainer}>
              <ThumbIcon width={width * 0.035} height={width * 0.035} fill="#997B41" />
              <Text style={styles.reviewCount}>{item.reviewCount || 0}</Text>
            </View>
            
            <View style={styles.accessibilityAndStatus}>
              {/* Wheelchair icon placeholder */}
              <Text style={styles.wheelchairIcon}>♿</Text>
              <Text style={styles.statusText}>Open · Closes 22:00</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render filter buttons
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.filterButton,
            selectedFilter === filter.id && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter(filter.id)}
        >
          <Text style={[
            styles.filterButtonText,
            selectedFilter === filter.id && styles.filterButtonTextActive
          ]}>
            {filter.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render header
  const renderHeader = () => (
    <>
      <View style={styles.searchSection}>
        <SearchBar
          placeholder={`Search in ${locationName}`}
          value={searchQuery}
          onChangeText={handleSearchChange}
          onSubmitEditing={handleSearchSubmit}
          style={styles.searchBar}
        />
      </View>
      
      {/* Results title */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for "{searchQuery}"
        </Text>
        {renderFilters()}
      </View>
    </>
  );

  // Loading indicator
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#00B383" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header with SafeAreaView for top part */}
      <SafeAreaView style={styles.safeHeaderContainer} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeftIcon width={width * 0.1} height={width * 0.1} />
          </TouchableOpacity>
          
          <Text style={styles.locationText}>{locationName}, Portugal</Text>
        </View>
      </SafeAreaView>

      {/* Main content with SafeAreaView for remaining edges */}
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <FlatList
          data={searchResults}
          renderItem={renderEstablishmentItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            searchQuery.trim() !== '' ? (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
              </View>
            ) : null
          }
          contentContainerStyle={styles.establishmentsContainer}
          showsVerticalScrollIndicator={false}
        />
        
        {/* Floating Map Button */}
        <TouchableOpacity 
          style={styles.floatingMapButton} 
          onPress={() => {
            navigation.navigate('MapScreen', { 
              selectedLocation: selectedLocation || undefined 
            });
          }}
        >
          <LandLayerLocationIcon width={width * 0.045} height={width * 0.045} fill="#FFFFFF" style={{ marginRight: width * 0.02 }} />
          <Text style={styles.floatingMapButtonText}>See map</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  safeHeaderContainer: {
    backgroundColor: 'white',
    zIndex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.03,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: width * 0.1,
    height: width * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationText: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Regular',
    color: '#666',
    marginLeft: width * 0.03,
  },
  searchSection: {
    backgroundColor: 'white',
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.03,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchBar: {},
  resultsHeader: {
    backgroundColor: 'white',
    paddingTop: width * 0.03,
    paddingBottom: width * 0.02,
    paddingHorizontal: width * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultsTitle: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Medium',
    color: '#1A1A2E',
    marginBottom: width * 0.02,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingVertical: width * 0.01,
  },
  filterButton: {
    paddingHorizontal: width * 0.015,
    paddingVertical: width * 0.015,
    marginRight: width * 0.04,
  },
  filterButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#997B41',
  },
  filterButtonText: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Medium',
    color: '#999',
  },
  filterButtonTextActive: {
    color: '#997B41',
    fontFamily: 'EuclidSquare-SemiBold',
  },
  establishmentsContainer: {
    paddingBottom: width * 0.2,
  },
  establishmentCard: {
    backgroundColor: 'white',
    marginHorizontal: width * 0.04,
    marginVertical: width * 0.02,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  establishmentImageContainer: {
    height: width * 0.5,
    position: 'relative',
  },
  establishmentImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: width * 0.03,
    right: width * 0.03,
  },
  favoriteIconContainer: {
    width: width * 0.08,
    height: width * 0.08,
    borderRadius: width * 0.04,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: width * 0.05,
    color: 'white',
  },
  establishmentInfo: {
    padding: width * 0.04,
  },
  establishmentTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: width * 0.015,
  },
  establishmentName: {
    fontSize: width * 0.045,
    fontFamily: 'EuclidSquare-SemiBold',
    color: '#1A1A2E',
  },
  establishmentCategory: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#997B41',
  },
  establishmentLocation: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#666',
    marginBottom: width * 0.025,
  },
  establishmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.01,
  },
  reviewCount: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#666',
    marginLeft: width * 0.01,
  },
  accessibilityAndStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.02,
  },
  wheelchairIcon: {
    fontSize: width * 0.04,
    color: '#999',
  },
  statusText: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#00AA44',
  },
  floatingMapButton: {
    position: 'absolute',
    bottom: width * 0.30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00B383',
    paddingVertical: width * 0.030,
    paddingHorizontal: width * 0.07,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingMapButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Medium',
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