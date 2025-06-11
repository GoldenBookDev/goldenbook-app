import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Analytics from 'expo-firebase-analytics';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LocationPermissionModal from '../components/LocationPermissionModal';
import { useLocation } from '../hooks/useLocation';
import i18n from '../i18n';
import { RootStackParamList } from '../navigation/navigationTypes';

// Import SVG components
import ArrowLeftIcon from '../assets/images/icons/arrow-left-bg.svg';
import LandLayerLocationIcon from '../assets/images/icons/land-layer-location.svg';
import MenuIcon from '../assets/images/icons/menu-bg.svg';

// Import components
import CategoriesGrid from '../components/CategoriesGrid';
import EstablishmentSection from '../components/EstablishmentSection';
import LoadingScreen from '../components/LoadingScreen';
import MenuController from '../components/MenuController';
import SearchBar from '../components/SearchBar';
import SearchDropdown from '../components/SearchDropdown';

// Import hooks
import { useHomeData } from '../hooks/useHomeData';
import { useSearch } from '../hooks/useSearch';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'HomeScreen'>;

const { width, height } = Dimensions.get('window');

const HomeScreen: React.FC<HomeScreenProps> = ({ route, navigation }) => {
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollY, setScrollY] = useState(0);

  // Custom hooks para manejar datos y búsqueda
  const {
    selectedLocation,
    locationName,
    backgroundImage,
    categories,
    loading,
    allEstablishments,
    recommendedEstablishments,
    featuredEstablishments,
    trendingEstablishments,
    newEstablishments,
    popularEstablishments,
    topRatedEstablishments
  } = useHomeData(route, navigation);

  const {
    searchQuery,
    searchResults,
    isSearchFocused,
    handleSearchChange,
    handleSearchFocus,
    handleSearchBlur,
    handleSelectEstablishment,
    handleShowAllResults
  } = useSearch(allEstablishments, navigation, selectedLocation);

  const {
    shouldShowModal,
    requestPermission,
    hideModal,
    hasPermission,
    location
  } = useLocation();

  // Estado para establecimientos cercanos
  const [nearbyEstablishments, setNearbyEstablishments] = useState<any[]>([]);

  useEffect(() => {
    const params = route.params as any;
    if (params?.openMenu) {
      setMenuVisible(true);
      navigation.setParams({ openMenu: undefined } as any);
    }
  }, [route.params, navigation]);

  useEffect(() => {
    const params = route.params as any;
    if (params?.refreshTimestamp) {
      navigation.setParams({ refreshTimestamp: undefined } as any);
      if (params?.openMenu) {
        setMenuVisible(true);
      }
    }
  }, [route.params?.refreshTimestamp, navigation]);

  useEffect(() => {
    Analytics.logEvent('screen_view', {
      screen_name: 'HomeScreen',
      screen_class: 'HomeScreen'
    });
  }, []);

  // Efecto para cargar establecimientos cercanos cuando se otorgan permisos
  useEffect(() => {
    const loadNearbyEstablishments = async () => {
      if (hasPermission && location && allEstablishments.length > 0) {
        try {
          // Aquí implementarías la lógica para filtrar establecimientos por distancia
          // Por ahora, tomamos una muestra de los establecimientos disponibles
          const nearby = allEstablishments
            .slice(0, 8) // Tomar los primeros 8 como ejemplo
            .map(establishment => ({
              ...establishment,
              distance: Math.random() * 5 + 0.1 // Distancia simulada en km
            }))
            .sort((a, b) => a.distance - b.distance);

          setNearbyEstablishments(nearby);
        } catch (error) {
          console.log('Error loading nearby establishments:', error);
        }
      }
    };

    loadNearbyEstablishments();
  }, [hasPermission, location, allEstablishments]);

  const toggleMenu = () => {
    Analytics.logEvent('select_content', {
      content_type: 'menu_button',
      item_id: 'toggle_menu'
    });
    setMenuVisible(!menuVisible);
  };

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    if (currentScrollY < 0) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
    setScrollY(currentScrollY);
  };

  const handleCategoryPress = (categoryId: string, categoryTitle: string) => {
    Analytics.logEvent('select_content', {
      content_type: 'category',
      item_id: categoryId,
      item_name: categoryTitle
    });

    if (selectedLocation) {
      navigation.navigate('CategoryScreen', {
        categoryId,
        categoryTitle,
        selectedLocation
      });
    }
  };

  const handleEstablishmentPress = (establishmentId: string) => {
    Analytics.logEvent('select_content', {
      content_type: 'establishment',
      item_id: establishmentId
    });

    navigation.navigate('EstablishmentScreen', { establishmentId });
  };

  const handleLocationButtonPress = () => {
    Analytics.logEvent('select_content', {
      content_type: 'location_button',
      item_id: 'back_to_location_selection'
    });

    navigation.navigate('LocationSelection');
  };

  const handleMapButtonPress = () => {
    Analytics.logEvent('select_content', {
      content_type: 'map_button',
      item_id: 'floating_map_button'
    });

    navigation.navigate('MapScreen', {
      selectedLocation: selectedLocation || undefined
    });
  };

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      Analytics.logEvent('search', {
        search_term: query,
        content_type: 'establishment_search'
      });
    }
  };

  const handleEstablishmentFromSearch = (establishmentId: string) => {
    Analytics.logEvent('select_content', {
      content_type: 'establishment',
      item_id: establishmentId,
      source: 'search_results'
    });

    handleSelectEstablishment(establishmentId);
  };

  const handleShowAllSearchResults = () => {
    Analytics.logEvent('select_content', {
      content_type: 'show_all_results',
      item_id: 'search_show_all'
    });

    handleShowAllResults();
  };

  const handlePermissionGranted = async () => {
    await requestPermission();
    // El efecto useEffect se encargará de cargar los establecimientos cercanos
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Contenido principal */}
      <ImageBackground
        source={backgroundImage}
        style={styles.fixedBackground}
      >
        <View style={styles.headerOverlay} />
      </ImageBackground>

      <SafeAreaView style={styles.fixedHeaderContainer} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleLocationButtonPress}
          >
            <ArrowLeftIcon width={width * 0.1} height={width * 0.1} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
            <MenuIcon width={width * 0.1} height={width * 0.1} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

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
          <View style={styles.headerContainer} />

          <View style={styles.contentContainer}>
            <Text style={styles.heroTitle}>{i18n.t('home.explore')} {locationName}</Text>

            <View style={styles.searchContainer}>
              <SearchBar
                placeholder={i18n.t('home.searchPlaceholder')}
                value={searchQuery}
                onChangeText={(query) => {
                  handleSearchChange(query);
                  if (query.length > 2) {
                    handleSearchSubmit(query);
                  }
                }}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                style={styles.searchBar}
              />

              <SearchDropdown
                results={searchResults}
                onSelectEstablishment={handleEstablishmentFromSearch}
                onShowAllResults={handleShowAllSearchResults}
                visible={isSearchFocused && searchQuery.trim() !== ''}
              />
            </View>

            <CategoriesGrid
              categories={categories}
              onCategoryPress={handleCategoryPress}
            />

            {/* Sección "Near me" - Solo se muestra si hay permisos de ubicación */}
            {hasPermission && nearbyEstablishments.length > 0 && (
              <EstablishmentSection
                title={i18n.t('home.nearMe')}
                establishments={nearbyEstablishments}
                onEstablishmentPress={handleEstablishmentPress}
              />
            )}

            <EstablishmentSection
              title={i18n.t('home.recommended')}
              establishments={recommendedEstablishments}
              onEstablishmentPress={handleEstablishmentPress}
            />

            <EstablishmentSection
              title={i18n.t('home.mostPopular')}
              establishments={popularEstablishments}
              onEstablishmentPress={handleEstablishmentPress}
            />

            <EstablishmentSection
              title={i18n.t('home.topRated')}
              establishments={topRatedEstablishments}
              onEstablishmentPress={handleEstablishmentPress}
            />

            <EstablishmentSection
              title={i18n.t('home.trendingNow')}
              establishments={trendingEstablishments}
              onEstablishmentPress={handleEstablishmentPress}
            />

            <EstablishmentSection
              title={i18n.t('home.premiumSelection')}
              establishments={featuredEstablishments}
              onEstablishmentPress={handleEstablishmentPress}
            />

            <EstablishmentSection
              title={i18n.t('home.discover')}
              establishments={newEstablishments}
              onEstablishmentPress={handleEstablishmentPress}
            />

            <View style={{ height: 100 }} />
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.floatingMapButton}
          onPress={handleMapButtonPress}
        >
          <LandLayerLocationIcon
            width={width * 0.045}
            height={width * 0.045}
            fill="#FFFFFF"
            style={{ marginRight: width * 0.02 }}
          />
          <Text style={styles.floatingMapButtonText}>{i18n.t('home.seeMap')}</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Modales - Renderizados al final para asegurar z-index correcto */}
      <MenuController
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
      />

      {/* Modal de permisos de ubicación */}
      <LocationPermissionModal
        visible={shouldShowModal}
        onAllow={handlePermissionGranted}
        onDeny={hideModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
    zIndex: 5,
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
    zIndex: 3,
  },
  floatingMapButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Medium',
  },
});

export default HomeScreen;