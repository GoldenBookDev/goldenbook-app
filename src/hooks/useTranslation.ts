// hooks/useTranslation.ts
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import i18n from '../i18n';
import { TranslationService } from '../services/translationService';

/**
 * Hook para traducir un establishment individual
 */
export const useEstablishmentTranslation = (establishment: any) => {
  const [localizedEstablishment, setLocalizedEstablishment] = useState(establishment);

  useFocusEffect(
    React.useCallback(() => {
      if (establishment) {
        const localized = TranslationService.getLocalizedEstablishment(establishment);
        setLocalizedEstablishment(localized);
      }
    }, [establishment, i18n.locale])
  );

  useEffect(() => {
    const handleLanguageChange = () => {
      if (establishment) {
        const localized = TranslationService.getLocalizedEstablishment(establishment);
        setLocalizedEstablishment(localized);
      }
    };

    // Para i18n-js, necesitamos escuchar cambios manualmente o usar un listener personalizado
    // Como i18n-js no tiene eventos built-in, este efecto se ejecutará cuando cambie el locale
    if (establishment) {
      const localized = TranslationService.getLocalizedEstablishment(establishment);
      setLocalizedEstablishment(localized);
    }
  }, [establishment, i18n.locale]);

  return localizedEstablishment;
};

/**
 * Hook para traducir una lista de establishments
 */
export const useEstablishmentsTranslation = (establishments: any[]) => {
  const [localizedEstablishments, setLocalizedEstablishments] = useState(establishments);

  useFocusEffect(
    React.useCallback(() => {
      if (establishments && establishments.length > 0) {
        const localized = TranslationService.getLocalizedEstablishments(establishments);
        setLocalizedEstablishments(localized);
      }
    }, [establishments, i18n.locale])
  );

  useEffect(() => {
    const handleLanguageChange = () => {
      if (establishments && establishments.length > 0) {
        const localized = TranslationService.getLocalizedEstablishments(establishments);
        setLocalizedEstablishments(localized);
      }
    };

    // Para i18n-js, el efecto se ejecutará cuando cambie el locale
    if (establishments && establishments.length > 0) {
      const localized = TranslationService.getLocalizedEstablishments(establishments);
      setLocalizedEstablishments(localized);
    }
  }, [establishments, i18n.locale]);

  return localizedEstablishments;
};

/**
 * Hook para obtener el idioma actual
 */
export const useCurrentLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState(TranslationService.getCurrentLanguage());

  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLanguage(TranslationService.getCurrentLanguage());
    };

    // Para i18n-js, el efecto se ejecutará cuando cambie el locale
    setCurrentLanguage(TranslationService.getCurrentLanguage());
  }, [i18n.locale]);

  return currentLanguage;
};