import { useCallback, useEffect, useState } from 'react';
import {
  Establishment,
  getCategoryById,
  getEstablishments,
  getLocationById
} from '../services/firestoreService';

interface SubcategoryData {
  id: string;
  title: string;
}

export const useCategoryData = (categoryId: string, selectedLocation: string) => {
  const [loading, setLoading] = useState(true);
  const [subcategories, setSubcategories] = useState<SubcategoryData[]>([]);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0); // ✅ Trigger para refresh manual

  // ✅ Función de carga de datos reutilizable
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Get location name
      const locationData = await getLocationById(selectedLocation);
      if (locationData) {
        setLocationName(locationData.name);
      }

      // Get category data
      const categoryData = await getCategoryById(categoryId);
      if (!categoryData) {
        setError('Category not found');
        return;
      }

      // ========== PROCESAR SUBCATEGORÍAS CON NUEVA ESTRUCTURA ==========
      let subcategoryArray: SubcategoryData[] = [];
      
      if (categoryData.subcategories) {
        if (Array.isArray(categoryData.subcategories)) {
          // ✅ NUEVA ESTRUCTURA: Array de claves ['experiences', 'hotels', ...]
          subcategoryArray = categoryData.subcategories.map((key: string) => ({
            id: key,
            title: key // El título se traducirá en el componente
          }));
        } else if (typeof categoryData.subcategories === 'object') {
          // 🔄 ESTRUCTURA VIEJA: Objeto {'experiences': 'Experiences', ...}
          subcategoryArray = Object.entries(categoryData.subcategories).map(([key, title]) => ({
            id: key,
            title: String(title)
          }));
        }
      }
      
      setSubcategories(subcategoryArray);

      // Get establishments for this category
      const allEstablishments = await getEstablishments(selectedLocation, categoryId);
      const filteredEstablishments = allEstablishments.filter(est =>
        est.categories && est.categories.includes(categoryId)
      );

      if (filteredEstablishments.length !== allEstablishments.length) {
        console.warn(`⚠️ Warning: ${allEstablishments.length - filteredEstablishments.length} establishments were filtered out.`);
      }

      setEstablishments(filteredEstablishments);
      
    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [categoryId, selectedLocation]);

  // ✅ Efecto principal que se ejecuta al montar y cuando cambian las dependencias
  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]); // ✅ Agregar refreshTrigger como dependencia

  // ✅ Función pública para refresh manual
  const refreshData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const updateEstablishmentReviewCount = (establishmentId: string, increment: number) => {
    setEstablishments(prevEstablishments =>
      prevEstablishments.map(est =>
        est.id === establishmentId
          ? { ...est, reviewCount: Math.max(0, (est.reviewCount || 0) + increment) }
          : est
      )
    );
  };

  return {
    loading,
    subcategories,
    establishments,
    error,
    locationName,
    updateEstablishmentReviewCount,
    refreshData // ✅ Exponer función de refresh
  };
};