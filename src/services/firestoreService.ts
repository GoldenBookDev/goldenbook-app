import * as Network from 'expo-network';
import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import OfflineService from './offlineService';

// Interfaces (mantener las existentes)
export interface Location {
  id: string;
  name: string;
  image: string;
  imageVersions?: {
    thumbnail: string;
    medium: string;
    original: string;
  };
  country?: string;
  featured?: boolean;
}

export interface Establishment {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  mainImage: string;
  gallery: string[];
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  reservationLink: string;
  openingHours: string;
  categories: string[];
  subcategories: string[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  trending: boolean;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  createdAt?: any;
  createdBy?: string;
  lastModifiedAt?: any;
  lastModifiedBy?: string;
  migratedAt?: any;
  migrationSource?: string;
  stats?: {
    favoriteCount: number;
  };
  subscriptionValue?: number;
  translations?: {
    categories?: {
      en?: string[];
      pt?: string[];
    };
    shortDescription?: {
      en?: string;
      pt?: string;
    };
    fullDescription?: {
      en?: string;
      pt?: string;
    };
    openingHours?: {
      en?: string;
      pt?: string;
    };
    subcategories?: {
      en?: string[];
      pt?: string[];
    };
  };
  version?: number;
}

export interface EstablishmentStats {
  favoriteCount: number;
}

export interface EstablishmentTranslations {
  categories?: {
    en?: string[];
    pt?: string[];
  };
  shortDescription?: {
    en?: string;
    pt?: string;
  };
  fullDescription?: {
    en?: string;
    pt?: string;
  };
  openingHours?: {
    en?: string;
    pt?: string;
  };
  subcategories?: {
    en?: string[];
    pt?: string[];
  };
}

export interface EstablishmentComplete {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  mainImage: string;
  gallery: string[];
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  reservationLink: string;
  openingHours: string;
  categories: string[];
  subcategories: string[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  trending: boolean;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  createdAt?: any;
  createdBy?: string;
  lastModifiedAt?: any;
  lastModifiedBy?: string;
  migratedAt?: any;
  migrationSource?: string;
  stats?: EstablishmentStats;
  subscriptionValue?: number;
  translations?: EstablishmentTranslations;
  version?: number;
}

// Mapeo de IDs de ubicación a nombres de ciudad
const locationToCityMapping: { [key: string]: string } = {
  'madeira': 'Madeira',
  'lisboa': 'Lisboa', 
  'porto': 'Porto',
  'algarve': 'Algarve'
};

// Instancia del servicio offline
const offlineService = OfflineService.getInstance();

// =================== UTILITY FUNCTIONS ===================

const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return networkState.isConnected ?? false;
  } catch (error) {
    console.error('❌ Error checking network:', error);
    return false;
  }
};

// =================== LOCATIONS (con cache) ===================

export const getLocations = async (): Promise<Location[]> => {
  try {
    const isConnected = await checkNetworkConnection();
    
    if (isConnected) {
      
      const locationsRef = collection(db, 'locations');
      const q = query(locationsRef, orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const locations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        image: doc.data().image,
        country: doc.data().country,
        featured: doc.data().featured,
      }));

      // Cache the fresh data
      await offlineService.cacheLocations(locations);
      
      return locations;
    } else {
      const cachedLocations = await offlineService.getCachedLocations();
      
      if (cachedLocations.length > 0) {
        return cachedLocations;
      } else {
        throw new Error('No internet connection and no cached data available');
      }
    }
  } catch (error) {
    console.error('❌ Error in getLocations:', error);
    
    // Try cache as fallback
    const cachedLocations = await offlineService.getCachedLocations();
    if (cachedLocations.length > 0) {
      return cachedLocations;
    }
    
    throw error;
  }
};

export const getLocationById = async (locationId: string): Promise<Location | null> => {
  try {
    const isConnected = await checkNetworkConnection();
    
    if (isConnected) {
      
      const locationRef = doc(db, 'locations', locationId);
      const locationSnapshot = await getDoc(locationRef);
      
      if (locationSnapshot.exists()) {
        const location = {
          id: locationSnapshot.id,
          name: locationSnapshot.data().name,
          image: locationSnapshot.data().image,
          country: locationSnapshot.data().country,
          featured: locationSnapshot.data().featured,
        };
        
        return location;
      }
      return null;
    } else {
      
      const cachedLocations = await offlineService.getCachedLocations();
      const location = cachedLocations.find(loc => loc.id === locationId);
      
      if (location) {
        return location;
      } else {
        return null;
      }
    }
  } catch (error) {
    console.error(`❌ Error fetching location ${locationId}:`, error);
    
    // Try cache as fallback
    const cachedLocations = await offlineService.getCachedLocations();
    const location = cachedLocations.find(loc => loc.id === locationId);
    return location || null;
  }
};

// =================== ESTABLISHMENTS (con cache) ===================

