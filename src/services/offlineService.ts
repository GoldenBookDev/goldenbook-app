import AsyncStorage from '@react-native-async-storage/async-storage';
import { Establishment, Location } from './firestoreService';

// Claves para AsyncStorage
const CACHE_KEYS = {
  ESTABLISHMENTS: '@goldenbook_establishments',
  CATEGORIES: '@goldenbook_categories',
  LOCATIONS: '@goldenbook_locations',
  USER_FAVORITES: '@goldenbook_user_favorites',
  USER_LIKES: '@goldenbook_user_likes',
  LAST_SYNC: '@goldenbook_last_sync',
  CACHE_VERSION: '@goldenbook_cache_version'
};

// Versión del cache (incrementar cuando cambies la estructura)
const CACHE_VERSION = '1.0';

// Tiempo de expiración del cache (24 horas)
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

interface CacheData<T> {
  data: T;
  timestamp: number;
  version: string;
}

class OfflineService {
  private static instance: OfflineService;

  static getInstance(): OfflineService {
    if (!this.instance) {
      this.instance = new OfflineService();
    }
    return this.instance;
  }

  // =================== ESTABLISHMENTS ===================

  async cacheEstablishments(locationId: string, establishments: Establishment[]): Promise<void> {
    try {
      const cacheKey = `${CACHE_KEYS.ESTABLISHMENTS}_${locationId}`;
      const cacheData: CacheData<Establishment[]> = {
        data: establishments,
        timestamp: Date.now(),
        version: CACHE_VERSION
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('❌ Error caching establishments:', error);
    }
  }

  async getCachedEstablishments(locationId: string): Promise<Establishment[]> {
    try {
      const cacheKey = `${CACHE_KEYS.ESTABLISHMENTS}_${locationId}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (!cached) {
        return [];
      }

      const cacheData: CacheData<Establishment[]> = JSON.parse(cached);
      
      // Verificar versión y expiración
      if (this.isCacheExpired(cacheData) || cacheData.version !== CACHE_VERSION) {
        return [];
      }

      return cacheData.data;
    } catch (error) {
      console.error('❌ Error getting cached establishments:', error);
      return [];
    }
  }

  // =================== CATEGORIES ===================

  async cacheCategories(categories: any[]): Promise<void> {
    try {
      const cacheData: CacheData<any[]> = {
        data: categories,
        timestamp: Date.now(),
        version: CACHE_VERSION
      };

      await AsyncStorage.setItem(CACHE_KEYS.CATEGORIES, JSON.stringify(cacheData));
    } catch (error) {
      console.error('❌ Error caching categories:', error);
    }
  }

  async getCachedCategories(): Promise<any[]> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.CATEGORIES);
      
      if (!cached) {
        return [];
      }

      const cacheData: CacheData<any[]> = JSON.parse(cached);
      
      if (this.isCacheExpired(cacheData) || cacheData.version !== CACHE_VERSION) {
        return [];
      }

      return cacheData.data;
    } catch (error) {
      console.error('❌ Error getting cached categories:', error);
      return [];
    }
  }

  // =================== LOCATIONS ===================

  async cacheLocations(locations: Location[]): Promise<void> {
    try {
      const cacheData: CacheData<Location[]> = {
        data: locations,
        timestamp: Date.now(),
        version: CACHE_VERSION
      };

      await AsyncStorage.setItem(CACHE_KEYS.LOCATIONS, JSON.stringify(cacheData));
    } catch (error) {
      console.error('❌ Error caching locations:', error);
    }
  }

  async getCachedLocations(): Promise<Location[]> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.LOCATIONS);
      
      if (!cached) {
        return [];
      }

      const cacheData: CacheData<Location[]> = JSON.parse(cached);
      
      if (this.isCacheExpired(cacheData) || cacheData.version !== CACHE_VERSION) {
        return [];
      }
      return cacheData.data;
    } catch (error) {
      console.error('❌ Error getting cached locations:', error);
      return [];
    }
  }

  // =================== USER DATA ===================

  async cacheUserFavorites(userId: string, favorites: string[]): Promise<void> {
    try {
      const cacheKey = `${CACHE_KEYS.USER_FAVORITES}_${userId}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(favorites));
    } catch (error) {
      console.error('❌ Error caching user favorites:', error);
    }
  }

  async getCachedUserFavorites(userId: string): Promise<string[]> {
    try {
      const cacheKey = `${CACHE_KEYS.USER_FAVORITES}_${userId}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('❌ Error getting cached user favorites:', error);
      return [];
    }
  }

  async cacheUserLikes(userId: string, likes: string[]): Promise<void> {
    try {
      const cacheKey = `${CACHE_KEYS.USER_LIKES}_${userId}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(likes));
    } catch (error) {
      console.error('❌ Error caching user likes:', error);
    }
  }

  async getCachedUserLikes(userId: string): Promise<string[]> {
    try {
      const cacheKey = `${CACHE_KEYS.USER_LIKES}_${userId}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('❌ Error getting cached user likes:', error);
      return [];
    }
  }

  // =================== SEARCH ===================

  searchCachedEstablishments(
    establishments: Establishment[], 
    query: string
  ): Establishment[] {
    if (!query.trim()) return establishments;

    const searchTerm = query.toLowerCase().trim();
    
    return establishments.filter(establishment => {
      // Buscar en nombre
      if (establishment.name.toLowerCase().includes(searchTerm)) return true;
      
      // Buscar en descripción corta
      if (establishment.shortDescription?.toLowerCase().includes(searchTerm)) return true;
      
      // Buscar en categorías
      if (establishment.categories?.some(cat => cat.toLowerCase().includes(searchTerm))) return true;
      
      // Buscar en subcategorías
      if (establishment.subcategories?.some(sub => sub.toLowerCase().includes(searchTerm))) return true;
      
      // Buscar en dirección
      if (establishment.address?.toLowerCase().includes(searchTerm)) return true;
      
      return false;
    });
  }

  // =================== UTILITIES ===================

  private isCacheExpired(cacheData: CacheData<any>): boolean {
    return Date.now() - cacheData.timestamp > CACHE_EXPIRY;
  }

  async updateLastSync(): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString());
    } catch (error) {
      console.error('❌ Error updating last sync:', error);
    }
  }

  async getLastSync(): Promise<Date | null> {
    try {
      const lastSync = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
      return lastSync ? new Date(parseInt(lastSync)) : null;
    } catch (error) {
      console.error('❌ Error getting last sync:', error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    try {
      const keys = Object.values(CACHE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
    }
  }

  async getCacheStats(): Promise<{
    lastSync: Date | null;
    establishmentsCount: number;
    categoriesCount: number;
    locationsCount: number;
  }> {
    try {
      const lastSync = await this.getLastSync();
      const establishments = await this.getCachedEstablishments('lisboa'); // Example
      const categories = await this.getCachedCategories();
      const locations = await this.getCachedLocations();

      return {
        lastSync,
        establishmentsCount: establishments.length,
        categoriesCount: categories.length,
        locationsCount: locations.length
      };
    } catch (error) {
      console.error('❌ Error getting cache stats:', error);
      return {
        lastSync: null,
        establishmentsCount: 0,
        categoriesCount: 0,
        locationsCount: 0
      };
    }
  }
}

export default OfflineService;