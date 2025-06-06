import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../i18n';
import { getLocations, Location } from '../services/firestoreService';
import { getLocationImage, normalizeLocationId } from '../utils/imageMapping'; // Importar utilidad

const { width } = Dimensions.get('window');

const LocationSelectionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fadeAnims = useRef<{ [key: string]: Animated.Value }>({});

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const locationsData = await getLocations();

        const initialFadeAnims: { [key: string]: Animated.Value } = {};

        locationsData.forEach(location => {
          initialFadeAnims[location.id] = new Animated.Value(0);
        });

        fadeAnims.current = initialFadeAnims;
        setLocations(locationsData);

        // Animar todas las imágenes después de un pequeño delay
        setTimeout(() => {
          locationsData.forEach(location => {
            Animated.timing(fadeAnims.current[location.id], {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }).start();
          });
        }, 100);

      } catch (err) {
        console.error('Error fetching locations:', err);
        setError(i18n.t('locationSelection.errorMessage'));
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleLocationSelect = async (locationId: string) => {
    try {
      setLoading(true);
      await AsyncStorage.setItem('@goldenbook_selected_location', locationId);
      navigation.navigate('HomeScreen', { selectedLocation: locationId });
    } catch (error) {
      console.error('Error saving location selection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
  };

  // Función para obtener imagen local
  const getLocalImage = (location: Location) => {
    const normalizedId = normalizeLocationId(location.name || location.id);
    return getLocationImage(normalizedId, false); // false = usar medium en lugar de thumbnail
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00B383" />
          <Text style={styles.loadingText}>{i18n.t('locationSelection.loading')}</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>{i18n.t('locationSelection.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{i18n.t('locationSelection.selectLocation')}</Text>
            <Text style={styles.subtitle}>
              {i18n.t('locationSelection.selectLocationSubtitle')}
            </Text>
          </View>

          <View>
            {locations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={styles.locationCard}
                onPress={() => handleLocationSelect(location.id)}
                activeOpacity={0.8}
              >
                <View style={styles.imageContainer}>
                  <Animated.View
                    style={[
                      styles.imageWrapper,
                      { opacity: fadeAnims.current[location.id] || 0 }
                    ]}
                  >
                    <Image
                      source={getLocalImage(location)} // Usar imagen local
                      style={styles.locationImage}
                    // Ya no necesitamos onLoadStart, onLoadEnd ni onError
                    />
                  </Animated.View>
                </View>
                <View style={styles.locationLabelContainer}>
                  <Text style={styles.locationLabel}>{location.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// Styles permanecen igual, pero puedes eliminar imagePlaceholder ya que no es necesario
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: width * 0.03,
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 10,
    paddingHorizontal: width * 0.05,
    paddingVertical: width * 0.05,
  },
  headerContainer: {
    marginBottom: width * 0.06,
  },
  title: {
    fontSize: width * 0.07,
    fontFamily: 'EuclidSquare-SemiBold',
    color: '#1A1A2E',
    marginBottom: width * 0.02,
  },
  subtitle: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
  },
  locationCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: width * 0.05,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: '100%',
    height: width * 0.37,
    position: 'relative',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  locationImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  locationLabelContainer: {
    position: 'absolute',
    top: width * 0.03,
    left: width * 0.03,
    backgroundColor: 'white',
    paddingHorizontal: width * 0.03,
    paddingVertical: width * 0.015,
    borderRadius: 8,
    zIndex: 3,
  },
  locationLabel: {
    fontFamily: 'EuclidSquare-Regular',
    fontSize: width * 0.035,
    color: '#1A1A2E',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.05,
  },
  errorText: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Regular',
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: width * 0.03,
  },
  retryButton: {
    backgroundColor: '#00B383',
    paddingHorizontal: width * 0.05,
    paddingVertical: width * 0.02,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontFamily: 'EuclidSquare-Medium',
    fontSize: width * 0.04,
  },
});

export default LocationSelectionScreen;