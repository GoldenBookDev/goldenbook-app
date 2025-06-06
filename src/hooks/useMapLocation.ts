import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import i18n from '../i18n';

export const useMapLocation = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean>(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermissionGranted(status === 'granted');

      if (status === 'granted') {
        getUserLocation();
      }
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      setLocationPermissionGranted(false);
    }
  };

  const getUserLocation = async () => {
    try {
      if (locationPermissionGranted) {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });

        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });
        return { latitude, longitude };
      }
    } catch (error) {
      console.error('Error getting user location:', error);
      return null;
    }
  };

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

  return {
    userLocation,
    locationPermissionGranted,
    centerOnUserLocation
  };
};
