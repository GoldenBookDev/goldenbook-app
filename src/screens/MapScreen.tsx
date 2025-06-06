import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/navigationTypes';

// Import SVG components
import ArrowLeftIcon from '../assets/images/icons/arrow-left-bg.svg';
import FilterIcon from '../assets/images/icons/filter.svg';

// Imports de componentes y hooks refactorizados
import CategoryFilters from '../components/CategoryFilters';
import MapControls from '../components/MapControls';
import MapMarker from '../components/MapMarker';
import MarkerDetailsCard from '../components/MarkerDetailsCard';
import { useMapData } from '../hooks/useMapData';
import { useMapLocation } from '../hooks/useMapLocation';

const { width } = Dimensions.get('window');

// Configuración de regiones por defecto
const defaultRegions = {
  porto: {
    latitude: 41.1579,
    longitude: -8.6291,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
  lisboa: {
    latitude: 38.7223,
    longitude: -9.1393,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
  algarve: {
    latitude: 37.0173,
    longitude: -8.0173,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  },
  madeira: {
    latitude: 32.6669,
    longitude: -16.9241,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  },
};

// Función utilitaria para validar coordenadas
const isValidCoordinate = (coord: any): boolean => {
  return coord &&
    typeof coord.latitude === 'number' &&
    typeof coord.longitude === 'number' &&
    !isNaN(coord.latitude) &&
    !isNaN(coord.longitude) &&
    coord.latitude >= -90 && coord.latitude <= 90 &&
    coord.longitude >= -180 && coord.longitude <= 180;
};

type MapScreenProps = NativeStackScreenProps<RootStackParamList, 'MapScreen'>;

const MapScreen: React.FC<MapScreenProps> = ({ route, navigation }) => {
  const mapRef = useRef<MapView>(null);

  // Estados del mapa
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Hooks personalizados para datos y ubicación
  const {
    selectedLocation,
    locationName,
    establishments,
    categories,
    selectedCategory,
    loading,
    handleCategoryFilter,
    loadSpecificEstablishment
  } = useMapData(route, navigation);

  const {
    locationPermissionGranted,
    centerOnUserLocation
  } = useMapLocation();

  // Establecer región inicial cuando se carga la ubicación
  useEffect(() => {
    if (selectedLocation && !region) {
      if (defaultRegions[selectedLocation as keyof typeof defaultRegions]) {
        const initialRegion = defaultRegions[selectedLocation as keyof typeof defaultRegions];
        setRegion(initialRegion);
      }
    }
  }, [selectedLocation]);

  // Manejar enfoque de establecimiento específico
  useEffect(() => {
    const handleFocusEstablishment = async () => {
      const { focusEstablishmentId, openModal } = route.params || {};

      if (!focusEstablishmentId || !openModal || !mapReady || !initialLoadComplete) {
        return;
      }

      let establishment = establishments.find(e => e.id === focusEstablishmentId);

      if (!establishment) {
        establishment = await loadSpecificEstablishment(focusEstablishmentId) || undefined;
      }

      if (!establishment || !isValidCoordinate(establishment.coordinates)) {
        return;
      }

      // Centrar mapa
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: establishment.coordinates.latitude,
          longitude: establishment.coordinates.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }

      // Abrir modal
      setSelectedMarker(focusEstablishmentId);

      // Reintentos para asegurar que el modal se abra
      setTimeout(() => setSelectedMarker(focusEstablishmentId), 1200);
      setTimeout(() => setSelectedMarker(focusEstablishmentId), 2000);
    };

    handleFocusEstablishment();
  }, [route.params?.focusEstablishmentId, route.params?.openModal, mapReady, initialLoadComplete, establishments.length]);

  // Limpiar parámetros de navegación
  useEffect(() => {
    if (route.params?.focusEstablishmentId && mapReady && initialLoadComplete) {
      const timer = setTimeout(() => {
        try {
          if (navigation.isFocused()) {
            navigation.setParams({
              focusEstablishmentId: undefined,
              openModal: undefined,
            });
          }
        } catch (error) {
          console.log('No se pudieron limpiar los parámetros');
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [route.params?.focusEstablishmentId, mapReady, initialLoadComplete, navigation]);

  // Marcar como completada la carga inicial
  useEffect(() => {
    if (!loading && establishments.length > 0 && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [loading, establishments.length]);

  // Manejadores de eventos del mapa
  const handleMarkerPress = (markerId: string) => {
    setSelectedMarker(markerId);

    const establishment = establishments.find(e => e.id === markerId);
    if (establishment && mapRef.current && mapReady && isValidCoordinate(establishment.coordinates)) {
      mapRef.current.animateToRegion({
        latitude: establishment.coordinates.latitude - 0.002,
        longitude: establishment.coordinates.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current && region && mapReady) {
      const newRegion = {
        ...region,
        latitudeDelta: Math.max(region.latitudeDelta / 2, 0.001),
        longitudeDelta: Math.max(region.longitudeDelta / 2, 0.001),
      };
      mapRef.current.animateToRegion(newRegion, 300);
      setRegion(newRegion);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current && region && mapReady) {
      const newRegion = {
        ...region,
        latitudeDelta: Math.min(region.latitudeDelta * 2, 10),
        longitudeDelta: Math.min(region.longitudeDelta * 2, 10),
      };
      mapRef.current.animateToRegion(newRegion, 300);
      setRegion(newRegion);
    }
  };

  const handleCenterLocation = () => {
    centerOnUserLocation(mapRef, mapReady);
  };

  const handleMarkerCardPress = () => {
    const establishment = establishments.find(e => e.id === selectedMarker);
    if (establishment) {
      navigation.navigate('EstablishmentScreen', {
        establishmentId: establishment.id
      });
    }
  };

  // Establecimiento seleccionado para el modal
  const selectedEstablishment = selectedMarker
    ? establishments.find(e => e.id === selectedMarker) || null
    : null;

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Mapa principal */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={region || defaultRegions.lisboa}
        showsUserLocation={locationPermissionGranted}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoors={false}
        zoomEnabled={true}
        scrollEnabled={true}
        rotateEnabled={false}
        pitchEnabled={false}
        onMapReady={() => setMapReady(true)}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
      >
        {mapReady && establishments.map((establishment) => (
          <MapMarker
            key={establishment.id}
            establishment={establishment}
            isSelected={selectedMarker === establishment.id}
            selectedCategory={selectedCategory}
            onPress={handleMarkerPress}
          />
        ))}
      </MapView>

      {/* Header con navegación */}
      <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeftIcon width={width * 0.1} height={width * 0.1} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{locationName}</Text>
          <TouchableOpacity style={styles.filterButton}>
            <FilterIcon width={width * 0.06} height={width * 0.06} />
          </TouchableOpacity>
        </View>

        {/* Filtros de categorías */}
        <CategoryFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryPress={handleCategoryFilter}
        />
      </SafeAreaView>

      {/* Controles de zoom y ubicación */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenterLocation={handleCenterLocation}
      />

      {/* Tarjeta de detalles del marcador seleccionado */}
      <MarkerDetailsCard
        establishment={selectedEstablishment}
        categories={categories}
        onClose={() => setSelectedMarker(null)}
        onPress={handleMarkerCardPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    backgroundColor: 'white',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 10 : 50,
    paddingHorizontal: width * 0.04,
    paddingBottom: width * 0.04,
    backgroundColor: 'white',
  },
  backButton: {
    width: width * 0.1,
    height: width * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: width * 0.045,
    fontFamily: 'EuclidSquare-SemiBold',
    color: '#1A1A2E',
  },
  filterButton: {
    width: width * 0.1,
    height: width * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Regular',
    color: '#1A1A2E',
  },
});

export default MapScreen;