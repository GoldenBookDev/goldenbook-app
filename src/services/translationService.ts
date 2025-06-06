// services/translationService.ts
import i18n from '../i18n';

export class TranslationService {
  /**
   * Obtiene el idioma actual de la aplicación
   */
  static getCurrentLanguage(): 'pt' | 'en' {
    const currentLang = i18n.locale || 'pt';
    return currentLang.startsWith('en') ? 'en' : 'pt';
  }

  /**
   * Traduce un campo específico del establishment
   */
  static translateField(
    translations: any, 
    fieldName: string, 
    fallbackValue?: string
  ): string {
    if (!translations || !translations[fieldName]) {
      return fallbackValue || '';
    }

    const currentLang = this.getCurrentLanguage();
    const fieldTranslations = translations[fieldName];
    
    // Prioridad: idioma actual > portugués (por defecto) > primer valor disponible
    return fieldTranslations[currentLang] || 
           fieldTranslations.pt || 
           Object.values(fieldTranslations)[0] || 
           fallbackValue || '';
  }

  /**
   * Traduce un array de categorías
   */
  static translateCategories(
    translations: any, 
    fieldName: 'categories' | 'subcategories'
  ): string[] {
    if (!translations || !translations[fieldName]) {
      return [];
    }

    const currentLang = this.getCurrentLanguage();
    const fieldTranslations = translations[fieldName];
    
    return fieldTranslations[currentLang] || 
           fieldTranslations.pt || 
           Object.values(fieldTranslations)[0] || 
           [];
  }

  /**
   * Obtiene todas las traducciones de un establishment en el idioma actual
   */
  static getLocalizedEstablishment(establishment: any): any {
    if (!establishment || !establishment.translations) {
      // Fallback para datos sin traducir
      return establishment;
    }

    return {
      ...establishment,
      fullDescription: this.translateField(
        establishment.translations, 
        'fullDescription', 
        establishment.fullDescription // fallback al valor original
      ),
      shortDescription: this.translateField(
        establishment.translations, 
        'shortDescription', 
        establishment.shortDescription
      ),
      openingHours: this.translateField(
        establishment.translations, 
        'openingHours', 
        establishment.openingHours
      ),
      categories: this.translateCategories(
        establishment.translations, 
        'categories'
      ).length > 0 ? this.translateCategories(establishment.translations, 'categories') : establishment.categories,
      subcategories: this.translateCategories(
        establishment.translations, 
        'subcategories'
      ).length > 0 ? this.translateCategories(establishment.translations, 'subcategories') : establishment.subcategories
    };
  }

  /**
   * Traduce una lista de establishments
   */
  static getLocalizedEstablishments(establishments: any[]): any[] {
    return establishments.map(establishment => 
      this.getLocalizedEstablishment(establishment)
    );
  }
}