import { useState } from 'react';
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

  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
    
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
      console.log(`🔍 Search "${query}" found ${sortedResults.length} results`);
    } catch (error) {
      console.error('❌ Error searching:', error);
      
      // Fallback to local search in current establishments
      const localResults = localSearch(establishments, query);
      setSearchResults(localResults);
    } finally {
      setIsSearching(false);
    }
  };

  // Local search fallback
  const localSearch = (establishments: Establishment[], query: string): SearchResult[] => {
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
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    // Delay to allow tap on results
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 150);
  };

  const handleSelectEstablishment = (establishment: Establishment) => {
    navigation.navigate('EstablishmentScreen', {
      establishmentId: establishment.id
    });
    
    // Clear search
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
  };

  const handleShowAllResults = () => {
    // You can implement a dedicated search results screen here
    console.log('Show all search results');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
  };

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