import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
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

// ✅ AGREGAR: Import del contexto de autenticación
import { useAuth } from '../context/AuthContext';

import LocationPermissionModal from '../components/LocationPermissionModal';
import { useLocation } from '../hooks/useLocation';
import i18n from '../i18n';
import { RootStackParamList } from '../navigation/navigationTypes';

// ✅ NUEVO: Import del sistema de iconos
import { UIIcon } from '../components/icons/IconSystem';

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
// ✅ AGREGAR: Import del hook de acciones de usuario
import { useUserActions } from '../hooks/useUserActions';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'HomeScreen'>;

const { width, height } = Dimensions.get('window');

const HomeScreen: React.FC<HomeScreenProps> = ({ route, navigation }) => {
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollY, setScrollY] = useState(0);

  // ✅ AGREGAR: Hook de autenticación
  const { user, isGuest } = useAuth();

  // Custom hooks para manejar datos y búsqueda
  const {
    selectedLocation,
    locationName,
    backgroundImage,
    categories,
    loading,
    allEstablishments,
    featuredEstablishments,
    trendingEstablishments,
    refreshEstablishments // ✅ AGREGAR: Función de refresh
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

  // ✅ AGREGAR: Hook de acciones de usuario
  const {
    userFavorites,
    updatingFavorites,
    userLikes,
    updatingLikes,
    handleFavoriteToggle,
    handleLikeToggle: originalHandleLikeToggle
  } = useUserActions(navigation);

  const {
    shouldShowModal,
    requestPermission,
    hideModal,
    hasPermission,
    location
  } = useLocation();

  // Estado para establecimientos cercanos con reviewCount actualizable
  const [nearbyEstablishments, setNearbyEstablishments] = useState<any[]>([]);
  // ✅ AGREGAR: Estados locales para establishments con reviewCount actualizable
  const [localFeaturedEstablishments, setLocalFeaturedEstablishments] = useState<any[]>([]);
  const [localTrendingEstablishments, setLocalTrendingEstablishments] = useState<any[]>([]);

  // ✅ AGREGAR: Refrescar datos cuando vuelves a la pantalla
  useFocusEffect(
    React.useCallback(() => {
      // Agregar un pequeño delay para dar tiempo a que el backend se actualice
      const timer = setTimeout(async () => {

        // ✅ USAR: Función de refresh del hook
        await refreshEstablishments();

        // Re-calcular nearbyEstablishments después del refresh
        if (hasPermission && location && allEstablishments.length > 0) {
          loadNearbyEstablishments();
        }
      }, 500); // ✅ Delay de 500ms para dar tiempo al backend

      return () => clearTimeout(timer);
    }, [refreshEstablishments, hasPermission, location])
  );
  useEffect(() => {
    if (featuredEstablishments && featuredEstablishments.length > 0) {
      setLocalFeaturedEstablishments(featuredEstablishments);
    }
  }, [featuredEstablishments]);

  useEffect(() => {
    if (trendingEstablishments && trendingEstablishments.length > 0) {
      setLocalTrendingEstablishments(trendingEstablishments);
    }
  }, [trendingEstablishments]);

  // ✅ AGREGAR: Función personalizada para manejar likes con actualización optimista
  const handleLikeToggleWithOptimism = async (establishmentId: string) => {
    // Verificar autenticación antes de hacer cambios optimistas
    if (!user || isGuest) {
      // Si no está logueado, solo mostrar el modal
      await originalHandleLikeToggle(establishmentId);
      return;
    }

    try {
      const isCurrentlyLiked = userLikes.includes(establishmentId);

      // ✅ CORREGIR: Función helper para actualizar reviewCount en un array
      const updateEstablishmentInArray = (establishments: any[]) =>
        establishments.map(establishment => {
          if (establishment.id === establishmentId) {
            const newReviewCount = isCurrentlyLiked
              ? Math.max(0, (establishment.reviewCount || 0) - 1)
              : (establishment.reviewCount || 0) + 1;

            return {
              ...establishment,
              reviewCount: newReviewCount
            };
          }
          return establishment;
        });

      // Actualizar optimisticamente en todos los arrays locales
      setNearbyEstablishments(prev => updateEstablishmentInArray(prev));
      setLocalFeaturedEstablishments(prev => updateEstablishmentInArray(prev));
      setLocalTrendingEstablishments(prev => updateEstablishmentInArray(prev));

      // Ejecutar la función original de like
      await originalHandleLikeToggle(establishmentId);

    } catch (error) {
      console.error('Error toggling like:', error);
      // En caso de error, revertir usando los datos originales del backend
      setLocalFeaturedEstablishments(featuredEstablishments);
      setLocalTrendingEstablishments(trendingEstablishments);
      // Recalcular nearbyEstablishments
      if (hasPermission && location && allEstablishments.length > 0) {
        loadNearbyEstablishments();
      }
    }
  };

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

  // Función para calcular distancia entre dos puntos
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // ✅ MOVER loadNearbyEstablishments fuera del useEffect para poder reutilizarla
  const loadNearbyEstablishments = () => {
    if (hasPermission && location && allEstablishments.length > 0) {
      try {
        const nearby = allEstablishments
          .map(establishment => {
            // Verificar que el establecimiento tenga coordenadas
            if (!establishment.coordinates?.latitude || !establishment.coordinates?.longitude) {
              return null;
            }

            const distance = calculateDistance(
              location.latitude,
              location.longitude,
              establishment.coordinates.latitude,
              establishment.coordinates.longitude
            );

            return { ...establishment, distance };
          })
          .filter((establishment): establishment is typeof establishment & { distance: number } =>
            establishment !== null && establishment.distance <= 30
          )
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 6);

        setNearbyEstablishments(nearby);
      } catch (error) {
        console.error('Error loading nearby establishments:', error);
      }
    } else {
      // Si no hay permisos o ubicación, limpiar la lista
      setNearbyEstablishments([]);
    }
  };

  // Efecto para cargar establecimientos cercanos cuando se otorgan permisos
  useEffect(() => {
    loadNearbyEstablishments();
  }, [hasPermission, location, allEstablishments]);

  const toggleMenu = () => {
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
    if (selectedLocation) {
      navigation.navigate('CategoryScreen', {
        categoryId,
        categoryTitle,
        selectedLocation
      });
    }
  };

  const handleEstablishmentPress = (establishmentId: string) => {
    navigation.navigate('EstablishmentScreen', { establishmentId });
  };

  const handleLocationButtonPress = () => {
    navigation.navigate('LocationSelection');
  };

  const handleMapButtonPress = () => {
    navigation.navigate('MapScreen', {
      selectedLocation: selectedLocation || undefined
    });
  };

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
    }
  };

  const handleEstablishmentFromSearch = (establishmentId: string) => {
    handleSelectEstablishment(establishmentId);
  };

  const handleShowAllSearchResults = () => {
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
            {/* ✅ REEMPLAZADO: ArrowLeftIcon por UIIcon */}
            <UIIcon
              name="arrow-left-bg"
              size={width * 0.06}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
            {/* ✅ REEMPLAZADO: MenuIcon por UIIcon */}
            <UIIcon
              name="menu-bg"
              size={width * 0.06}
              color="#FFFFFF"
            />
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

            {/* ============ SECCIONES CON PROPS DE USUARIO ============ */}

            {/* 1. Sección "Near me" - Solo se muestra si hay permisos de ubicación */}
            {hasPermission && nearbyEstablishments.length > 0 && (
              <EstablishmentSection
                title={i18n.t('home.nearMe')}
                establishments={nearbyEstablishments}
                onEstablishmentPress={handleEstablishmentPress}
                // ✅ AGREGAR: Props de usuario
                userFavorites={userFavorites}
                updatingFavorites={updatingFavorites}
                userLikes={userLikes}
                updatingLikes={updatingLikes}
                onFavoriteToggle={handleFavoriteToggle}
                onLikeToggle={handleLikeToggleWithOptimism}
              />
            )}

            {/* 2. Sección "Featured" - Establecimientos destacados */}
            {localFeaturedEstablishments.length > 0 && (
              <EstablishmentSection
                title={i18n.t('home.premiumSelection')}
                establishments={localFeaturedEstablishments} // ✅ Usar estado local
                onEstablishmentPress={handleEstablishmentPress}
                // ✅ AGREGAR: Props de usuario
                userFavorites={userFavorites}
                updatingFavorites={updatingFavorites}
                userLikes={userLikes}
                updatingLikes={updatingLikes}
                onFavoriteToggle={handleFavoriteToggle}
                onLikeToggle={handleLikeToggleWithOptimism}
              />
            )}

            {/* 3. Sección "Trending" - Establecimientos en tendencia */}
            {localTrendingEstablishments.length > 0 && (
              <EstablishmentSection
                title={i18n.t('home.trendingNow')}
                establishments={localTrendingEstablishments} // ✅ Usar estado local
                onEstablishmentPress={handleEstablishmentPress}
                // ✅ AGREGAR: Props de usuario
                userFavorites={userFavorites}
                updatingFavorites={updatingFavorites}
                userLikes={userLikes}
                updatingLikes={updatingLikes}
                onFavoriteToggle={handleFavoriteToggle}
                onLikeToggle={handleLikeToggleWithOptimism}
              />
            )}

            {/* =========================================== */}

            <View style={{ height: 100 }} />
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.floatingMapButton}
          onPress={handleMapButtonPress}
        >
          {/* ✅ REEMPLAZADO: LandLayerLocationIcon por UIIcon */}
          <UIIcon
            name="land-layer-location"
            size={width * 0.045}
            color="#FFFFFF"
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
    // ✅ CAMBIO: Remover paddingHorizontal general - cada componente maneja su propio padding
    paddingTop: width * 0.06,
    paddingBottom: width * 0.2,
  },
  heroTitle: {
    fontSize: width * 0.045,
    fontFamily: 'EuclidSquare-SemiBold',
    marginBottom: width * 0.03,
    color: '#1A1A2E',
    // ✅ AGREGAR: Padding horizontal solo para el título
    paddingHorizontal: width * 0.06,
  },
  searchContainer: {
    position: 'relative',
    zIndex: 100,
    marginBottom: width * 0.04,
    // ✅ AGREGAR: Padding horizontal solo para el search
    paddingHorizontal: width * 0.06,
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