import { useEffect, useState } from 'react';
import { Establishment } from '../services/firestoreService';

export const useCategoryFilters = (establishments: Establishment[]) => {
  const [filteredEstablishments, setFilteredEstablishments] = useState<Establishment[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>(''); // ✅ Sin filtro por defecto

  useEffect(() => {
    
    let filtered = [...establishments];

    // Apply subcategory filter
    if (selectedSubcategory) {
      const beforeSubcategory = filtered.length;
      filtered = filtered.filter(establishment => {
        const hasSubcategory = establishment.subcategories?.includes(selectedSubcategory);
        return hasSubcategory;
      });
    }

    // ✅ Solo aplicar sorting si hay un filtro seleccionado
    if (selectedFilter && selectedFilter !== '') {
      
      // Apply sorting based on selected filter
      switch (selectedFilter) {
        case 'recommended':
          // ✅ Lógica de recomendación mejorada basada en múltiples factores
          filtered.sort((a, b) => {
            // Prioridad 1: Featured establishments primero
            if (a.featured !== b.featured) {
              return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
            }
            
            // Prioridad 2: Trending establishments
            if (a.trending !== b.trending) {
              return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
            }
            
            // Prioridad 3: Establishments con más favoritos
            const favA = a.stats?.favoriteCount || 0;
            const favB = b.stats?.favoriteCount || 0;
            if (favA !== favB) {
              return favB - favA;
            }
            
            // Prioridad 4: Establishments con más reviews
            const reviewA = a.reviewCount || 0;
            const reviewB = b.reviewCount || 0;
            if (reviewA !== reviewB) {
              return reviewB - reviewA;
            }
            
            // Prioridad 5: Alfabético como último criterio
            return a.name.localeCompare(b.name);
          });
    
          break;

        case 'open_now':
          // ✅ Filtrar por horarios de apertura
          filtered = filtered.filter(establishment => {
            const openingHours = establishment.openingHours;
            if (!openingHours) return false;
            
            // Lógica simple: si no dice "Fechado" para hoy, considerarlo abierto
            // TODO: Implementar parsing completo de horarios
            return !openingHours.toLowerCase().includes('fechado');
          });
          break;

        case 'near_me':
          // ✅ Este caso se manejará externamente en CategoryScreen
          console.log('📍 Near me filter will be applied externally');
          break;

        case 'most_liked':
          filtered.sort((a, b) => {
            // Prioridad 1: reviewCount (likes)
            const likesA = a.reviewCount || 0;
            const likesB = b.reviewCount || 0;
            if (likesA !== likesB) {
              return likesB - likesA;
            }
            
            // Prioridad 2: favoriteCount si reviewCount es igual
            const favA = a.stats?.favoriteCount || 0;
            const favB = b.stats?.favoriteCount || 0;
            if (favA !== favB) {
              return favB - favA;
            }
            
            // Prioridad 3: Alfabético
            return a.name.localeCompare(b.name);
          });
          break;

        default:
      }
      
    } 

    setFilteredEstablishments(filtered);
  }, [selectedSubcategory, selectedFilter, establishments]);

  return {
    filteredEstablishments,
    selectedSubcategory,
    selectedFilter,
    setSelectedSubcategory,
    setSelectedFilter
  };
};