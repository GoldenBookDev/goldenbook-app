import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/navigationTypes';

// Import SVG components
import ArrowLeftIcon from '../assets/images/icons/arrow-left-bg.svg';
import BeachIcon from '../assets/images/icons/beach.svg';
import CalendarIcon from '../assets/images/icons/calendar.svg';
import CloseIcon from '../assets/images/icons/close.svg';
import FilterIcon from '../assets/images/icons/filter.svg';
import HandsIcon from '../assets/images/icons/hands.svg';
import LocationIcon from '../assets/images/icons/location.svg';
import MinusIcon from '../assets/images/icons/minus.svg';
import PeopleIcon from '../assets/images/icons/people.svg';
import PlateIcon from '../assets/images/icons/plate.svg';
import PlusIcon from '../assets/images/icons/plus.svg';
import ServicesIcon from '../assets/images/icons/services.svg';
import ShopIcon from '../assets/images/icons/shop.svg';
import SwimmerIcon from '../assets/images/icons/swimmer.svg';
import ThumbIcon from '../assets/images/icons/thumb.svg';

// Import Firestore service
import {
  Establishment,
  getCategories,
  getEstablishments,
  getLocationById,
  getTrendingEstablishments
} from '../services/firestoreService';

const { width, height } = Dimensions.get('window');

// Custom map style to match the app aesthetic
const customMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dadada"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#c9c9c9"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  }
];

