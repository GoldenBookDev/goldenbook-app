import { useEffect, useState } from 'react';
import {
  Establishment,
  Location,
  getCacheStats,
  getCategories,
  getEstablishments,
  getFeaturedEstablishments,
  getLastSync,
  getLocations,
  getTrendingEstablishments,
  searchEstablishments
} from '../services/firestoreService';
import { useNetworkStatus } from './useNetworkStatus';

export interface OfflineDataState {
  // Connection status
  isConnected: boolean;
  isLoading: boolean;
  lastSync: Date | null;
  
  // Data
  locations: Location[];
  categories: any[];
  establishments: Establishment[];
  
  // Cache stats
  cacheStats: {
    establishmentsCount: number;
    categoriesCount: number;
    locationsCount: number;
  };
  
  // Functions
  loadEstablishments: (locationId: string, categoryId?: string) => Promise<void>;
  loadFeaturedEstablishments: (locationId: string) => Promise<void>;
  loadTrendingEstablishments: (locationId: string) => Promise<void>;
  searchEstablishments: (locationId: string, query: string, categoryId?: string) => Promise<Establishment[]>;
  refreshData: () => Promise<void>;
  getCacheInfo: () => Promise<void>;
}

export const useOfflineData = (): OfflineDataState => {
  const { isConnected } = useNetworkStatus();
  
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [cacheStats, setCacheStats] = useState({
    establishmentsCount: 0,
    categoriesCount: 0,
    locationsCount: 0
  });

  // Initialize data on mount
  useEffect(() => {
    initializeData();
  }, []);

  // Update lastSync when connection changes
  useEffect(() => {
    if (isConnected) {
      updateLastSync();
    }
  }, [isConnected]);

  const initializeData = async () => {
    try {
      setIsLoading(true);

      // Load basic data
      await Promise.all([
        loadLocationsData(),
        loadCategoriesData(),
        updateCacheStats(),
        updateLastSync()
      ]);

    } catch (error) {
      console.error('❌ Error initializing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocationsData = async () => {
    try {
      const locationsData = await getLocations();
      setLocations(locationsData);
    } catch (error) {
      console.error('❌ Error loading locations:', error);
    }
  };

  const loadCategoriesData = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('❌ Error loading categories:', error);
    }
  };

  const loadEstablishments = async (locationId: string, categoryId?: string) => {
    try {
      setIsLoading(true);
      
      const establishmentsData = await getEstablishments(locationId, categoryId);
      setEstablishments(establishmentsData);
      await updateCacheStats();
    } catch (error) {
      console.error('❌ Error loading establishments:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadFeaturedEstablishments = async (locationId: string) => {
    try {
      setIsLoading(true);
      const featuredData = await getFeaturedEstablishments(locationId);
      setEstablishments(featuredData);
      
    } catch (error) {
      console.error('❌ Error loading featured establishments:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingEstablishments = async (locationId: string) => {
    try {
      setIsLoading(true);
      
      const trendingData = await getTrendingEstablishments(locationId);
      setEstablishments(trendingData);
  
    } catch (error) {
      console.error('❌ Error loading trending establishments:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const searchEstablishmentsData = async (
    locationId: string, 
    query: string, 
    categoryId?: string
  ): Promise<Establishment[]> => {
    try {
      
      const searchResults = await searchEstablishments(locationId, query, categoryId);
      
      return searchResults;
    } catch (error) {
      console.error('❌ Error searching establishments:', error);
      return [];
    }
  };

  const refreshData = async () => {
    try {
      setIsLoading(true);
      
      if (isConnected) {
        await Promise.all([
          loadLocationsData(),
          loadCategoriesData()
        ]);

      } else {
        console.log('📱 Offline - using cached data');
      }
      
      await updateCacheStats();
      await updateLastSync();
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCacheStats = async () => {
    try {
      const stats = await getCacheStats();
      setCacheStats({
        establishmentsCount: stats.establishmentsCount,
        categoriesCount: stats.categoriesCount,
        locationsCount: stats.locationsCount
      });
    } catch (error) {
      console.error('❌ Error updating cache stats:', error);
    }
  };

  const updateLastSync = async () => {
    try {
      const lastSyncTime = await getLastSync();
      setLastSync(lastSyncTime);
    } catch (error) {
      console.error('❌ Error updating last sync:', error);
    }
  };

  const getCacheInfo = async () => {
    await Promise.all([
      updateCacheStats(),
      updateLastSync()
    ]);
  };

  return {
    // Connection status
    isConnected,
    isLoading,
    lastSync,
    
    // Data
    locations,
    categories,
    establishments,
    cacheStats,
    
    // Functions
    loadEstablishments,
    loadFeaturedEstablishments: loadFeaturedEstablishments,
    loadTrendingEstablishments: loadTrendingEstablishments,
    searchEstablishments: searchEstablishmentsData,
    refreshData,
    getCacheInfo
  };
};