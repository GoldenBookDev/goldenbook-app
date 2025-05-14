import { Establishment } from '../services/firestoreService';

/**
 * Filter establishments based on search query (only by name)
 * @param establishments Array of establishments to filter
 * @param query Search query string
 * @param categoryId Optional category ID to filter by
 * @returns Filtered array of establishments
 */
export const searchEstablishmentsByName = (
  establishments: Establishment[],
  query: string,
  categoryId?: string
): Establishment[] => {
  if (!query || query.trim() === '') {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  
  let filtered = establishments.filter(establishment => {
    // Filter by name
    const name = establishment.name || '';
    return name.toLowerCase().includes(normalizedQuery);
  });
  
  // If categoryId is provided, also filter by category
  if (categoryId) {
    filtered = filtered.filter(establishment => 
      establishment.categories?.includes(categoryId)
    );
  }
  
  return filtered;
};

/**
 * Filter establishments based on category
 * @param establishments Array of establishments to filter
 * @param categoryId Category ID to filter by
 * @returns Filtered array of establishments
 */
export const filterByCategory = (
  establishments: Establishment[],
  categoryId: string
): Establishment[] => {
  if (!categoryId) {
    return establishments;
  }
  
  return establishments.filter(establishment => 
    establishment.categories?.includes(categoryId)
  );
};

/**
 * Filter establishments based on subcategory
 * @param establishments Array of establishments to filter
 * @param subcategoryId Subcategory ID to filter by
 * @returns Filtered array of establishments
 */
export const filterBySubcategory = (
  establishments: Establishment[],
  subcategoryId: string | null
): Establishment[] => {
  if (!subcategoryId) {
    return establishments;
  }
  
  return establishments.filter(establishment => 
    establishment.subcategories?.includes(subcategoryId)
  );
};

/**
 * Sort establishments based on filter type
 * @param establishments Array of establishments to sort
 * @param filterType Filter type to apply (recommended, most_liked, etc.)
 * @param userLocation Optional user location for distance calculation
 * @returns Sorted array of establishments
 */
export const sortEstablishments = (
  establishments: Establishment[],
  filterType: string,
  userLocation?: { latitude: number; longitude: number }
): Establishment[] => {
  const sorted = [...establishments];
  
  switch (filterType) {
    case 'recommended':
      // Sort by rating (highest first)
      return sorted.sort((a, b) => b.rating - a.rating);
      
    case 'open_now':
      // TODO: Implement open now logic based on current time and opening hours
      // This would require parsing opening hours format
      return sorted;
      
    case 'near_me':
      if (userLocation) {
        // Sort by distance (requires coordinates for each establishment)
        return sorted.sort((a, b) => {
          if (!a.coordinates || !b.coordinates) return 0;
          
          const distanceA = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            a.coordinates.latitude,
            a.coordinates.longitude
          );
          
          const distanceB = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            b.coordinates.latitude,
            b.coordinates.longitude
          );
          
          return distanceA - distanceB;
        });
      }
      return sorted;
      
    case 'most_liked':
      // Sort by number of reviews/likes
      return sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      
    default:
      return sorted;
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};