import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
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
import ArrowRightIcon from '../assets/images/icons/arrow-right-bg.svg';
import BeachIcon from '../assets/images/icons/beach.svg';
import CalendarIcon from '../assets/images/icons/calendar.svg';
import HandsIcon from '../assets/images/icons/hands.svg';
import LandLayerLocationIcon from '../assets/images/icons/land-layer-location.svg';
import MenuIcon from '../assets/images/icons/menu-bg.svg';
import PeopleIcon from '../assets/images/icons/people.svg';
import PlateIcon from '../assets/images/icons/plate.svg';
import ServicesIcon from '../assets/images/icons/services.svg';
import ShopIcon from '../assets/images/icons/shop.svg';
import SwimmerIcon from '../assets/images/icons/swimmer.svg';
import ThumbIcon from '../assets/images/icons/thumb.svg';

// Import SideMenu component
import SideMenu from '../components/SideMenu';
import SearchBar from '../components/SearchBar';
import SearchDropdown from '../components/SearchDropdown';
import { searchEstablishmentsByName } from '../utils/searchUtils';

// Import Firestore service
import {
  Establishment,
  getCategories,
  getEstablishments,
  getFeaturedEstablishments,
  getLocationById,
  getTrendingEstablishments
} from '../services/firestoreService';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'HomeScreen'>;

