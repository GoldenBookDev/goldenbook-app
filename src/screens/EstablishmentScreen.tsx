import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/navigationTypes';

// ✅ AGREGAR: Import del contexto de autenticación
import { useAuth } from '../context/AuthContext';

// Import components
import EstablishmentContacts from '../components/EstablishmentContacts';
import EstablishmentHeader from '../components/EstablishmentHeader';
import EstablishmentOverview from '../components/EstablishmentOverview';
import EstablishmentReservations from '../components/EstablishmentReservations';
import EstablishmentTabs from '../components/EstablishmentTabs';
import GalleryLightbox from '../components/GalleryLightbox';
import LoadingScreen from '../components/LoadingScreen';

// Import hooks
import { useEstablishmentActions } from '../hooks/useEstablishmentActions';
import { useEstablishmentData } from '../hooks/useEstablishmentData';
import { useGalleryLightbox } from '../hooks/useGalleryLightbox';

type Props = NativeStackScreenProps<RootStackParamList, 'EstablishmentScreen'>;
type TabType = 'Overview' | 'Contacts' | 'Reservations';

const EstablishmentScreen: React.FC<Props> = ({ route, navigation }) => {
  const { establishmentId } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>('Overview');

  // ✅ AGREGAR: Hook de autenticación
  const { user, isGuest } = useAuth();

  // ✅ Estado local para el establishment con reviewCount actualizable
  const [localEstablishment, setLocalEstablishment] = useState<any>(null);

  // Custom hooks para manejar datos y acciones
  const { establishment, loading } = useEstablishmentData(establishmentId);
  const {
    isFavorite,
    isUpdatingFavorite,
    userLikes,
    updatingLikes,
    handleFavoriteToggle,
    handleLikeToggle: originalHandleLikeToggle,
    handleShare
  } = useEstablishmentActions(establishmentId, establishment, navigation);

  const {
    lightboxVisible,
    currentImageIndex,
    galleryImages,
    openLightbox,
    closeLightbox,
    goToPreviousImage,
    goToNextImage
  } = useGalleryLightbox();

  // ✅ Sincronizar localEstablishment con los datos del backend
  useEffect(() => {
    if (establishment) {
      setLocalEstablishment(establishment);
    }
  }, [establishment]);

  // ✅ CORREGIR: Función personalizada para manejar likes con validación de autenticación
  const handleLikeToggleWithOptimism = async () => {
    // ✅ PRIMERO: Verificar autenticación antes de hacer cambios optimistas
    if (!user || isGuest) {
      // Si no está logueado, solo mostrar el modal (lo maneja originalHandleLikeToggle)
      await originalHandleLikeToggle();
      return;
    }

    try {
      const isCurrentlyLiked = userLikes.includes(establishmentId);

      // ✅ Solo actualizar optimistamente si el usuario está logueado
      setLocalEstablishment((prev: any) => {
        if (!prev) return prev;

        const newReviewCount = isCurrentlyLiked
          ? Math.max(0, (prev.reviewCount || 0) - 1)  // Quitar like: -1 (nunca negativo)
          : (prev.reviewCount || 0) + 1;              // Dar like: +1

        return {
          ...prev,
          reviewCount: newReviewCount
        };
      });

      // Ejecutar la función original de like
      await originalHandleLikeToggle();

    } catch (error) {
      console.error('Error toggling like:', error);
      // ✅ En caso de error, revertir usando los datos originales del backend
      if (establishment) {
        setLocalEstablishment(establishment);
      }
    }
  };

  if (loading || !establishment || !localEstablishment) {
    return <LoadingScreen />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <EstablishmentOverview
            establishment={localEstablishment} // ✅ Usar estado local
            onImagePress={openLightbox}
          />
        );
      case 'Contacts':
        return (
          <EstablishmentContacts
            establishment={localEstablishment} // ✅ Usar estado local
            navigation={navigation}
            establishmentId={establishmentId}
          />
        );
      case 'Reservations':
        return (
          <EstablishmentReservations establishment={localEstablishment} /> // ✅ Usar estado local
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <EstablishmentHeader
        establishment={localEstablishment} // ✅ Usar estado local
        navigation={navigation}
        isFavorite={isFavorite}
        isUpdatingFavorite={isUpdatingFavorite}
        userLikes={userLikes}
        updatingLikes={updatingLikes}
        establishmentId={establishmentId}
        onFavoriteToggle={handleFavoriteToggle}
        onLikeToggle={handleLikeToggleWithOptimism} // ✅ Usar función personalizada
        onShare={handleShare}
      />

      <EstablishmentTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <SafeAreaView style={styles.safeContent} edges={['left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderContent()}
        </ScrollView>
      </SafeAreaView>

      <GalleryLightbox
        visible={lightboxVisible}
        images={galleryImages}
        currentIndex={currentImageIndex}
        onClose={closeLightbox}
        onPrevious={goToPreviousImage}
        onNext={goToNextImage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60,
  },
});

export default EstablishmentScreen;