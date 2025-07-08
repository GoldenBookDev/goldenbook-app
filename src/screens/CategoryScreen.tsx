import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../i18n';
import { RootStackParamList } from '../navigation/navigationTypes';

// ✅ AGREGAR: Import del contexto de autenticación
import { useAuth } from '../context/AuthContext';

// Import components
import CategoryHeader from '../components/CategoryHeader';
import CategoryTitle from '../components/CategoryTitle';
import EstablishmentItem from '../components/EstablishmentItem';
import EstablishmentsFilter from '../components/EstablishmentsFilter';
import FloatingMapButton from '../components/FloatingMapButton';
import OfflineIndicator from '../components/OfflineIndicator';
import SearchBar from '../components/SearchBar';
import SearchDropdown from '../components/SearchDropdown';
import SubcategoriesFilter from '../components/SubcategoriesFilter';

// ✅ IMPORTAR EL SISTEMA HÍBRIDO COMPLETO
import { CategoryIcon } from '../components/icons/IconSystem';

// Import hooks
import { useCategoryData } from '../hooks/useCategoryData';
import { useCategoryFilters } from '../hooks/useCategoryFilters';
import { useCategorySearch } from '../hooks/useCategorySearch';
import { useMapLocation } from '../hooks/useMapLocation'; // ✅ Agregar hook de ubicación
import { useUserActions } from '../hooks/useUserActions';

const { width } = Dimensions.get('window');

// ✅ COMPONENTE DE ICONO MEJORADO PARA CATEGORYTITLE
const CategoryIconComponent = ({ categoryId, size = 24, color = "#915A17" }: {
  categoryId: string;
  size?: number;
  color?: string;
}) => {
  return (
    <CategoryIcon
      category={categoryId}
      type="category"
      size={size + 4} // ✅ Contenedor un poco más grande
      iconSize={size * 0.7} // ✅ Icono más grande (era 0.6)
      iconColor={color}
      backgroundColor="#F8EDD2" // Con fondo de gota
    />
  );
};

type CategoryScreenProps = NativeStackScreenProps<RootStackParamList, 'CategoryScreen'>;

