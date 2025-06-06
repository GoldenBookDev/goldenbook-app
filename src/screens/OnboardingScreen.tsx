import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@navigation/navigationTypes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import i18n from '../i18n'; // Importar i18n

type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'OnboardingScreen'>;

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const flatListRef = useRef<FlatList<any>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = Dimensions.get('window');

  // Definir slides con traducciones
  const SLIDES = [
    {
      key: '1',
      subtitle: i18n.t('onboarding.slide1.subtitle'),
      title: i18n.t('onboarding.slide1.title'),
      description: i18n.t('onboarding.slide1.description'),
      image: require('../assets/images/slide1.png'),
    },
    {
      key: '2',
      subtitle: i18n.t('onboarding.slide2.subtitle'),
      title: i18n.t('onboarding.slide2.title'),
      description: i18n.t('onboarding.slide2.description'),
      image: require('../assets/images/slide2.png'),
    },
    {
      key: '3',
      subtitle: i18n.t('onboarding.slide3.subtitle'),
      title: i18n.t('onboarding.slide3.title'),
      description: i18n.t('onboarding.slide3.description'),
      image: require('../assets/images/slide3.png'),
    },
  ];

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={[styles.slide, { width }]}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
      </View>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('LoginStep1');
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentIndex > 0 && (
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      )}

      {currentIndex < SLIDES.length - 1 && (
        <TouchableOpacity
          style={[styles.skipButton, { zIndex: 10 }]}
          onPress={() => navigation.replace('LoginStep1')}
        >
          <Text style={styles.skipText}>{i18n.t('onboarding.skip')}</Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View style={styles.pagination}>
        {SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1 
              ? i18n.t('onboarding.getStarted') 
              : i18n.t('onboarding.next')
            }
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Evitar solapamiento en Android
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '5%', // Proporcional al ancho
  },
  imageContainer: {
    width: '85%', // 85% del ancho de la pantalla
    height: undefined, // Para que respete el aspecto
    aspectRatio: 1, // Mantener proporción cuadrada
    marginBottom: '5%', // Proporcional al alto de la pantalla
    marginTop: '10%',
    borderRadius: 15, // Para bordes redondeados
    overflow: 'hidden', // Recortar bordes
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Cubrir sin deformar
  },
  subtitle: {
    fontSize: Dimensions.get('window').width * 0.035, // Dinámico según el ancho
    fontFamily: 'EuclidSquare-SemiBold',
    textAlign: 'center',
    color: '#161B33',
    marginTop: '2%',
    marginBottom: '1%',
  },
  title: {
    fontSize: Dimensions.get('window').width * 0.08, // Ajustado al ancho de la pantalla
    fontFamily: 'EuclidSquare-SemiBold',
    textAlign: 'center',
    color: '#161B33',
    marginBottom: '2%',
  },
  description: {
    fontSize: Dimensions.get('window').width * 0.04, // Texto proporcional
    fontFamily: 'EuclidSquare-Regular',
    textAlign: 'center',
    paddingHorizontal: '10%',
    color: '#6C757D',
    marginBottom: '5%',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 80 : 50,
    left: 20,
    zIndex: 10,
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 80 : 50,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: Dimensions.get('window').width * 0.035, // Texto proporcional
    fontFamily: 'EuclidSquare-SemiBold',
    color: '#000000',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '8%',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#DAA520',
  },
  inactiveDot: {
    backgroundColor: '#D3D3D3',
  },
  footer: {
    paddingHorizontal: '5%',
    paddingBottom: '10%',
  },
  button: {
    backgroundColor: '#DAA520',
    paddingVertical: Dimensions.get('window').height * 0.02, // Ajustar botón dinámicamente
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: Dimensions.get('window').width * 0.045, // Ajustar texto dinámicamente
    fontFamily: 'EuclidSquare-SemiBold',
  },
});

export default OnboardingScreen;