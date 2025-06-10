import * as Location from 'expo-location';
import i18n from '../i18n';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    console.log('🚀 About to request location permission...');
    
    // Esto SÍ debe mostrar el diálogo nativo del sistema
    const result = await Location.requestForegroundPermissionsAsync();    
    // Solo retornar el resultado, sin Alert adicional
    // El diálogo nativo ya manejó la UX
    return result.status === 'granted';
  } catch (error) {
    console.error('❌ Error requesting location permission:', error);
    return false;
  }
};

export const getCurrentLocation = async (): Promise<LocationData | null> => {
  try {
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 10000,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

export const checkLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
};

export const reverseGeocode = async (latitude: number, longitude: number): Promise<string | null> => {
  try {
    const result = await Location.reverseGeocodeAsync({ latitude, longitude });
    
    if (result.length > 0) {
      const address = result[0];
      return `${address.city || ''}, ${address.region || ''}, ${address.country || ''}`.replace(/^,\s*|,\s*$/g, '');
    }
    
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in kilometers
  return d;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Función opcional para mostrar Alert de configuración si lo necesitas en otro lugar
export const showLocationSettingsAlert = () => {
  const { Alert } = require('react-native');
  Alert.alert(
    i18n.t('location.permissionDenied'),
    i18n.t('location.permissionDeniedMessage'),
    [
      { text: i18n.t('common.cancel'), style: 'cancel' },
      { text: i18n.t('common.settings'), onPress: () => Location.enableNetworkProviderAsync() }
    ]
  );
};