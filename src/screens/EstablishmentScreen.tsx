import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Analytics from 'expo-firebase-analytics';
import React, { useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/navigationTypes';

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

  useEffect(() => {
    Analytics.logEvent('screen_view', {
      screen_name: 'EstablishmentScreen',
      screen_class: 'EstablishmentScreen'
    });
  }, []);

  // Custom hooks para manejar datos y acciones
  const { establishment, loading } = useEstablishmentData(establishmentId);
  const {
    isFavorite,
    isUpdatingFavorite,
    userLikes,
    updatingLikes,
    handleFavoriteToggle,
    handleLikeToggle,
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

  if (loading || !establishment) {
    return <LoadingScreen />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <EstablishmentOverview
            establishment={establishment}
            onImagePress={openLightbox}
          />
        );
      case 'Contacts':
        return (
          <EstablishmentContacts
            establishment={establishment}
            navigation={navigation}
            establishmentId={establishmentId}
          />
        );
      case 'Reservations':
        return (
          <EstablishmentReservations establishment={establishment} />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <EstablishmentHeader
        establishment={establishment}
        navigation={navigation}
        isFavorite={isFavorite}
        isUpdatingFavorite={isUpdatingFavorite}
        userLikes={userLikes}
        updatingLikes={updatingLikes}
        establishmentId={establishmentId}
        onFavoriteToggle={handleFavoriteToggle}
        onLikeToggle={handleLikeToggle}
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