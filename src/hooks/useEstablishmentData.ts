import { useEffect, useState } from 'react';
import { getEstablishmentById } from '../services/firestoreService';
import { useEstablishmentTranslation } from './useTranslation';

export const useEstablishmentData = (establishmentId: string) => {
  const [rawEstablishment, setRawEstablishment] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Usar tu hook de traducción existente
  const establishment = useEstablishmentTranslation(rawEstablishment);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getEstablishmentById(establishmentId);
        setRawEstablishment(data);
      } catch (error) {
        console.error('Error fetching establishment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [establishmentId]);

  return {
    establishment,
    loading,
    setRawEstablishment
  };
};