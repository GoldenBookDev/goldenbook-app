import { useState } from 'react';
import { Establishment } from '../services/firestoreService';
import { searchEstablishmentsByName } from '../utils/searchUtils';

export const useSearch = (
  allEstablishments: Establishment[], 
  navigation: any, 
  selectedLocation: string | null
) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Establishment[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);

    if (text.trim() === '') {
      setSearchResults([]);
      return;
    }

    // Usar tu función existente de searchUtils
    const results = searchEstablishmentsByName(allEstablishments, text);
    setSearchResults(results);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 200);
  };

  const handleSelectEstablishment = (establishmentId: string) => {
    navigation.navigate('EstablishmentScreen', { establishmentId });

    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
  };

  const handleShowAllResults = () => {
    if (searchQuery.trim() !== '') {
      navigation.navigate('SearchResults', {
        query: searchQuery,
        selectedLocation: selectedLocation || ''
      });

      setSearchQuery('');
      setSearchResults([]);
      setIsSearchFocused(false);
    }
  };

  return {
    searchQuery,
    searchResults,
    isSearchFocused,
    handleSearchChange,
    handleSearchFocus,
    handleSearchBlur,
    handleSelectEstablishment,
    handleShowAllResults
  };
};
