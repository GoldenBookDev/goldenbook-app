// src/navigation/navigationTypes.ts
export type RootStackParamList = {
  AnimationScreen: undefined;
  OnboardingScreen: undefined;
  HomeScreen: {
    selectedLocation?: string;
    openMenu?: boolean;
    refreshTimestamp?: number; // Añade esta línea
  };
  LoginStep1: undefined;
  LoginStep2: { email: string };
  ResetPassword: undefined;
  Register: undefined;
  LocationSelection: undefined;
  MapScreen: {
    selectedLocation?: string;
    focusEstablishmentId?: string; // NUEVO: ID del establecimiento a enfocar
    openModal?: boolean; // NUEVO: Si abrir el modal automáticamente
  };
  CategoryScreen: { 
    categoryId: string;
    categoryTitle: string;
    selectedLocation: string;
  };
  EstablishmentScreen: { establishmentId: string };
  // Actualización de la definición para la pantalla de resultados de búsqueda
  SearchResults: {
    query: string;
    selectedLocation: string;
    categoryId?: string; // Añadido categoryId opcional
  };
  ProfileScreen: undefined;
  MyFavoritesScreen: undefined;
  SettingsScreen: undefined
};