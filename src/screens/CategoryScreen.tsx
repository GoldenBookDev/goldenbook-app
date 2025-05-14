import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/navigationTypes';
import LandLayerLocationIcon from '../assets/images/icons/land-layer-location.svg';

// Import SVG components
import ArrowLeftIcon from '../assets/images/icons/arrow-left-bg.svg';
import BeachIcon from '../assets/images/icons/beach.svg';
import CalendarIcon from '../assets/images/icons/calendar.svg';
import HandsIcon from '../assets/images/icons/hands.svg';
import PeopleIcon from '../assets/images/icons/people.svg';
import PlateIcon from '../assets/images/icons/plate.svg';
import ServicesIcon from '../assets/images/icons/services.svg';
import ShopIcon from '../assets/images/icons/shop.svg';
import SwimmerIcon from '../assets/images/icons/swimmer.svg';
import ThumbIcon from '../assets/images/icons/thumb.svg';

// Import custom components
import SearchBar from '../components/SearchBar';
import SearchDropdown from '../components/SearchDropdown';

// Import Firestore service
import {
  getCategoryById,
  getEstablishments,
  getLocationById,
  Establishment
} from '../services/firestoreService';

// Category icon mapping
const iconMapping: {[key: string]: React.ComponentType<any>} = {
  'culture': HandsIcon,
  'gastronomy': PlateIcon,
  'sports': SwimmerIcon,
  'events': CalendarIcon,
  'shops': ShopIcon,
  'beaches': BeachIcon,
  'transport': ServicesIcon,
  'activities': PeopleIcon,
};

const { width, height } = Dimensions.get('window');

type CategoryScreenProps = NativeStackScreenProps<RootStackParamList, 'CategoryScreen'>;

interface SubcategoryData {
  id: string;
  title: string;
}