const CategoryScreen = ({ route, navigation }: CategoryScreenProps) => {
  const { categoryId, categoryTitle, selectedLocation } = route.params;
  const searchInputRef = useRef<TextInput>(null);

  // ✅ AGREGAR: Hook de autenticación
  const { user, isGuest } = useAuth();

  // ✅ Estado local para los establishments con reviewCount actualizable
  const [localEstablishments, setLocalEstablishments] = useState<any[]>([]);

  // ✅ Hook de ubicación para Near Me (MOVER AQUÍ, ANTES DE USARLO)
  const { shouldShowNearMe, sortEstablishmentsByDistance } = useMapLocation();

  // Custom hooks
  const {
    loading,
    subcategories,
    establishments,
    error,
    locationName,
    updateEstablishmentReviewCount,
    refreshData // ✅ Obtener función de refresh del hook
  } = useCategoryData(categoryId, selectedLocation);

  const {
    filteredEstablishments: originalFilteredEstablishments,
    selectedSubcategory,
    selectedFilter,
    setSelectedSubcategory,
    setSelectedFilter
  } = useCategoryFilters(localEstablishments); // ✅ Usar localEstablishments

  // ✅ Aplicar sorting por distancia si el filtro es 'near_me'
  const finalFilteredEstablishments = selectedFilter === 'near_me' && shouldShowNearMe
    ? sortEstablishmentsByDistance(originalFilteredEstablishments)
    : originalFilteredEstablishments;

  const {
    searchQuery,
    searchResults,
    isSearchFocused,
    handleSearchChange,
    handleSearchFocus,
    handleSearchBlur,
    handleSelectEstablishment,
    handleShowAllResults
  } = useCategorySearch(localEstablishments, navigation, selectedLocation, categoryId); // ✅ Usar localEstablishments

  const {
    userFavorites,
    updatingFavorites,
    userLikes,
    updatingLikes,
    handleFavoriteToggle,
    handleLikeToggle: originalHandleLikeToggle
  } = useUserActions(navigation);

  // ✅ Sincronizar localEstablishments con los datos del backend
  useEffect(() => {
    if (establishments && establishments.length > 0) {
      setLocalEstablishments(establishments);
    }
  }, [establishments]);

  // ✅ Refrescar datos cuando vuelves a la pantalla
  useFocusEffect(
    React.useCallback(() => {
      // Cuando la pantalla recibe foco, refrescar datos del backend
      console.log('CategoryScreen focused - refreshing backend data');
      refreshData();
    }, [refreshData])
  );

  // ✅ CORREGIR: Función personalizada para manejar likes con validación de autenticación
  const handleLikeToggleWithOptimism = async (establishmentId: string) => {
    // ✅ PRIMERO: Verificar autenticación antes de hacer cambios optimistas
    if (!user || isGuest) {
      // Si no está logueado, solo mostrar el modal (lo maneja originalHandleLikeToggle)
      await originalHandleLikeToggle(establishmentId, (increment) =>
        updateEstablishmentReviewCount(establishmentId, increment)
      );
      return;
    }

    try {
      const isCurrentlyLiked = userLikes.includes(establishmentId);

      // ✅ Solo actualizar optimistamente si el usuario está logueado
      setLocalEstablishments((prev: any[]) =>
        prev.map(establishment => {
          if (establishment.id === establishmentId) {
            const newReviewCount = isCurrentlyLiked
              ? Math.max(0, (establishment.reviewCount || 0) - 1)  // Quitar like: -1
              : (establishment.reviewCount || 0) + 1;              // Dar like: +1

            return {
              ...establishment,
              reviewCount: newReviewCount
            };
          }
          return establishment;
        })
      );

      // Ejecutar la función original de like
      await originalHandleLikeToggle(establishmentId, (increment) =>
        updateEstablishmentReviewCount(establishmentId, increment)
      );

    } catch (error) {
      console.error('Error toggling like:', error);
      // ✅ En caso de error, revertir usando los datos originales del backend
      if (establishments) {
        setLocalEstablishments(establishments);
      }
    }
  };

  // ========== FUNCIÓN PARA TRADUCIR SUBCATEGORÍAS ==========
  const getTranslatedSubcategory = (subcategoryKey: string) => {
    return i18n.t(`subcategories.${subcategoryKey}`, { defaultValue: subcategoryKey });
  };

  // ========== FUNCIÓN PARA TRADUCIR TÍTULO DE CATEGORÍA ==========
  const getTranslatedCategoryTitle = (title: string) => {
    // Mapeo de títulos en inglés a claves de traducción
    const categoryKeyMapping: { [key: string]: string } = {
      'Stay & Do': 'activities',
      'Nature': 'beaches',
      'Culture': 'culture',
      'Events': 'events',
      'Food & Drinks': 'gastronomy',
      'Shopping': 'shops',
      'Sports': 'sports',
      'Transport': 'transport'
    };

    const translationKey = categoryKeyMapping[title] || categoryId;
    return i18n.t(`categories.${translationKey}`, { defaultValue: title });
  };

  // ========== FUNCIÓN CORREGIDA PARA SEARCH DROPDOWN ==========
  const handleSelectEstablishmentById = (establishmentId: string) => {
    // Encontrar el establishment por ID en los resultados de búsqueda
    const establishment = searchResults.find(est => est.id === establishmentId);
    if (establishment) {
      handleSelectEstablishment(establishment);
    } else {
      // Fallback: navegar directamente con el ID
      navigation.navigate('EstablishmentScreen', { establishmentId });
    }
  };

  // ✅ FUNCIÓN CORREGIDA PARA MOSTRAR TODOS LOS RESULTADOS
  const handleShowAllResultsFixed = () => {
    // Verificar que searchQuery tenga contenido
    if (searchQuery.trim() === '') {
      console.warn('No search query to show all results');
      return;
    }

    console.log('Navigating to SearchResults with:', {
      query: searchQuery,
      selectedLocation: selectedLocation,
      categoryId: categoryId
    });

    // ✅ Primero cerrar el dropdown (blur del input)
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }

    // ✅ Navegar a SearchResults con los parámetros correctos
    navigation.navigate('SearchResults', {
      query: searchQuery,
      selectedLocation: selectedLocation,
      categoryId: categoryId
    });
  };

  // ✅ MEMOIZAR: Funciones estables para evitar re-renders
  const handleSearchChangeStable = useCallback((query: string) => {
    handleSearchChange(query);
  }, [handleSearchChange]);

  const handleSearchFocusStable = useCallback(() => {
    handleSearchFocus();
  }, [handleSearchFocus]);

  const handleSearchBlurStable = useCallback(() => {
    handleSearchBlur();
  }, [handleSearchBlur]);

  // ✅ MEMOIZAR: Render functions para evitar re-renders innecesarios
  const renderEstablishmentItem = React.useCallback(({ item }: { item: any }) => (
    <EstablishmentItem
      item={item}
      isFavorite={userFavorites.includes(item.id)}
      isUpdatingFavorite={updatingFavorites.has(item.id)}
      isLiked={userLikes.includes(item.id)}
      isUpdatingLike={updatingLikes.has(item.id)}
      onPress={() => {
        navigation.navigate('EstablishmentScreen', { establishmentId: item.id });
      }}
      onFavoriteToggle={() => handleFavoriteToggle(item.id)}
      onLikeToggle={() => handleLikeToggleWithOptimism(item.id)}
      showCategory={false}
    />
  ), [userFavorites, updatingFavorites, userLikes, updatingLikes, handleFavoriteToggle, handleLikeToggleWithOptimism]);

  const renderHeader = React.useCallback(() => (
    <>
      {/* ========== INDICADOR OFFLINE AQUÍ ========== */}
      <OfflineIndicator />

      {/* ✅ REDUCIR ESPACIO ENTRE SEARCH Y SUBCATEGORÍAS */}
      <View style={styles.subcategoriesWrapper}>
        <SubcategoriesFilter
          subcategories={subcategories}
          selectedSubcategory={selectedSubcategory}
          onSubcategorySelect={setSelectedSubcategory}
          getTranslatedSubcategory={getTranslatedSubcategory}
        />
      </View>

      <EstablishmentsFilter
        selectedFilter={selectedFilter}
        onFilterSelect={setSelectedFilter}
        shouldShowNearMe={shouldShowNearMe} // ✅ Pasar prop para mostrar/ocultar Near Me
      />

      {finalFilteredEstablishments.length === 0 && !loading && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>
            {selectedSubcategory
              ? i18n.t('category.noEstablishmentsSubcategory')
              : i18n.t('category.noEstablishments')}
          </Text>
        </View>
      )}
    </>
  ), [
    categoryId,
    searchQuery,
    isSearchFocused,
    loading,
    selectedSubcategory,
    selectedFilter,
    shouldShowNearMe,
    finalFilteredEstablishments.length
  ]);

  const renderSearchDropdown = React.useCallback(() => {
    if (!isSearchFocused || searchQuery.trim() === '') {
      return null;
    }

    return (
      <View style={styles.dropdownWrapper}>
        <SearchDropdown
          results={searchResults}
          onSelectEstablishment={handleSelectEstablishmentById}
          onShowAllResults={handleShowAllResultsFixed} // ✅ Usar función corregida
          visible={true}
        />
      </View>
    );
  }, [isSearchFocused, searchQuery, searchResults, handleSelectEstablishmentById, handleShowAllResultsFixed]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#00B383" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* ✅ HEADER SIN SEPARADOR */}
      <CategoryHeader
        locationName={locationName}
        onBack={() => navigation.goBack()}
      />

      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        {/* ✅ UNIFICAR: SearchBar y Title en el mismo contenedor blanco */}
        <View style={styles.headerSection}>
          <SearchBar
            placeholder={`${i18n.t('category.searchIn')} ${getTranslatedCategoryTitle(categoryTitle)}`}
            value={searchQuery}
            onChangeText={handleSearchChangeStable}
            onFocus={handleSearchFocusStable}
            onBlur={handleSearchBlurStable}
            style={styles.searchBar}
            ref={searchInputRef}
          />

          <View style={styles.titleSection}>
            <CategoryTitle
              icon={CategoryIconComponent}
              iconProps={{ categoryId, size: width * 0.08, color: "#915A17" }}
              title={getTranslatedCategoryTitle(categoryTitle)}
            />
          </View>
        </View>

        {renderSearchDropdown()}

        <FlatList
          data={finalFilteredEstablishments} // ✅ Usar datos con sorting aplicado
          renderItem={renderEstablishmentItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.establishmentsContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={true}
          // ✅ AGREGAR: Props para optimizar performance
          windowSize={10}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={50}
          initialNumToRender={8}
          getItemLayout={undefined} // Deshabilitar para tamaños variables
        />

        <FloatingMapButton
          onPress={() => navigation.navigate('MapScreen', {
            selectedLocation: selectedLocation || undefined
          })}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white', // ✅ CAMBIAR a blanco en lugar de gris
  },
  container: {
    flex: 1,
    backgroundColor: 'white', // ✅ CAMBIAR a blanco en lugar de gris
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    marginTop: width * 0.015, // ✅ REDUCIR espacio entre SearchBar y Title (era 0.02)
    marginBottom: -width * 0.02, // ✅ AGREGAR margen negativo hacia abajo
  },
  searchContainer: {
    position: 'relative',
    marginHorizontal: width * 0.04,
    marginBottom: width * 0.01, // ✅ Menos espacio (era 0.02)
  },
  // ✅ NUEVO WRAPPER PARA CONTROLAR ESPACIO CON FONDO GRIS
  subcategoriesWrapper: {
    marginTop: -width * 0.005, // ✅ Espacio negativo para acercar más
    backgroundColor: '#F9F9F9', // ✅ AGREGAR fondo gris específico
  },
  // ✅ NUEVO: Sección header unificada para SearchBar + Title
  headerSection: {
    backgroundColor: 'white',
    paddingHorizontal: width * 0.04,
    paddingTop: width * 0.02,
    paddingBottom: width * 0.02, // ✅ AUMENTAR padding bottom para cubrir más espacio
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  // ✅ WRAPPER PARA EL HEADER SIN SHADOW
  headerWrapper: {
    backgroundColor: 'white',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  searchBar: {},
  dropdownWrapper: {
    position: 'absolute',
    top: width * 0.12, // ✅ REDUCIDO AÚN MÁS (era 0.16)
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  establishmentsContainer: {
    paddingTop: width * 0.02,
    paddingBottom: width * 0.05,
    backgroundColor: 'white', // ✅ AGREGAR fondo gris específico
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: width * 0.10,
    backgroundColor: 'white',
  },
  noResultsText: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
    textAlign: 'center',
  },
  errorText: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Regular',
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: width * 0.03,
  },
});

export default CategoryScreen;