// Default regions for each location
const defaultRegions = {
  porto: {
    latitude: 41.1579,
    longitude: -8.6291,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  },
  lisboa: {
    latitude: 38.7223,
    longitude: -9.1393,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  },
  algarve: {
    latitude: 37.0173,
    longitude: -8.0173,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  madeira: {
    latitude: 32.6669,
    longitude: -16.9241,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
};

// Category icon mapping
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

// Category colors for markers
const categoryColors = {
  culture: '#9B59B6',
  gastronomy: '#E9A03B',
  sports: '#3B92E9',
  events: '#A73BE9',
  shops: '#D4973D',
  beaches: '#3B92E9',
  transport: '#2ECC71',
  activities: '#E74C3C',
};

// Tipo para categoría con icono
interface CategoryWithIcon {
  id: string;
  title: string;
  icon: React.FC<any>;
}

type MapScreenProps = NativeStackScreenProps<RootStackParamList, 'MapScreen'>;

const MapScreen: React.FC<MapScreenProps> = ({ route, navigation }) => {
  const mapRef = useRef<MapView>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [categories, setCategories] = useState<CategoryWithIcon[]>([]);
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Función para convertir URL de Google Drive
  const getImageUrl = (url: string) => {
    if (url && url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/d\/(.+?)\/view/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
    }
    return url || '';
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Primero cargar las categorías
        const categoriesData = await getCategories();
        const formattedCategories = categoriesData.map(category => ({
          id: category.id,
          title: category.title,
          icon: iconMapping[category.id] || HandsIcon
        }));
        setCategories(formattedCategories);
        
        // Get selected location
        let location: string | null = route.params?.selectedLocation || null;
        
        if (!location) {
          location = await AsyncStorage.getItem('@goldenbook_selected_location');
          
          if (!location) {
            navigation.replace('LocationSelection');
            return;
          }
        }
        
        setSelectedLocation(location);
        
        // Get location data and set region
        const locationData = await getLocationById(location);
        
        if (locationData) {
          setLocationName(locationData.name);
          
          // Set region based on selected location
          if (defaultRegions[location as keyof typeof defaultRegions]) {
            setRegion(defaultRegions[location as keyof typeof defaultRegions]);
          }
          
          // Get establishments for this location (trending by default)
          const trendingEstablishments = await getTrendingEstablishments(location);
          console.log('Trending establishments loaded:', trendingEstablishments);
          setEstablishments(trendingEstablishments);
          
          // Si no hay trending, cargar todos los establecimientos
          if (trendingEstablishments.length === 0) {
            const allEstablishments = await getEstablishments(location);
            console.log('All establishments loaded:', allEstablishments);
            setEstablishments(allEstablishments.slice(0, 10)); // Limitar a 10 para no saturar el mapa
          }
        } else {
          setLocationName(location);
          // Fallback to default region
          setRegion(defaultRegions.algarve);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        // Fallback to default region
        setRegion(defaultRegions.algarve);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
    requestLocationPermission();
  }, [route.params?.selectedLocation]);

  // Función para solicitar permisos de ubicación usando expo-location
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionGranted(status === 'granted');
      
      if (status === 'granted') {
        getUserLocation();
      }
    } catch (error) {
      console.error('Error al solicitar permisos de ubicación:', error);
      setLocationPermissionGranted(false);
    }
  };

  // Función para obtener la ubicación del usuario usando expo-location
  const getUserLocation = async () => {
    try {
      if (locationPermissionGranted) {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });
        return { latitude, longitude };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      
      // Manejo específico para errores de permiso denegado
      if (Platform.OS === 'ios') {
        Alert.alert(
          'Permiso de ubicación requerido',
          'Para mostrar su ubicación en el mapa, necesitamos su permiso. Por favor, habilite la ubicación en la configuración de su dispositivo.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir Configuración', onPress: () => Linking.openSettings() }
          ]
        );
      }
      return null;
    }
  };

  // Función para centrar el mapa en la ubicación del usuario
  const centerOnUserLocation = async () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    } else {
      // Si no tenemos la ubicación, intentar obtenerla
      const location = await getUserLocation();
      
      if (location && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1000);
      } else if (!locationPermissionGranted) {
        requestLocationPermission();
      } else {
        Alert.alert(
          'Ubicación no disponible',
          'No podemos acceder a su ubicación actual. Por favor, asegúrese de que los servicios de ubicación están habilitados.',
          [
            { text: 'OK' },
            { text: 'Intentar de nuevo', onPress: () => getUserLocation() }
          ]
        );
      }
    }
  };

  const handleMarkerPress = (markerId: string) => {
    setSelectedMarker(markerId);
    
    // Find the corresponding establishment
    const establishment = establishments.find(e => e.id === markerId);
    
    if (establishment && mapRef.current) {
      // Animate to the marker position with a slight offset to account for the card
      mapRef.current.animateToRegion({
        latitude: establishment.coordinates.latitude - 0.002,
        longitude: establishment.coordinates.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      }, 500);
    }
  };

  // Función para hacer zoom in
  const handleZoomIn = () => {
    if (mapRef.current && region) {
      const newRegion = {
        ...region,
        latitudeDelta: region.latitudeDelta / 2,
        longitudeDelta: region.longitudeDelta / 2,
      };
      mapRef.current.animateToRegion(newRegion, 300);
      setRegion(newRegion);
    }
  };

  // Función para hacer zoom out
  const handleZoomOut = () => {
    if (mapRef.current && region) {
      const newRegion = {
        ...region,
        latitudeDelta: region.latitudeDelta * 2,
        longitudeDelta: region.longitudeDelta * 2,
      };
      mapRef.current.animateToRegion(newRegion, 300);
      setRegion(newRegion);
    }
  };

  // Función para filtrar por categoría
  const handleCategoryFilter = async (categoryId: string) => {
    if (!selectedLocation) return;
    
    try {
      if (selectedCategory === categoryId) {
        // Si ya estaba seleccionada, deseleccionar y volver a trending
        setSelectedCategory(null);
        const trendingEstablishments = await getTrendingEstablishments(selectedLocation);
        setEstablishments(trendingEstablishments);
      } else {
        // Seleccionar nueva categoría
        setSelectedCategory(categoryId);
        const categoryEstablishments = await getEstablishments(selectedLocation, categoryId);
        setEstablishments(categoryEstablishments);
      }
      
      // Deseleccionar marcador si existe
      setSelectedMarker(null);
    } catch (error) {
      console.error('Error filtering by category:', error);
    }
  };

  // Función para obtener el título de la categoría
  const getCategoryTitle = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.title : categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
  };

  // Render a custom marker
  const renderMarker = (establishment: Establishment) => {
    // Verificar si el establecimiento tiene coordenadas válidas
    if (!establishment.coordinates || 
        typeof establishment.coordinates.latitude !== 'number' || 
        typeof establishment.coordinates.longitude !== 'number' ||
        isNaN(establishment.coordinates.latitude) ||
        isNaN(establishment.coordinates.longitude)) {
      console.log(`Skipping establishment ${establishment.name} - invalid coordinates`);
      return null;
    }

    // Si hay una categoría seleccionada y este establecimiento no es de esa categoría, no mostrarlo
    if (selectedCategory && (!establishment.categories || !establishment.categories.includes(selectedCategory))) {
      return null;
    }

    // Obtener el icono y color de la primera categoría del establecimiento
    const primaryCategory = establishment.categories && establishment.categories.length > 0 ? establishment.categories[0] : '';
    const CategoryIcon = iconMapping[primaryCategory] || PlateIcon;
    const markerColor = categoryColors[primaryCategory as keyof typeof categoryColors] || '#00B383';
    
    return (
      <Marker
        key={establishment.id}
        coordinate={{
          latitude: establishment.coordinates.latitude,
          longitude: establishment.coordinates.longitude
        }}
        onPress={() => handleMarkerPress(establishment.id)}
      >
        <View style={[
          styles.markerContainer,
          { backgroundColor: markerColor },
          selectedMarker === establishment.id && styles.selectedMarker
        ]}>
          <CategoryIcon width={width * 0.04} height={width * 0.04} fill="#FFFFFF" />
        </View>
      </Marker>
    );
  };

  // Render details card for selected marker
  const renderSelectedMarkerCard = () => {
    if (!selectedMarker) return null;
    
    const establishment = establishments.find(e => e.id === selectedMarker);
    if (!establishment) return null;

    const imageUrl = establishment.mainImage ? getImageUrl(establishment.mainImage) : '';
    const primaryCategory = establishment.categories && establishment.categories.length > 0 ? establishment.categories[0] : '';
    const CategoryIcon = iconMapping[primaryCategory] || PlateIcon;
    const categoryTitle = getCategoryTitle(primaryCategory);

    return (
      <View style={styles.markerCardContainer}>
        <TouchableOpacity 
          style={styles.markerCard}
          onPress={() => {
            // Navigate to detail screen (to be implemented)
            console.log('Navigate to detail for', establishment.id);
          }}
        >
          <TouchableOpacity 
            style={styles.closeCardButton}
            onPress={() => setSelectedMarker(null)}
          >
            <CloseIcon width={width * 0.04} height={width * 0.04}/>
          </TouchableOpacity>
          <Image 
            source={imageUrl ? { uri: imageUrl } : require('../assets/images/porto.jpg')} 
            style={styles.markerCardImage} 
          />
          <View style={styles.markerCardInfo}>
            <Text style={styles.markerCardTitle}>{establishment.name}</Text>
            <Text style={styles.markerCardDescription}>
              {establishment.shortDescription || 'Restaurant'} • {establishment.address ? `${establishment.address.substring(0, 10)}...` : 'Unknown location'}
            </Text>
            <View style={styles.thumbContainer}>
              <ThumbIcon width={width * 0.04} height={width * 0.04} style={{ marginRight: width * 0.01 }} />
              <Text style={styles.reviewCount}>{establishment.reviewCount || 0}</Text>
            </View>
          </View>
          <View style={styles.markerCardCategoryBottom}>
            <View style={styles.categoryTagContent}>
              <CategoryIcon width={width * 0.04} height={width * 0.04} fill="#FFFFFF" />
              <Text style={styles.categoryTagText}>{categoryTitle}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Renderizar controles de zoom y ubicación
  const renderZoomControls = () => {
    return (
      <View style={styles.zoomControlsContainer}>
        <TouchableOpacity 
          style={styles.zoomButton}
          onPress={handleZoomIn}
        >
          {PlusIcon ? (
            <PlusIcon width={width * 0.05} height={width * 0.05} />
          ) : (
            <Text style={styles.zoomButtonText}>+</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.zoomButton}
          onPress={handleZoomOut}
        >
          {MinusIcon ? (
            <MinusIcon width={width * 0.05} height={width * 0.05} />
          ) : (
            <Text style={styles.zoomButtonText}>-</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={centerOnUserLocation}
        >
          {LocationIcon ? (
            <LocationIcon width={width * 0.05} height={width * 0.05} fill="#FFFFFF" />
          ) : (
            <Text style={styles.locationButtonText}>📍</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region || defaultRegions.algarve}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        customMapStyle={Platform.OS === 'android' ? customMapStyle : undefined}
        showsUserLocation={locationPermissionGranted}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoors={false}
        zoomEnabled={true}
        onMapReady={() => console.log('Mapa cargado correctamente')}
      >
        {establishments.map((establishment) => {
          console.log(`Rendering marker for: ${establishment.name}`, establishment.coordinates);
          return renderMarker(establishment);
        })}
      </MapView>
      
      {/* Header */}
      <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeftIcon width={width * 0.1} height={width * 0.1} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{locationName}</Text>
          <TouchableOpacity style={styles.filterButton}>
            <FilterIcon width={width * 0.06} height={width * 0.06} />
          </TouchableOpacity>
        </View>
        
        {/* Category filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
          style={styles.categoriesScroll}
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <TouchableOpacity 
                key={category.id} 
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonSelected
                ]}
                onPress={() => handleCategoryFilter(category.id)}
              >
                <Icon width={width * 0.045} height={width * 0.045}/>
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextSelected
                ]}>{category.title}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
      
      {/* Zoom controls */}
      {renderZoomControls()}
      
      {/* Selected marker details card */}
      {renderSelectedMarkerCard()}
    </View>
  );
};

// Styles 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'red',
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
  categoriesScroll: {
    backgroundColor: 'white',
    paddingBottom: width * 0.03,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  categoriesScrollContent: {
    paddingHorizontal: width * 0.04,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: width * 0.02,
    paddingHorizontal: width * 0.03,
    borderRadius: 20,
    marginRight: width * 0.02,
  },
  categoryButtonSelected: {
    backgroundColor: '#1A1A2E',
  },
  categoryButtonText: {
    fontSize: width * 0.03,
    fontFamily: 'EuclidSquare-Medium',
    color: '#1A1A2E',
    marginLeft: width * 0.01,
  },
  categoryButtonTextSelected: {
    color: 'white',
  },
  markerContainer: {
    width: width * 0.08,
    height: width * 0.08,
    borderRadius: width * 0.04,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: 'white',
  },
  selectedMarker: {
    width: width * 0.09,
    height: width * 0.09,
    borderRadius: width * 0.045,
    borderWidth: 2,
    borderColor: 'white',
  },
  markerCardContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? width * 0.08 : width * 0.05,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  markerCard: {
    width: width * 0.9,
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  markerCardImage: {
    width: width * 0.25,
    height: '100%',
    resizeMode: 'cover',
  },
  markerCardInfo: {
    flex: 1,
    padding: width * 0.03,
    justifyContent: 'center',
  },
  markerCardTitle: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-SemiBold',
    color: '#1A1A2E',
    marginBottom: width * 0.01,
  },
  markerCardDescription: {
    fontSize: width * 0.03,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
    marginBottom: width * 0.01,
  },
  markerCardCategoryBottom: {
    position: 'absolute',
    bottom: width * 0.02,
    right: width * 0.02,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: width * 0.02,
    paddingVertical: width * 0.01,
    borderRadius: 4,
  },
  categoryTagContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTagText: {
    color: 'white',
    fontSize: width * 0.025,
    fontFamily: 'EuclidSquare-Medium',
    marginLeft: width * 0.01,
  },
  thumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width * 0.01,
  },
  reviewCount: {
    fontSize: width * 0.03,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
  },
  closeCardButton: {
    position: 'absolute',
    top: width * 0.02,
    right: width * 0.02,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: width * 0.04,
    padding: width * 0.01,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  zoomControlsContainer: {
    position: 'absolute',
    right: width * 0.04,
    bottom: width * 0.25,
    alignItems: 'center',
    zIndex: 5,
  },
  zoomButton: {
    width: width * 0.1,
    height: width * 0.1,
    backgroundColor: 'white',
    borderRadius: width * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: width * 0.02,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationButton: {
    width: width * 0.1,
    height: width * 0.1,
    backgroundColor: '#1A1A2E',
    borderRadius: width * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: width * 0.02,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  zoomButtonText: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  locationButtonText: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingText: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Regular',
    color: '#1A1A2E',
  },
});

export default MapScreen;