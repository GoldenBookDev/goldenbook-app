import { useCallback, useEffect, useRef, useState } from 'react';
import { Establishment, searchEstablishments } from '../services/firestoreService';

interface SearchResult extends Establishment {
  searchScore?: number;
}

export const useCategorySearch = (
  establishments: Establishment[],
  navigation: any,
  selectedLocation: string,
  categoryId: string
) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // ✅ AGREGAR: Ref para el timeout de debouncing
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ MEMOIZAR: Función de búsqueda local
  const localSearch = useCallback((establishments: Establishment[], query: string): SearchResult[] => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    
    return establishments.filter(establishment => {
      return (
        establishment.name.toLowerCase().includes(searchTerm) ||
        establishment.shortDescription?.toLowerCase().includes(searchTerm) ||
        establishment.address?.toLowerCase().includes(searchTerm) ||
        establishment.categories?.some(cat => cat.toLowerCase().includes(searchTerm)) ||
        establishment.subcategories?.some(sub => sub.toLowerCase().includes(searchTerm))
      );
    }).map(est => ({ ...est, searchScore: 1 }));
  }, []);

  // ✅ MEMOIZAR: Función de búsqueda remota
  const performSearch = useCallback(async (query: string) => {
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      
      // Use the offline-capable search from firestoreService
      const results = await searchEstablishments(selectedLocation, query, categoryId);
      
      // Add search score for better relevance
      const scoredResults = results.map(establishment => {
        let score = 0;
        const searchTerm = query.toLowerCase();
        
        // Higher score for name matches
        if (establishment.name.toLowerCase().includes(searchTerm)) {
          score += 3;
        }
        
        // Medium score for description matches
        if (establishment.shortDescription?.toLowerCase().includes(searchTerm)) {
          score += 2;
        }
        
        // Lower score for address matches
        if (establishment.address?.toLowerCase().includes(searchTerm)) {
          score += 1;
        }
        
        return {
          ...establishment,
          searchScore: score
        };
      });
      
      // Sort by relevance score
      const sortedResults = scoredResults.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0));
      
      setSearchResults(sortedResults);
    } catch (error) {
      console.error('❌ Error searching:', error);
      
      // Fallback to local search in current establishments
      const localResults = localSearch(establishments, query);
      setSearchResults(localResults);
    } finally {
      setIsSearching(false);
    }
  }, [selectedLocation, categoryId, establishments, localSearch]);

  // ✅ CORREGIR: Función de cambio de búsqueda con debouncing
  const handleSearchChange = useCallback((query: string) => {
    // ✅ Actualizar inmediatamente el query (para UI responsiva)
    setSearchQuery(query);
    
    // ✅ Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // ✅ Si el query está vacío, limpiar resultados inmediatamente
    if (query.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // ✅ Primero, búsqueda local instantánea para feedback inmediato
    const localResults = localSearch(establishments, query);
    setSearchResults(localResults);

    // ✅ Luego, búsqueda remota con debouncing
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300); // ✅ 300ms de delay para evitar llamadas excesivas
  }, [establishments, localSearch, performSearch]);

  // ✅ MEMOIZAR: Funciones de foco
  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    // Delay to allow tap on results
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 150);
  }, []);

  const handleSelectEstablishment = useCallback((establishment: Establishment) => {
    navigation.navigate('EstablishmentScreen', {
      establishmentId: establishment.id
    });
    
    // Clear search
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
  }, [navigation]);

  const handleShowAllResults = useCallback(() => {
    // You can implement a dedicated search results screen here
    console.log('Show all search results');
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
    
    // ✅ Limpiar timeout si existe
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  // ✅ CLEANUP: Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    searchQuery,
    searchResults,
    isSearchFocused,
    isSearching,
    handleSearchChange,
    handleSearchFocus,
    handleSearchBlur,
    handleSelectEstablishment,
    handleShowAllResults,
    clearSearch
  };
};