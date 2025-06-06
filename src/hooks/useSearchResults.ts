import { useEffect, useState } from 'react';
import { Establishment, getEstablishments, getLocationById } from '../services/firestoreService';
import { sortEstablishments } from '../utils/searchUtils';

export const useSearchResults = (
  query: string, 
  selectedLocation: string, 
  categoryId?: string
) => {
  const [searchQuery, setSearchQuery] = useState<string>(query || '');
  const [searchResults, setSearchResults] = useState<Establishment[]>([]);
  const [allEstablishments, setAllEstablishments] = useState<Establishment[]>([]);
  const [locationName, setLocationName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('recommended');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const locationData = await getLocationById(selectedLocation);
        if (locationData) {
          setLocationName(locationData.name);
        }

        let establishments;
        if (categoryId) {
          establishments = await getEstablishments(selectedLocation, categoryId);
        } else {
          establishments = await getEstablishments(selectedLocation);
        }
        
        setAllEstablishments(establishments);
        
        if (query) {
          const filteredResults = establishments.filter(est => {
            const name = est.name || '';
            return name.toLowerCase().includes(query.toLowerCase().trim());
          });
          setSearchResults(filteredResults);
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedLocation, categoryId, query]);

  useEffect(() => {
    const sortedResults = sortEstablishments([...searchResults], selectedFilter);
    setSearchResults(sortedResults);
  }, [selectedFilter]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    
    if (text.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const results = allEstablishments.filter(establishment => {
      const name = establishment.name || '';
      return name.toLowerCase().includes(text.toLowerCase().trim());
    });
    
    setSearchResults(results);
  };

  const updateEstablishmentReviewCount = (establishmentId: string, increment: number) => {
    setSearchResults(prevResults =>
      prevResults.map(est =>
        est.id === establishmentId
          ? { ...est, reviewCount: Math.max(0, (est.reviewCount || 0) + increment) }
          : est
      )
    );
  };

  return {
    searchQuery,
    searchResults,
    locationName,
    loading,
    selectedFilter,
    setSelectedFilter,
    handleSearchChange,
    updateEstablishmentReviewCount
  };
};