// Mapeo de IDs de categorías a componentes de iconos
const iconMapping: {[key: string]: React.FC<any>} = {
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

const HomeScreen: React.FC<HomeScreenProps> = ({ route, navigation }) => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [backgroundImage, setBackgroundImage] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [categories, setCategories] = useState<Array<{id: string, title: string, icon: React.FC<any>}>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Estados para establecimientos
  const [nearbyEstablishments, setNearbyEstablishments] = useState<Establishment[]>([]);
  const [featuredEstablishments, setFeaturedEstablishments] = useState<Establishment[]>([]);
  const [trendingEstablishments, setTrendingEstablishments] = useState<Establishment[]>([]);
  const [recommendedEstablishments, setRecommendedEstablishments] = useState<Establishment[]>([]);
  const [newEstablishments, setNewEstablishments] = useState<Establishment[]>([]);
  const [allEstablishments, setAllEstablishments] = useState<Establishment[]>([]);

  // New search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Establishment[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  //controlar el scroll
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Primero cargar las categorías
        const categoriesData = await getCategories();
        const formattedCategories = categoriesData.map(category => ({
          id: category.id,
          title: category.title,
          icon: iconMapping[category.id] || HandsIcon // Usar HandsIcon como fallback
        }));
        setCategories(formattedCategories);
        
        // Luego verificar la ubicación seleccionada
        let location: string | null = route.params?.selectedLocation || null;
        
        if (!location) {
          location = await AsyncStorage.getItem('@goldenbook_selected_location');
          
          if (!location) {
            navigation.replace('LocationSelection');
            return;
          }
        }
        
        setSelectedLocation(location);
        
        // Obtener datos de la ubicación desde Firestore
        const locationData = await getLocationById(location);
        
        if (locationData) {
          setLocationName(locationData.name);
          
          // Intentar cargar la imagen desde la URL
          if (locationData.image) {
            setBackgroundImage({ uri: locationData.image });
          } else {
            // Imagen por defecto si no hay URL
            setBackgroundImage(require('../assets/images/porto.jpg'));
          }
          
          // AQUÍ CARGAR LOS ESTABLECIMIENTOS
          // Cargar todos los establecimientos de la ubicación seleccionada
          const allEstablishmentsData = await getEstablishments(location);
  
          // Near You - Establecimientos cercanos (ya ordenados por cercanía)
          setNearbyEstablishments(allEstablishmentsData.slice(0, 5));
  
          // Top Rated - Establecimientos con mejor calificación
          const topRated = [...allEstablishmentsData]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);
          setRecommendedEstablishments(topRated);
  
          // Trending Now - Establecimientos marcados como trending
          const trending = await getTrendingEstablishments(location);
          setTrendingEstablishments(trending);
  
          // Premium Selection (antes Featured Partners)
          const featured = await getFeaturedEstablishments(location);
          setFeaturedEstablishments(featured);
  
          // Discover - Selección aleatoria para exposición de variedad
          const shuffled = [...allEstablishmentsData].sort(() => 0.5 - Math.random());
          const discover = shuffled.slice(0, 5);
          setNewEstablishments(discover);
          
          // Guardar todos los establecimientos para la búsqueda
          setAllEstablishments(allEstablishmentsData);
        } else {
          // Fallback si no se encuentra la ubicación
          setLocationName(location);
          setBackgroundImage(require('../assets/images/porto.jpg'));
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        // En caso de error, intentar usar imágenes locales como fallback
        setBackgroundImage(require('../assets/images/porto.jpg'));
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [route.params?.selectedLocation]);

  // Search functionality
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    
    if (text.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    // Search by name only
    const results = searchEstablishmentsByName(allEstablishments, text);
    setSearchResults(results);
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
    // Navegar directamente a la pantalla del establecimiento
    navigation.navigate('EstablishmentScreen', { establishmentId });
    
    // Limpiar la búsqueda
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
  };
  
  // Opcionalmente, si quieres añadir una opción para ver todos los resultados:
  const handleShowAllResults = () => {
    if (searchQuery.trim() !== '') {
      navigation.navigate('SearchResults', {
        query: searchQuery,
        selectedLocation: selectedLocation || ''
      });
      
      // Limpiar la búsqueda
      setSearchQuery('');
      setSearchResults([]);
      setIsSearchFocused(false);
    }
  };

  // Toggle menu visibility
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  // Function to render category items
  const renderCategoryItem = (item: {id: string, title: string, icon: React.FC<any>}, index: number) => {
    const Icon = item.icon;
    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.categoryItem}
        onPress={() => {
          if (selectedLocation) {
            navigation.navigate('CategoryScreen', { 
              categoryId: item.id,
              categoryTitle: item.title,
              selectedLocation: selectedLocation 
            });
          }
        }}
      >
        <Icon width={width * 0.06} height={width * 0.06} fill="#997B41" style={{ marginRight: width * 0.02 }} />
        <Text style={styles.categoryText}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  // Function to render place items
  const renderEstablishmentItem = (item: Establishment, index: number) => {
    // Convertir URL de Google Drive si es necesario
    const getImageUrl = (url: string) => {
      if (url && url.includes('drive.google.com/file/d/')) {
        // Extraer el ID del archivo de Google Drive
        const match = url.match(/\/d\/(.+?)\/view/);
        if (match && match[1]) {
          return `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
      }
      return url || '';
    };
  
    // Función para obtener el título de la categoría
    const getCategoryTitle = (categoryId: string) => {
      const category = categories.find(cat => cat.id === categoryId);
      return category ? category.title : categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
    };

    const imageUrl = item.mainImage ? getImageUrl(item.mainImage) : '';
    const primaryCategory = item.categories && item.categories.length > 0 ? item.categories[0] : '';

    return (
      <TouchableOpacity
        key={`${item.id}-${index}`} 
        style={styles.placeCard}
        onPress={() => {
          navigation.navigate('EstablishmentScreen', { establishmentId: item.id });
        }}
      >
        <View style={styles.placeImageContainer}>
          <Image 
            source={imageUrl ? { uri: imageUrl } : require('../assets/images/porto.jpg')} 
            style={styles.placeImage} 
            onError={() => console.log(`Failed to load image for ${item.name}`)}
          />
          <View style={styles.categoryTag}>
            <View style={styles.categoryTagContent}>
              <Image
                source={require('../assets/images/icons/plate.png')}
                style={styles.categoryIcon}
              />
              <Text style={styles.categoryTagText}>
                {primaryCategory ? getCategoryTitle(primaryCategory) : 'Place'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.placeInfo}>
          <Text style={styles.placeName}>{item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}</Text>
        
          <Text style={styles.establishmentLocation}>
            {item.address} · {item.city}
          </Text>
          <View style={styles.thumbContainer}>
            <ThumbIcon width={width * 0.04} height={width * 0.04} fill="#997B41" style={{ marginRight: width * 0.01 }} />
            <Text style={styles.reviewCount}>{item.reviewCount || 0}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Function to render section header with "see all" button
  const renderSectionHeader = (title: string, onSeeAll?: () => void) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity style={styles.seeAllButton} onPress={onSeeAll}>
        <ArrowRightIcon width={width * 0.05} height={width * 0.05} fill="#1A1A2E" />
      </TouchableOpacity>
    </View>
  );

  // Function to render a section with establishments
  const renderEstablishmentsSection = (
    title: string, 
    establishments: Establishment[], 
    onSeeAll?: () => void
  ) => {
    if (!establishments || establishments.length === 0) {
      return null; // No mostrar la sección si no hay establecimientos
    }
    
    return (
      <View style={styles.section}>
        {renderSectionHeader(title, onSeeAll)}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScrollView}
        >
          {establishments.map(renderEstablishmentItem)}
        </ScrollView>
      </View>
    );
  };

  // Function to limit scroll
  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    
    // Limita el scroll hacia arriba
    if (currentScrollY < 0) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
    
    setScrollY(currentScrollY);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Side Menu */}
      <SideMenu 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)} 
        navigation={navigation} 
      />
      
      {/* Fixed background image */}
      <ImageBackground
        source={backgroundImage}
        style={styles.fixedBackground}
      >
        <View style={styles.headerOverlay} />
      </ImageBackground>

      {/* Botones fijos */}
      <SafeAreaView style={styles.fixedHeaderContainer} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('LocationSelection')}
          >
            <ArrowLeftIcon width={width * 0.1} height={width * 0.1} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
            <MenuIcon width={width * 0.1} height={width * 0.1} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      
      {/* Scrollable content */}
      <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="never"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          overScrollMode="never"
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            {/* Espacio vacío para los botones fijos */}
          </View>

          <View style={styles.contentContainer}>
            {/* Title and Search */}
            <Text style={styles.heroTitle}>Explore {locationName}</Text>
            
            {/* Search container with dropdown */}
            <View style={styles.searchContainer}>
              <SearchBar
                placeholder="Search restaurants, hotels, spas, events..."
                value={searchQuery}
                onChangeText={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                style={styles.searchBar}
              />
              
              <SearchDropdown
                results={searchResults}
                onSelectEstablishment={handleSelectEstablishment}
                onShowAllResults={handleShowAllResults}  // Añade esta prop
                visible={isSearchFocused && searchQuery.trim() !== ''}
              />
            </View>
            
            {/* Categories Grid */}
            <View style={styles.categoriesGrid}>
              {categories.map(renderCategoryItem)}
            </View>
            
            {/* Establishments sections */}
            {renderEstablishmentsSection('Near You', nearbyEstablishments)}
            {renderEstablishmentsSection('Top Rated', recommendedEstablishments)}
            {renderEstablishmentsSection('Trending Now', trendingEstablishments)}
            {renderEstablishmentsSection('Premium Selection', featuredEstablishments)}
            {renderEstablishmentsSection('Discover', newEstablishments)}

            {/* Extra padding at the bottom */}
            <View style={{ height: 100 }} />
          </View>
        </ScrollView>
        
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
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: width * 0.05,
    borderRadius: 8,
  },
  loadingText: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Regular',
    color: '#1A1A2E',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    backgroundColor: 'transparent',
  },
  fixedBackground: {
    position: 'absolute',
    height: height * 0.45, 
    width: '100%',
    top: 0,
    left: 0,
  },
  fixedHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  scrollViewContent: {
    paddingBottom: height * 0.1,
    minHeight: height + height * 0.05,
  },
  headerOverlay: {
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
  },
  headerContainer: {
    height: width * 0.5,
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: width * 0.04,
  },
  backButton: {
    width: width * 0.12,
    height: width * 0.18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    width: width * 0.12,
    height: width * 0.18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: 'white',
    paddingHorizontal: width * 0.06,
    paddingTop: width * 0.06,
    paddingBottom: width * 0.2,
  },
  heroTitle: {
    fontSize: width * 0.045,
    fontFamily: 'EuclidSquare-SemiBold',
    marginBottom: width * 0.03,
    color: '#1A1A2E',
  },
  searchContainer: {
    position: 'relative',
    zIndex: 100,
    marginBottom: width * 0.04,
  },
  searchBar: {},
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: width * 0.04,
  },
  categoryItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: width * 0.03,
    marginBottom: width * 0.03,
  },
  categoryText: {
    fontSize: width * 0.03,
    fontFamily: 'EuclidSquare-Medium',
    color: '#1A1A2E',
  },
  section: {
    marginBottom: width * 0.06,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: width * 0.03,
  },
  sectionTitle: {
    fontSize: width * 0.045,
    fontFamily: 'EuclidSquare-SemiBold',
    color: '#1A1A2E',
  },
  seeAllButton: {
    padding: width * 0.01,
  },
  horizontalScrollView: {},
  placeCard: {
    width: width * 0.65,
    marginRight: width * 0.04,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  placeImageContainer: {
    position: 'relative',
  },
  placeImage: {
    width: '100%',
    height: width * 0.35,
    resizeMode: 'cover',
  },
  categoryTag: {
    position: 'absolute',
    top: width * 0.02,
    left: width * 0.02,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: width * 0.02,
    paddingVertical: width * 0.01,
    borderRadius: 4,
  },
  categoryTagContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: width * 0.04,
    height: width * 0.04,
    marginRight: width * 0.01,
    tintColor: '#FFFFFF',
  },
  categoryTagText: {
    color: 'white',
    fontSize: width * 0.03,
    fontFamily: 'EuclidSquare-Medium',
  },
  placeInfo: {
    padding: width * 0.03,
  },
  placeName: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-SemiBold',
    color: '#1A1A2E',
    marginBottom: width * 0.01,
  },
  placeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: width * 0.01,
  },
  placeType: {
    fontSize: width * 0.03,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: width * 0.03,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
  },
  establishmentLocation: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#666',
    marginBottom: width * 0.025,
  },
  thumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: width * 0.01,
  },
  reviewCount: {
    fontSize: width * 0.03,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
  },
  distanceText: {
    fontSize: width * 0.03,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
    marginTop: width * 0.01,
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
});

export default HomeScreen;