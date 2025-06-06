import { useEffect, useState } from 'react';
import { Establishment } from '../services/firestoreService';

export const useCategoryFilters = (establishments: Establishment[]) => {
  const [filteredEstablishments, setFilteredEstablishments] = useState<Establishment[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('recommended');

  useEffect(() => {
    let filtered = [...establishments];

    // Apply subcategory filter
    if (selectedSubcategory) {
      filtered = filtered.filter(establishment =>
        establishment.subcategories?.includes(selectedSubcategory)
      );
    }

    // Apply sorting based on selected filter
    switch (selectedFilter) {
      case 'recommended':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'open_now':
        // TODO: Implement "open now" logic
        break;
      case 'near_me':
        // TODO: Implement "near me" logic
        break;
      case 'most_liked':
        filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
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