const CategoryScreen = ({ route, navigation }: CategoryScreenProps) => {
  const { categoryId, categoryTitle, selectedLocation } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [subcategories, setSubcategories] = useState<SubcategoryData[]>([]);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [filteredEstablishments, setFilteredEstablishments] = useState<Establishment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('recommended');
  
  // Referencias para mantener el foco del input
  const searchInputRef = useRef<TextInput>(null);
  
  // Estados para la búsqueda con dropdown
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Establishment[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  const filters = [
    { id: 'recommended', title: 'Recommended' },
    { id: 'open_now', title: 'Open now' },
    { id: 'near_me', title: 'Near me' },
    { id: 'most_liked', title: 'Most liked' }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get location name
        const locationData = await getLocationById(selectedLocation);
        if (locationData) {
          setLocationName(locationData.name);
        }

        // Get category data
        const categoryData = await getCategoryById(categoryId);
        if (!categoryData) {
          setError('Category not found');
          return;
        }

        // Process subcategories
        let subcategoryArray: SubcategoryData[] = [];
        if (categoryData.subcategories && typeof categoryData.subcategories === 'object') {
          subcategoryArray = Object.entries(categoryData.subcategories).map(([key, title]) => ({
            id: key,
            title: String(title)
          }));
        }
        setSubcategories(subcategoryArray);

        // IMPORTANTE: Obtener establecimientos específicamente para esta categoría
        console.log(`Loading establishments for location ${selectedLocation} and category ${categoryId}`);
        const allEstablishments = await getEstablishments(selectedLocation, categoryId);
        console.log(`Loaded ${allEstablishments.length} establishments for category ${categoryId}`);
        
        // Verificación adicional - asegurarse de que todos tienen la categoría correcta
        const filteredEstablishments = allEstablishments.filter(est => 
          est.categories && est.categories.includes(categoryId)
        );
        
        if (filteredEstablishments.length !== allEstablishments.length) {
          console.warn(`Warning: ${allEstablishments.length - filteredEstablishments.length} establishments were filtered out because they did not have the correct category.`);
        }
        
        setEstablishments(filteredEstablishments);
        setFilteredEstablishments(filteredEstablishments);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categoryId, selectedLocation]);

  // Aplicar filtros de subcategoría y ordenamiento
  useEffect(() => {
    // Solo aplicamos filtros de subcategoría y ordenamiento
    // Ya que los establecimientos ya están filtrados por categoría
    let filtered = [...establishments];

    // Aplicar filtro de subcategoría
    if (selectedSubcategory) {
      filtered = filtered.filter(establishment => 
        establishment.subcategories?.includes(selectedSubcategory)
      );
    }

    // Aplicar ordenamiento según el filtro seleccionado
    switch (selectedFilter) {
      case 'recommended':
        // Ordenar por rating (mayor primero)
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'open_now':
        // TODO: Implementar lógica de "abierto ahora"
        break;
      case 'near_me':
        // TODO: Implementar lógica de "cerca de mí"
        break;
      case 'most_liked':
        // Ordenar por número de reseñas/likes
        filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
    }

    setFilteredEstablishments(filtered);
  }, [selectedSubcategory, selectedFilter, establishments]);

  // Funciones para manejar la búsqueda con dropdown
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    
    if (text.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    // Importante: Asegurarnos de que SOLO filtramos dentro de los establecimientos
    // que ya fueron cargados para esta categoría específica
    const results = establishments.filter(establishment => {
      const name = establishment.name || '';
      return name.toLowerCase().includes(text.toLowerCase().trim());
    });
    
    console.log(`Búsqueda "${text}" encontró ${results.length} resultados en la categoría ${categoryId}`);
    
    // Verificación adicional: asegurar que todos los resultados pertenecen a la categoría actual
    const validResults = results.filter(item => 
      item.categories && item.categories.includes(categoryId)
    );
    
    if (validResults.length !== results.length) {
      console.warn(`Se han filtrado ${results.length - validResults.length} establecimientos que no pertenecen a la categoría ${categoryId}`);
    }
    
    setSearchResults(validResults);
    
    // Mantener el foco en el input
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    // Use setTimeout to allow the user to tap on a result before hiding the dropdown
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 200);
  };

  const handleSelectEstablishment = (establishmentId: string) => {
    // Ocultar el teclado
    Keyboard.dismiss();
    
    // Navigate to establishment detail screen
    navigation.navigate('EstablishmentScreen', { establishmentId });
    
    // Clear search
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
  };
  
  // Función para manejar "Ver todos los resultados"
  const handleShowAllResults = () => {
    // Ocultar el teclado
    Keyboard.dismiss();
    
    if (searchQuery.trim() !== '') {
      // Muy importante: pasar el categoryId para que la pantalla de resultados 
      // también filtre por la categoría actual
      navigation.navigate('SearchResults', {
        query: searchQuery,
        selectedLocation: selectedLocation,
        categoryId: categoryId  // Asegurarse de pasar el categoryId
      });
      
      // Limpiar la búsqueda
      setSearchQuery('');
      setSearchResults([]);
      setIsSearchFocused(false);
    }
  };

  // Function to render establishment items
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
            <Text style={styles.establishmentName}>
              {item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}
            </Text>
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

  // Render the header content as ListHeaderComponent
  const renderHeader = () => (
    <>
      {/* Category Title and Search */}
      <View style={styles.titleSection}>
        <View style={styles.titleContainer}>
          <CategoryIcon width={width * 0.08} height={width * 0.08} fill="#997B41" />
          <Text style={styles.categoryTitle}>{categoryTitle}</Text>
        </View>
        
        {/* Updated Search Container - Modificado para mejorar el z-index y posición */}
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder={`Search in ${categoryTitle}`}
            value={searchQuery}
            onChangeText={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            style={styles.searchBar}
            // Modificado: Añadido ref para mantener el foco
            ref={searchInputRef}
          />
        </View>
      </View>

      {/* Subcategories Horizontal List */}
      <View style={styles.subcategoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subcategoriesContainer}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={true}
        >
          {subcategories.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.subcategoryItem,
                selectedSubcategory === item.id && styles.subcategoryItemActive
              ]}
              onPress={() => setSelectedSubcategory(selectedSubcategory === item.id ? null : item.id)}
            >
              <View style={[
                styles.subcategoryIconContainer,
                selectedSubcategory === item.id && styles.subcategoryIconContainerActive
              ]}>
                {/* Using PlateIcon as placeholder for all subcategories until you have specific icons */}
                <PlateIcon width={width * 0.06} height={width * 0.06} fill={selectedSubcategory === item.id ? 'white' : '#997B41'} />
              </View>
              <Text style={[
                styles.subcategoryText,
                selectedSubcategory === item.id && styles.subcategoryTextActive
              ]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Additional Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersList}
        contentContainerStyle={styles.filtersContainer}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={true}
      >
        {filters.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.filterButton,
              selectedFilter === item.id && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(item.id)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedFilter === item.id && styles.filterButtonTextActive
            ]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* No results message */}
      {filteredEstablishments.length === 0 && !loading && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>
            {selectedSubcategory 
              ? "No establishments found in this subcategory" 
              : "No establishments found"}
          </Text>
        </View>
      )}
    </>
  );

  // Componente del dropdown separado para controlar su posición
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
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            navigation.goBack();
          }}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const CategoryIcon = iconMapping[categoryId] || HandsIcon;

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
        {/* Mostrar el dropdown de manera absoluta (encima de toda la UI) */}
        {renderSearchDropdown()}
        
        {/* Single FlatList with header components to avoid nesting ScrollViews */}
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
  titleSection: {
    backgroundColor: 'white',
    paddingBottom: width * 0.04,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingTop: width * 0.02,
    marginBottom: width * 0.03,
  },
  categoryTitle: {
    fontSize: width * 0.055,
    fontFamily: 'EuclidSquare-SemiBold',
    color: '#1A1A2E',
    marginLeft: width * 0.03,
  },
  // Modificado: mejorado el estilo del contenedor de búsqueda
  searchContainer: {
    position: 'relative',
    marginHorizontal: width * 0.04,
    marginBottom: width * 0.02,
  },
  // Añadido: contenedor del dropdown para posicionarlo correctamente
  dropdownWrapper: {
    position: 'absolute', 
    top: width * 0.25, // Ajustado para que esté por debajo del search bar
    left: 0,
    right: 0,
    zIndex: 9999, // Mayor z-index para estar por encima de todo
    elevation: 9999, // Para Android
  },
  searchBar: {},
  subcategoriesSection: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  subcategoriesContainer: {
    paddingHorizontal: width * 0.02,
    paddingVertical: width * 0.01,
    alignItems: 'center',
  },
  subcategoryItem: {
    alignItems: 'center',
    marginHorizontal: width * 0.025,
    padding: width * 0.02,
  },
  subcategoryItemActive: {
    backgroundColor: 'rgba(153, 123, 65, 0.1)',
    borderRadius: 8,
  },
  subcategoryIconContainer: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: width * 0.02,
  },
  subcategoryIconContainerActive: {
    backgroundColor: '#997B41',
  },
  subcategoryText: {
    fontSize: width * 0.033,
    fontFamily: 'EuclidSquare-Medium',
    color: '#333',
    textAlign: 'center',
  },
  subcategoryTextActive: {
    color: '#997B41',
    fontFamily: 'EuclidSquare-SemiBold',
  },
  filtersList: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filtersContainer: {
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.02,
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: width * 0.015,
    paddingVertical: width * 0.025,
    marginHorizontal: width * 0.02,
  },
  filterButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#997B41',
  },
  filterButtonText: {
    fontSize: width * 0.038,
    fontFamily: 'EuclidSquare-Medium',
    color: '#999',
  },
  filterButtonTextActive: {
    color: '#997B41',
    fontFamily: 'EuclidSquare-SemiBold',
  },
  establishmentsContainer: {
    paddingTop: width * 0.02,
    paddingBottom: width * 0.05,
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
  errorText: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Regular',
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: width * 0.03,
  },
  retryButton: {
    backgroundColor: '#00B383',
    paddingHorizontal: width * 0.05,
    paddingVertical: width * 0.02,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontFamily: 'EuclidSquare-Medium',
    fontSize: width * 0.04,
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

export default CategoryScreen;