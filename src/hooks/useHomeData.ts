import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
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

// ✅ NUEVO: Mapeo usando strings
const iconMapping: { [key: string]: string } = {
  'culture': 'culture',
  'gastronomy': 'gastronomy',
  'sports': 'sports',
  'events': 'events',
  'shops': 'shops',
  'beaches': 'beaches',
  'transport': 'transport',
  'activities': 'activities',
};

// Mapeo correcto de IDs de ubicación a ciudades
const cityMapping: { [key: string]: string } = {
  'madeira': 'Madeira',
  'lisboa': 'Lisboa', 
  'porto': 'Porto',
  'algarve': 'Algarve'
};

// Función para obtener contenido traducido
const getTranslatedContent = (
  translations: any,
  field: string,
  language: string = 'pt',
  fallback: any = ''
): any => {
  if (translations && translations[field] && translations[field][language]) {
    return translations[field][language];
  }
  return fallback;
};

// Función para normalizar un establecimiento desde Firestore
const normalizeEstablishment = (doc: any): Establishment => {
  const data = doc.data ? doc.data() : doc;
  const currentLanguage = i18n.locale || 'pt';
  
  const shortDescription = getTranslatedContent(
    data.translations, 
    'shortDescription', 
    currentLanguage, 
    data.shortDescription || ''
  );
  
  const fullDescription = getTranslatedContent(
    data.translations, 
    'fullDescription', 
    currentLanguage, 
    data.fullDescription || ''
  );
  
  const openingHours = getTranslatedContent(
    data.translations, 
    'openingHours', 
    currentLanguage, 
    data.openingHours || ''
  );
  
  const categories = getTranslatedContent(
    data.translations, 
    'categories', 
    currentLanguage, 
    data.categories || []
  );
  
  const subcategories = getTranslatedContent(
    data.translations, 
    'subcategories', 
    currentLanguage, 
    data.subcategories || []
  );
  
  return {
    id: doc.id || data.id || '',
    name: data.name || '',
    shortDescription: shortDescription,
    fullDescription: fullDescription,
    mainImage: data.mainImage || '',
    gallery: data.gallery || [],
    address: data.address || '',
    city: data.city || '',
    phone: data.phone || '',
    email: data.email || '',
    website: data.website || '',
    reservationLink: data.reservationLink || '',
    openingHours: openingHours,
    categories: categories,
    subcategories: subcategories,
    rating: data.rating || 0,
    reviewCount: data.reviewCount || 0,
    featured: data.featured || false,
    trending: data.trending || false,
    coordinates: data.coordinates || { latitude: 0, longitude: 0 },
    createdAt: data.createdAt,
    createdBy: data.createdBy,
    lastModifiedAt: data.lastModifiedAt,
    lastModifiedBy: data.lastModifiedBy,
    migratedAt: data.migratedAt,
    migrationSource: data.migrationSource,
    stats: data.stats || { favoriteCount: 0 },
    subscriptionValue: data.subscriptionValue || 0,
    translations: data.translations || {},
    version: data.version || 1
  };
};

