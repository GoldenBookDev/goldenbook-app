import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import {
    checkLocationPermission,
    getCurrentLocation,
    LocationData,
    requestLocationPermission,
    reverseGeocode,
} from '../services/locationService';

const LOCATION_PERMISSION_ASKED_KEY = 'locationPermissionAsked';
const USER_LOCATION_KEY = 'userLocation';

interface UseLocationReturn {
  location: LocationData | null;
  isLoading: boolean;
  hasPermission: boolean;
  shouldShowModal: boolean;
  requestPermission: () => Promise<void>;
  hideModal: () => void;
  refreshLocation: () => Promise<void>;
  locationName: string | null;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const getSavedLocation = async (): Promise<LocationData | null> => {
    try {
      const saved = await AsyncStorage.getItem(USER_LOCATION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error getting saved location:', error);
      return null;
    }
  };

  const saveLocation = async (locationData: LocationData) => {
    try {
      await AsyncStorage.setItem(USER_LOCATION_KEY, JSON.stringify(locationData));
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  const checkShouldShowPermissionModal = useCallback(async () => {
    try {
      const hasAsked = await AsyncStorage.getItem(LOCATION_PERMISSION_ASKED_KEY);
      const permission = await checkLocationPermission();
      
      // Solo mostrar modal si no hemos preguntado antes Y no tenemos permisos
      if (!hasAsked && !permission) {
        setShouldShowModal(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking if should show permission modal:', error);
      return false;
    }
  }, []);

  const checkInitialPermission = useCallback(async () => {
    try {
      const permission = await checkLocationPermission();
      setHasPermission(permission);
      
      if (permission) {
        const savedLocation = await getSavedLocation();
        if (savedLocation) {
          setLocation(savedLocation);
          if (savedLocation.address) {
            setLocationName(savedLocation.address);
          }
        } else {
          // Solo actualizar ubicación si tenemos permisos pero no ubicación guardada
          await refreshLocation();
        }
      }
      
      return permission;
    } catch (error) {
      console.error('Error checking initial permission:', error);
      return false;
    }
  }, []);

  // Inicialización principal - solo una vez al montar el componente
  useEffect(() => {
    if (isInitialized) return; // Prevenir múltiples ejecuciones
    
    const initializePermissions = async () => {
      setIsLoading(true);
      
      try {
        // Primero verificar permisos actuales
        const hasCurrentPermission = await checkInitialPermission();
        
        // Si no tenemos permisos, verificar si debemos mostrar el modal
        if (!hasCurrentPermission) {
          await checkShouldShowPermissionModal();
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error during initialization:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializePermissions();
  }, []); // SIN dependencias - esta era la clave que funcionaba

  // Handle app state changes
  useEffect(() => {
    if (!isInitialized) return;

    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'active') {
        const permission = await checkLocationPermission();
        setHasPermission(permission);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isInitialized]);

  const requestPermission = async () => {
    setIsLoading(true);
    setShouldShowModal(false);
    
    try {
      // Esto mostrará el diálogo nativo del sistema
      const granted = await requestLocationPermission();
      setHasPermission(granted);
      
      if (granted) {
        // Si el usuario otorgó permisos, obtener ubicación
        await refreshLocation();
      }
      
      // Marcar que ya hemos preguntado por permisos (independientemente del resultado)
      await AsyncStorage.setItem(LOCATION_PERMISSION_ASKED_KEY, 'true');
    } catch (error) {
      console.error('Error requesting permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLocation = async () => {
    const currentPermission = await checkLocationPermission();
    if (!currentPermission) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const currentLocation = await getCurrentLocation();
      
      if (currentLocation) {
        // Obtener nombre de la dirección
        const address = await reverseGeocode(
          currentLocation.latitude,
          currentLocation.longitude
        );
        
        const locationWithAddress = {
          ...currentLocation,
          address: address || undefined,
        };
        
        setLocation(locationWithAddress);
        setLocationName(address);
        await saveLocation(locationWithAddress);
      }
    } catch (error) {
      console.error('Error refreshing location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hideModal = async () => {
    setShouldShowModal(false);
    // Marcar que ya hemos preguntado por permisos aunque se haya denegado
    await AsyncStorage.setItem(LOCATION_PERMISSION_ASKED_KEY, 'true');
  };

  return {
    location,
    isLoading,
    hasPermission,
    shouldShowModal,
    requestPermission,
    hideModal,
    refreshLocation,
    locationName,
  };
};