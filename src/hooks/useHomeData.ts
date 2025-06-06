import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import i18n from '../i18n';
import {
  Establishment,
  getCategories,
  getEstablishments,
  getFeaturedEstablishments,
  getLocationById,
  getTrendingEstablishments
} from '../services/firestoreService';
import { getLocationImage, normalizeLocationId } from '../utils/imageMapping';

// Import SVG components para iconos
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

export const useHomeData = (route: any, navigation: any) => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [backgroundImage, setBackgroundImage] = useState<any>(null);
  const [categories, setCategories] = useState<Array<{ id: string, title: string, icon: React.FC<any> }>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Estados para establecimientos
  const [allEstablishments, setAllEstablishments] = useState<Establishment[]>([]);
  const [recommendedEstablishments, setRecommendedEstablishments] = useState<Establishment[]>([]);
  const [featuredEstablishments, setFeaturedEstablishments] = useState<Establishment[]>([]);
  const [trendingEstablishments, setTrendingEstablishments] = useState<Establishment[]>([]);
  const [newEstablishments, setNewEstablishments] = useState<Establishment[]>([]);
  const [popularEstablishments, setPopularEstablishments] = useState<Establishment[]>([]);
  const [topRatedEstablishments, setTopRatedEstablishments] = useState<Establishment[]>([]);

  // Función para obtener establecimientos recomendados (aleatorios por ahora)
  const getRecommendedEstablishments = (establishments: Establishment[]): Establishment[] => {
    const shuffled = [...establishments].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  };

  // Función para obtener establecimientos más populares (por número de reseñas)
  const getPopularEstablishments = (establishments: Establishment[]): Establishment[] => {
    return [...establishments]
      .filter(est => est.reviewCount > 0)
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 5);
  };

  // Función para obtener establecimientos mejor valorados
  const getTopRatedEstablishments = (establishments: Establishment[]): Establishment[] => {
    return [...establishments]
      .filter(est => est.rating >= 4.0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);

        // Cargar las categorías con traducciones
        const categoriesData = await getCategories();
        const formattedCategories = categoriesData.map(category => ({
          id: category.id,
          title: i18n.t(`categories.${category.id}`) || category.title,
          icon: iconMapping[category.id] || HandsIcon
        }));
        setCategories(formattedCategories);

        let location: string | null = route.params?.selectedLocation || null;

        if (!location) {
          location = await AsyncStorage.getItem('@goldenbook_selected_location');

          if (!location) {
            navigation.replace('LocationSelection');
            return;
          }
        }

        setSelectedLocation(location);

        const locationData = await getLocationById(location);

        if (locationData) {
          setLocationName(locationData.name);

          // Usar imagen local en lugar de remota
          const normalizedId = normalizeLocationId(locationData.name || location);
          const localImage = getLocationImage(normalizedId, false);
          setBackgroundImage(localImage);

          // Obtener todos los establecimientos
          const allEstablishmentsData = await getEstablishments(location);
          setAllEstablishments(allEstablishmentsData);

          // Establecimientos recomendados (aleatorios)
          const recommended = getRecommendedEstablishments(allEstablishmentsData);
          setRecommendedEstablishments(recommended);

          // Establecimientos destacados (featured)
          const featured = await getFeaturedEstablishments(location);
          setFeaturedEstablishments(featured);

          // Establecimientos en tendencia
          const trending = await getTrendingEstablishments(location);
          setTrendingEstablishments(trending);

          // Establecimientos más populares (por reseñas)
          const popular = getPopularEstablishments(allEstablishmentsData);
          setPopularEstablishments(popular);

          // Establecimientos mejor valorados
          const topRated = getTopRatedEstablishments(allEstablishmentsData);
          setTopRatedEstablishments(topRated);

          // Establecimientos para descubrir (aleatorios diferentes)
          const discover = getRecommendedEstablishments(allEstablishmentsData);
          setNewEstablishments(discover);

        } else {
          setLocationName(location);
          const localImage = getLocationImage(location, false);
          setBackgroundImage(localImage);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        setBackgroundImage(getLocationImage('default', false));
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [route.params?.selectedLocation]);

  return {
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
  };
};