export const useHomeData = (route: any, navigation: any) => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [backgroundImage, setBackgroundImage] = useState<any>(null);
  const [categories, setCategories] = useState<Array<{ id: string, title: string, icon: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Estados simplificados - solo las secciones que queremos mostrar
  const [allEstablishments, setAllEstablishments] = useState<Establishment[]>([]);
  const [featuredEstablishments, setFeaturedEstablishments] = useState<Establishment[]>([]);
  const [trendingEstablishments, setTrendingEstablishments] = useState<Establishment[]>([]);

  // ✅ AGREGAR: Función para refrescar solo los establishments
  const refreshEstablishments = useCallback(async () => {
    if (!selectedLocation) return;

    try {
      // Obtener establecimientos frescos desde Firestore
      const rawEstablishmentsData = await getEstablishments(selectedLocation);
      
      // Normalizar establecimientos
      const allEstablishmentsData = rawEstablishmentsData.map(normalizeEstablishment);
      
      if (allEstablishmentsData.length > 0) {
        setAllEstablishments(allEstablishmentsData);

        // Obtener establecimientos destacados (featured)
        try {
          const rawFeatured = await getFeaturedEstablishments(selectedLocation);
          
          if (rawFeatured.length > 0) {
            const featured = rawFeatured.map(normalizeEstablishment);
            setFeaturedEstablishments(featured);
          } else {
            // Fallback: filtrar localmente
            const localFeatured = allEstablishmentsData.filter(est => est.featured);
            setFeaturedEstablishments(localFeatured);
          }
        } catch (error) {
          console.error('❌ Error refrescando destacados:', error);
          const localFeatured = allEstablishmentsData.filter(est => est.featured);
          setFeaturedEstablishments(localFeatured);
        }

        // Obtener establecimientos trending
        try {
          const rawTrending = await getTrendingEstablishments(selectedLocation);
          
          if (rawTrending.length > 0) {
            const trending = rawTrending.map(normalizeEstablishment);
            setTrendingEstablishments(trending);
          } else {
            // Fallback: filtrar localmente
            const localTrending = allEstablishmentsData.filter(est => est.trending);
            setTrendingEstablishments(localTrending);
          }
        } catch (error) {
          console.error('❌ Error refrescando trending:', error);
          const localTrending = allEstablishmentsData.filter(est => est.trending);
          setTrendingEstablishments(localTrending);
        }

      }
    } catch (error) {
      console.error('❌ Error refrescando establishments:', error);
    }
  }, [selectedLocation]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);

        // Cargar categorías
        try {
          const categoriesData = await getCategories();
          
          // ✅ NUEVO: Mapeo usando strings
          const formattedCategories = categoriesData.map(category => {
            const iconString = iconMapping[category.id] || 'culture';
            return {
              id: category.id,
              title: i18n.t(`categories.${category.id}`) || category.title,
              icon: iconString // ✅ STRING, no función
            };
          });
          
          setCategories(formattedCategories);
        } catch (error) {
          console.error('❌ Error cargando categorías:', error);
          setCategories([]);
        }

        // Obtener ubicación
        let location: string | null = route.params?.selectedLocation || null;

        if (!location) {
          location = await AsyncStorage.getItem('@goldenbook_selected_location');

          if (!location) {
            return;
          }
        } else {
          console.log('📍 Ubicación desde params:', location);
        }

        setSelectedLocation(location);

        // Obtener datos de la ubicación
        try {
          const locationData = await getLocationById(location);

          if (locationData) {
            setLocationName(locationData.name);
            const normalizedId = normalizeLocationId(locationData.name || location);
            const localImage = getLocationImage(normalizedId, false);
            setBackgroundImage(localImage);
          } else {
            setLocationName(cityMapping[location] || location);
            const localImage = getLocationImage(location, false);
            setBackgroundImage(localImage);
          }
        } catch (error) {
          console.error('❌ Error obteniendo datos de ubicación:', error);
          setLocationName(cityMapping[location] || location);
          setBackgroundImage(getLocationImage('default', false));
        }

        // Obtener establecimientos
        try {
          const rawEstablishmentsData = await getEstablishments(location);
          
          // Normalizar establecimientos
          const allEstablishmentsData = rawEstablishmentsData.map(normalizeEstablishment);
          
          if (allEstablishmentsData.length > 0) {
            setAllEstablishments(allEstablishmentsData);

            // Obtener establecimientos destacados (featured)
            try {
              const rawFeatured = await getFeaturedEstablishments(location);
              
              if (rawFeatured.length > 0) {
                const featured = rawFeatured.map(normalizeEstablishment);
                setFeaturedEstablishments(featured);
              } else {
                // Fallback: filtrar localmente
                const localFeatured = allEstablishmentsData.filter(est => est.featured);
                setFeaturedEstablishments(localFeatured);
              }
            } catch (error) {
              console.error('❌ Error obteniendo destacados:', error);
              const localFeatured = allEstablishmentsData.filter(est => est.featured);
              setFeaturedEstablishments(localFeatured);
            }

            // Obtener establecimientos trending
            try {
              const rawTrending = await getTrendingEstablishments(location);
              
              if (rawTrending.length > 0) {
                const trending = rawTrending.map(normalizeEstablishment);
                setTrendingEstablishments(trending);
              } else {
                // Fallback: filtrar localmente
                const localTrending = allEstablishmentsData.filter(est => est.trending);
                setTrendingEstablishments(localTrending);
              }
            } catch (error) {
              console.error('❌ Error obteniendo trending:', error);
              const localTrending = allEstablishmentsData.filter(est => est.trending);
              setTrendingEstablishments(localTrending);
            }

          } else {
            // Limpiar arrays
            setAllEstablishments([]);
            setFeaturedEstablishments([]);
            setTrendingEstablishments([]);
          }

        } catch (error) {
          console.error('❌ Error crítico obteniendo establecimientos:', error);
          setAllEstablishments([]);
          setFeaturedEstablishments([]);
          setTrendingEstablishments([]);
        }

      } catch (error) {
        console.error('❌ Error crítico inicializando datos:', error);
        setBackgroundImage(getLocationImage('default', false));
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [route.params?.selectedLocation]);

  // Debug effect para monitorear cambios
  useEffect(() => {
    if (allEstablishments.length > 0) {
      const withImages = allEstablishments.filter(e => e.mainImage && e.mainImage.trim() !== '').length;
      const featuredCount = allEstablishments.filter(e => e.featured).length;
      const trendingCount = allEstablishments.filter(e => e.trending).length;
    }
  }, [selectedLocation, locationName, allEstablishments, featuredEstablishments, trendingEstablishments, loading]);

  return {
    selectedLocation,
    locationName,
    backgroundImage,
    categories,
    loading,
    allEstablishments,
    featuredEstablishments,
    trendingEstablishments,
    // ✅ AGREGAR: Función para refrescar establishments
    refreshEstablishments,
    // Removemos todos los otros arrays que no necesitamos
    recommendedEstablishments: [], 
    newEstablishments: [],
    popularEstablishments: [],
    topRatedEstablishments: []
  };
};