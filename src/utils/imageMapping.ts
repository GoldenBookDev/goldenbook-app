// utils/imageMapping.ts
export const locationImages = {
  // Usando las imágenes comprimidas (_medium) que ya tienes
  algarve: require('../assets/images/locations/algarve_medium.jpg'),
  lisboa: require('../assets/images/locations/lisboa_medium.jpg'),
  madeira: require('../assets/images/locations/madeira_medium.jpg'),
  porto: require('../assets/images/locations/porto_medium.jpg'),
  // Fallback por defecto
  default: require('../assets/images/porto.jpg'),
};

// Para thumbnails aún más pequeños (si los tienes)
export const locationThumbnails = {
  algarve: require('../assets/images/locations/algarve_thumbnail.jpg'),
  lisboa: require('../assets/images/locations/lisboa_thumbnail.jpg'),
  madeira: require('../assets/images/locations/madeira_thumbnail.jpg'),
  porto: require('../assets/images/locations/porto_thumbnail.jpg'),
  default: require('../assets/images/porto.jpg'),
};

/**
 * Obtiene la imagen local para una ubicación
 * @param locationId - ID de la ubicación (debe coincidir con las claves del objeto)
 * @param useThumnail - Si usar la versión thumbnail (más pequeña)
 * @returns ImageSourcePropType para React Native
 */
export const getLocationImage = (locationId: string, useThumbnail: boolean = false) => {
  const imageMap = useThumbnail ? locationThumbnails : locationImages;
  const normalizedId = locationId.toLowerCase();
  
  return imageMap[normalizedId as keyof typeof imageMap] || imageMap.default;
};

/**
 * Mapea nombres de ubicación a IDs (si necesitas normalización)
 */
export const normalizeLocationId = (locationName: string): string => {
  const nameMap: { [key: string]: string } = {
    'algarve': 'algarve',
    'lisboa': 'lisboa', 
    'lisbon': 'lisboa',
    'madeira': 'madeira',
    'porto': 'porto',
    'oporto': 'porto',
  };
  
  const normalized = locationName.toLowerCase().trim();
  return nameMap[normalized] || normalized;
};