export const getEstablishments = async (locationId: string, categoryId?: string): Promise<Establishment[]> => {
  try {
    const isConnected = await checkNetworkConnection();
    const cityName = locationToCityMapping[locationId] || locationId;
    
    if (isConnected) {
      
      const establishmentsRef = collection(db, 'establishments');
      const q = query(
        establishmentsRef, 
        where('city', '==', cityName)
      );
      
      const querySnapshot = await getDocs(q);
      
      let establishments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Establishment));
      
      // Filter by category if specified
      if (categoryId) {
        establishments = establishments.filter(est => 
          est.categories && est.categories.includes(categoryId)
        );
      }
      
      // Sort by rating
      establishments = establishments.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      
      // Cache the fresh data
      await offlineService.cacheEstablishments(locationId, establishments);
      
      return establishments;
    } else {
      
      let cachedEstablishments = await offlineService.getCachedEstablishments(locationId);
      
      // Filter by category if specified
      if (categoryId && cachedEstablishments.length > 0) {
        cachedEstablishments = cachedEstablishments.filter(est => 
          est.categories && est.categories.includes(categoryId)
        );
      } else if (cachedEstablishments.length > 0) {
      }
      
      if (cachedEstablishments.length === 0) {
        throw new Error('No internet connection and no cached data available');
      }
      
      return cachedEstablishments;
    }
  } catch (error) {
    console.error('❌ Error in getEstablishments:', error);
    
    // Try cache as fallback
    const cachedEstablishments = await offlineService.getCachedEstablishments(locationId);
    if (cachedEstablishments.length > 0) {
      
      if (categoryId) {
        return cachedEstablishments.filter(est => 
          est.categories && est.categories.includes(categoryId)
        );
      }
      return cachedEstablishments;
    }
    
    throw error;
  }
};

export const getFeaturedEstablishments = async (locationId: string): Promise<Establishment[]> => {
  try {
    const allEstablishments = await getEstablishments(locationId);
    
    const featured = allEstablishments
      .filter(est => est.featured === true)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6);
      
    return featured;
  } catch (error) {
    console.error('❌ Error fetching featured establishments:', error);
    throw error;
  }
};

export const getTrendingEstablishments = async (locationId: string): Promise<Establishment[]> => {
  try {
    const allEstablishments = await getEstablishments(locationId);
    
    const trending = allEstablishments
      .filter(est => est.trending === true)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6);
      
    return trending;
  } catch (error) {
    console.error('❌ Error fetching trending establishments:', error);
    throw error;
  }
};

export const getEstablishmentById = async (establishmentId: string): Promise<Establishment | null> => {
  try {
    const isConnected = await checkNetworkConnection();
    
    if (isConnected) {

      const establishmentRef = doc(db, 'establishments', establishmentId);
      const establishmentSnapshot = await getDoc(establishmentRef);
      
      if (establishmentSnapshot.exists()) {
        const establishment = {
          id: establishmentSnapshot.id,
          ...establishmentSnapshot.data()
        } as Establishment;
        
        return establishment;
      }
      return null;
    } else {
      
      // Search in all cached locations
      const locations = ['lisboa', 'porto', 'madeira', 'algarve'];
      
      for (const locationId of locations) {
        const cachedEstablishments = await offlineService.getCachedEstablishments(locationId);
        const establishment = cachedEstablishments.find(est => est.id === establishmentId);
        
        if (establishment) {
          return establishment;
        }
      }
      
      return null;
    }
  } catch (error) {
    console.error(`❌ Error fetching establishment ${establishmentId}:`, error);
    return null;
  }
};

// =================== CATEGORIES (con cache) ===================

export const getCategories = async (): Promise<any[]> => {
  try {
    const isConnected = await checkNetworkConnection();
    
    if (isConnected) {
      
      const categoriesRef = collection(db, 'categories');
      const querySnapshot = await getDocs(categoriesRef);
      
      const categories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Cache the fresh data
      await offlineService.cacheCategories(categories);
      
      return categories;
    } else {
      
      const cachedCategories = await offlineService.getCachedCategories();
      
      if (cachedCategories.length > 0) {
        return cachedCategories;
      } else {
        throw new Error('No internet connection and no cached data available');
      }
    }
  } catch (error) {
    console.error('❌ Error in getCategories:', error);
    
    // Try cache as fallback
    const cachedCategories = await offlineService.getCachedCategories();
    if (cachedCategories.length > 0) {
      return cachedCategories;
    }
    
    throw error;
  }
};

export const getCategoryById = async (categoryId: string): Promise<any> => {
  try {
    const isConnected = await checkNetworkConnection();
    
    if (isConnected) {
      
      const categoryRef = doc(db, 'categories', categoryId);
      const categorySnapshot = await getDoc(categoryRef);
      
      if (categorySnapshot.exists()) {
        const category = {
          id: categorySnapshot.id,
          ...categorySnapshot.data()
        };
        return category;
      }
      return null;
    } else {
      
      const cachedCategories = await offlineService.getCachedCategories();
      const category = cachedCategories.find(cat => cat.id === categoryId);
      
      if (category) {
        return category;
      } else {
        return null;
      }
    }
  } catch (error) {
    console.error(`❌ Error fetching category ${categoryId}:`, error);
    
    // Try cache as fallback
    const cachedCategories = await offlineService.getCachedCategories();
    const category = cachedCategories.find(cat => cat.id === categoryId);
    return category || null;
  }
};

// =================== SEARCH OFFLINE ===================

export const searchEstablishments = async (
  locationId: string, 
  query: string,
  categoryId?: string
): Promise<Establishment[]> => {
  try {
    // Get establishments (this will use cache if offline)
    const establishments = await getEstablishments(locationId, categoryId);
    
    // Use offline search
    const searchResults = offlineService.searchCachedEstablishments(establishments, query);
    
    console.log(`🔍 Search for "${query}" found ${searchResults.length} results`);
    return searchResults;
  } catch (error) {
    console.error('❌ Error in search:', error);
    return [];
  }
};

// =================== CACHE MANAGEMENT ===================

export const getCacheStats = async () => {
  return await offlineService.getCacheStats();
};

export const clearCache = async (): Promise<void> => {
  await offlineService.clearCache();
};

export const getLastSync = async (): Promise<Date | null> => {
  return await offlineService.getLastSync();
};