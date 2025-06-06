import { useState } from 'react';
import { Keyboard } from 'react-native';
import { Establishment } from '../services/firestoreService';

export const useCategorySearch = (
  establishments: Establishment[], 
  navigation: any, 
  selectedLocation: string,
  categoryId: string
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

    const results = establishments.filter(establishment => {
      const name = establishment.name || '';
      return name.toLowerCase().includes(text.toLowerCase().trim());
    });

    console.log(`Búsqueda "${text}" encontró ${results.length} resultados en la categoría ${categoryId}`);

    const validResults = results.filter(item =>
      item.categories && item.categories.includes(categoryId)
    );

    if (validResults.length !== results.length) {
      console.warn(`Se han filtrado ${results.length - validResults.length} establecimientos que no pertenecen a la categoría ${categoryId}`);
    }

    setSearchResults(validResults);
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
    Keyboard.dismiss();
    navigation.navigate('EstablishmentScreen', { establishmentId });
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
  };

  const handleShowAllResults = () => {
    Keyboard.dismiss();

    if (searchQuery.trim() !== '') {
      navigation.navigate('SearchResults', {
        query: searchQuery,
        selectedLocation: selectedLocation,
        categoryId: categoryId
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