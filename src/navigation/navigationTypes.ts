// src/navigation/navigationTypes.ts
export type RootStackParamList = {
  AnimationScreen: undefined;
  OnboardingScreen: undefined;
  HomeScreen: { selectedLocation?: string };
  LoginStep1: undefined;
  LoginStep2: { email: string };
  ResetPassword: undefined;
  Register: undefined;
  LocationSelection: undefined;
  MapScreen: { selectedLocation?: string };
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
};