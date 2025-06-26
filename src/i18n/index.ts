import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18n } from 'i18n-js';
import { NativeModules, Platform } from 'react-native';
import en from '../locals/en.json';
import pt from '../locals/pt.json';

const i18n = new I18n({
  en,
  pt,
});

// Función para detectar idioma del dispositivo
const getDeviceLanguage = () => {
  let locale = 'en'; // idioma por defecto (inglés)
  
  if (Platform.OS === 'ios') {
    locale = NativeModules.SettingsManager?.settings?.AppleLocale ||
             NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
             'en';
  } else {
    locale = NativeModules.I18nManager?.localeIdentifier || 'en';
  }
  
  const detectedLanguage = locale.substring(0, 2); // Solo los primeros 2 caracteres
  
  // Solo cambiar a portugués si detecta específicamente 'pt'
  return detectedLanguage === 'pt' ? 'pt' : 'en';
};

// Función para inicializar el idioma con la siguiente prioridad:
// 1. Preferencia guardada por el usuario
// 2. Detección automática del dispositivo (inglés por defecto, portugués solo si se detecta)
// 3. Fallback a inglés
const initializeLanguage = async () => {
  try {
    // Intentar cargar preferencia guardada
    const savedLanguage = await AsyncStorage.getItem('@goldenbook_language');
    
    if (savedLanguage && (savedLanguage === 'pt' || savedLanguage === 'en')) {
      // Usuario ya eligió un idioma previamente
      i18n.locale = savedLanguage;
    } else {
      // Primera vez: detectar idioma del dispositivo
      const deviceLanguage = getDeviceLanguage();
      i18n.locale = deviceLanguage;
      
      // Guardar la detección automática como preferencia inicial
      await AsyncStorage.setItem('@goldenbook_language', deviceLanguage);
    }
  } catch (error) {
    // En caso de error, usar inglés por defecto
    console.error('❌ Error cargando idioma:', error);
    i18n.locale = 'en';
  }
};

// Configuración de i18n
i18n.enableFallback = true;
i18n.defaultLocale = 'en'; // Fallback a inglés

// Inicializar idioma de forma asíncrona
initializeLanguage();

// Establecer idioma por defecto temporalmente mientras se carga la preferencia
i18n.locale = 'en';

export default i18n;