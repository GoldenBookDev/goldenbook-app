import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    Establishment,
    getCategories,
    getEstablishmentById,
    getEstablishments,
    getLocationById,
    getTrendingEstablishments
} from '../services/firestoreService';

// Icons
import BeachIcon from '../assets/images/icons/beach.svg';
import CalendarIcon from '../assets/images/icons/calendar.svg';
import HandsIcon from '../assets/images/icons/hands.svg';
import PeopleIcon from '../assets/images/icons/people.svg';
import PlateIcon from '../assets/images/icons/plate.svg';
import ServicesIcon from '../assets/images/icons/services.svg';
import ShopIcon from '../assets/images/icons/shop.svg';
import SwimmerIcon from '../assets/images/icons/swimmer.svg';

const iconMapping: { [key: string]: React.FC<any> } = {
  'culture': HandsIcon,
  'gastronomy': PlateIcon,
  'sports': SwimmerIcon,
  'events': CalendarIcon,
  'shops': ShopIcon,
  'beaches': BeachIcon,
  'transport': ServicesIcon,
  'activities': PeopleIcon,
};

interface CategoryWithIcon {
  id: string;
  title: string;
  icon: React.FC<any>;
}

const isValidCoordinate = (coord: any): boolean => {
  return coord &&
    typeof coord.latitude === 'number' &&
    typeof coord.longitude === 'number' &&
    !isNaN(coord.latitude) &&
    !isNaN(coord.longitude) &&
    coord.latitude >= -90 && coord.latitude <= 90 &&
    coord.longitude >= -180 && coord.longitude <= 180;
};

export const useMapData = (route: any, navigation: any) => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [categories, setCategories] = useState<CategoryWithIcon[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dataInitialized, setDataInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const initializeData = async () => {
      if (dataInitialized) return;

      try {
        setLoading(true);
        
        // Load categories
        const categoriesData = await getCategories();
        if (!isMounted) return;
        
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
        
        if (!isMounted) return;
        setSelectedLocation(location);
        
        // Get location data
        const locationData = await getLocationById(location);
        if (!isMounted) return;
        
        if (locationData) {
          setLocationName(locationData.name);
        } else {
          setLocationName(location);
        }
        
        // Load establishments
        const trendingEstablishments = await getTrendingEstablishments(location);
        let finalEstablishments = trendingEstablishments;
        
        if (trendingEstablishments.length === 0) {
          const allEstablishments = await getEstablishments(location);
          finalEstablishments = allEstablishments.slice(0, 15);
        }
        
        const validEstablishments = finalEstablishments.filter(est => isValidCoordinate(est.coordinates));
        
        if (!isMounted) return;
        setEstablishments(validEstablishments);
        setDataInitialized(true);
        
      } catch (error) {
        console.error('Error initializing map data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (!dataInitialized) {
      setDataInitialized(true);
      initializeData();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCategoryFilter = async (categoryId: string) => {
    if (!selectedLocation) return;

    try {
      if (selectedCategory === categoryId) {
        setSelectedCategory(null);
        const trendingEstablishments = await getTrendingEstablishments(selectedLocation);
        let finalEstablishments = trendingEstablishments;
        
        if (trendingEstablishments.length === 0) {
          const allEstablishments = await getEstablishments(selectedLocation);
          finalEstablishments = allEstablishments.slice(0, 15);
        }

        const validEstablishments = finalEstablishments.filter(est => isValidCoordinate(est.coordinates));
        setEstablishments(validEstablishments);
      } else {
        setSelectedCategory(categoryId);
        const categoryEstablishments = await getEstablishments(selectedLocation, categoryId);
        const validEstablishments = categoryEstablishments.filter(est => isValidCoordinate(est.coordinates));
        setEstablishments(validEstablishments);
      }
    } catch (error) {
      console.error('Error filtering by category:', error);
    }
  };

  const loadSpecificEstablishment = async (establishmentId: string) => {
    try {
      const establishment = await getEstablishmentById(establishmentId);
      if (establishment && isValidCoordinate(establishment.coordinates)) {
        setEstablishments(prev => {
          const exists = prev.find(e => e.id === establishmentId);
          if (!exists) {
            return [establishment, ...prev];
          }
          return prev;
        });
        return establishment;
      }
    } catch (error) {
      console.error('Error loading specific establishment:', error);
    }
    return null;
  };

  return {
    selectedLocation,
    locationName,
    establishments,
    categories,
    selectedCategory,
    loading,
    handleCategoryFilter,
    loadSpecificEstablishment
  };
};
