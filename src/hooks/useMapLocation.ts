import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import i18n from '../i18n';

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface SupportedZone {
  id: string;
  name: string;
  center: UserLocation;
  radius: number; // en metros
}

// ✅ Definir zonas soportadas con radios generosos
const SUPPORTED_ZONES: SupportedZone[] = [
  {
    id: 'lisboa',
    name: 'Lisboa',
    center: { latitude: 38.7223, longitude: -9.1393 },
    radius: 50000 // 50km
  },
  {
    id: 'porto', 
    name: 'Porto',
    center: { latitude: 41.1579, longitude: -8.6291 },
    radius: 30000 // 30km
  },
  {
    id: 'algarve',
    name: 'Algarve', 
    center: { latitude: 37.0194, longitude: -7.9306 },
    radius: 100000 // 100km (región más grande)
  },
  {
    id: 'madeira',
    name: 'Madeira',
    center: { latitude: 32.6669, longitude: -16.9241 },
    radius: 50000 // 50km
  }
];

// ✅ Función para calcular distancia entre dos puntos (Haversine)
const calculateDistance = (point1: UserLocation, point2: UserLocation): number => {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distancia en metros
};

export const useLocationServices = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean>(false);
  const [isInSupportedZone, setIsInSupportedZone] = useState<boolean>(false);
  const [currentZone, setCurrentZone] = useState<SupportedZone | null>(null);
  const [locationChecked, setLocationChecked] = useState<boolean>(false);

  // ✅ Derivar shouldShowNearMe del estado
  const shouldShowNearMe = locationPermissionGranted && isInSupportedZone && userLocation !== null;

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // ✅ Verificar si el usuario está en una zona soportada
  const checkIfInSupportedZone = useCallback((location: UserLocation) => {
    for (const zone of SUPPORTED_ZONES) {
      const distance = calculateDistance(location, zone.center);
      if (distance <= zone.radius) {
        setIsInSupportedZone(true);
        setCurrentZone(zone);
        return zone;
      }
    }
    setIsInSupportedZone(false);
    setCurrentZone(null);
    return null;
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setLocationPermissionGranted(granted);
      
      if (granted) {
        await getUserLocation();
      } else {
        setLocationChecked(true);
      }
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      setLocationPermissionGranted(false);
      setLocationChecked(true);
    }
  };

  const getUserLocation = async (): Promise<UserLocation | null> => {
    try {
      if (!locationPermissionGranted) {
        return null;
      }

      // ✅ Implementar timeout manual con Promise.race
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Location timeout after 10 seconds')), 10000);
      });

      const location = await Promise.race([locationPromise, timeoutPromise]);

      const userPos: UserLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };

      setUserLocation(userPos);
      checkIfInSupportedZone(userPos);
      setLocationChecked(true);

      return userPos;
    } catch (error) {
      console.error('Error getting user location:', error);
      setLocationChecked(true);
      return null;
    }
  };

  // ✅ Función para centrar mapa (mantener compatibilidad)
  const centerOnUserLocation = async (mapRef: any, mapReady: boolean) => {
    if (userLocation && mapRef.current && mapReady) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    } else {
      const location = await getUserLocation();
      if (location && mapRef.current && mapReady) {
        mapRef.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      } else {
        Alert.alert(
          i18n.t('map.locationNotAvailable'),
          i18n.t('map.cannotAccessLocation'),
          [
            { text: i18n.t('map.ok') },
            { text: i18n.t('map.retry'), onPress: () => requestLocationPermission() }
          ]
        );
      }
    }
  };

  // ✅ Función para calcular distancia a establishments
  const calculateDistanceToEstablishment = (establishmentCoords: UserLocation): number | null => {
    if (!userLocation) return null;
    return calculateDistance(userLocation, establishmentCoords);
  };

  // ✅ Función para ordenar establishments por distancia
  const sortEstablishmentsByDistance = (establishments: any[]): any[] => {
    if (!userLocation) return establishments;

    return [...establishments].sort((a, b) => {
      const distanceA = a.coordinates ? calculateDistanceToEstablishment(a.coordinates) : Infinity;
      const distanceB = b.coordinates ? calculateDistanceToEstablishment(b.coordinates) : Infinity;
      
      if (distanceA === null) return 1;
      if (distanceB === null) return -1;
      
      return distanceA - distanceB;
    });
  };

  // ✅ Función para refrescar ubicación (para Settings)
  const refreshLocation = async () => {
    console.log('🔄 Refreshing user location...');
    setLocationChecked(false);
    await requestLocationPermission();
  };

  return {
    // Estados básicos
    userLocation,
    locationPermissionGranted,
    isInSupportedZone,
    currentZone,
    locationChecked,
    
    // Estado derivado principal
    shouldShowNearMe,
    
    // Funciones para mapa (compatibilidad)
    centerOnUserLocation,
    
    // Funciones para filtros y ordenamiento
    calculateDistanceToEstablishment,
    sortEstablishmentsByDistance,
    
    // Funciones para gestión
    requestLocationPermission,
    getUserLocation,
    refreshLocation,
    
    // Datos útiles
    supportedZones: SUPPORTED_ZONES
  };
};

// ✅ Alias para mantener compatibilidad con el hook anterior
export const useMapLocation = useLocationServices;