import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../i18n';
import { RootStackParamList } from '../navigation/navigationTypes';

// Import SVG components
import ArrowLeftIcon from '../assets/images/icons/arrow-left-bg.svg';
import LandLayerLocationIcon from '../assets/images/icons/land-layer-location.svg';
import MenuIcon from '../assets/images/icons/menu-bg.svg';

// Import components
import CategoriesGrid from '../components/CategoriesGrid';
import EstablishmentSection from '../components/EstablishmentSection';
import LoadingScreen from '../components/LoadingScreen';
import MenuController from '../components/MenuController';
import SearchBar from '../components/SearchBar';
import SearchDropdown from '../components/SearchDropdown';

// Import hooks
import { useHomeData } from '../hooks/useHomeData';
import { useSearch } from '../hooks/useSearch';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'HomeScreen'>;

const { width, height } = Dimensions.get('window');

const HomeScreen: React.FC<HomeScreenProps> = ({ route, navigation }) => {
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollY, setScrollY] = useState(0);

  // Custom hooks para manejar datos y búsqueda
  const {
    selectedLocation,
    locationName,
    backgroundImage,
    categories,
    loading,
    allEstablishments,
    recommendedEstablishments,
    featuredEstablishments,
    trendingEstablishments,
    newEstablishments,
    popularEstablishments,
    topRatedEstablishments
  } = useHomeData(route, navigation);

  const {
    searchQuery,
    searchResults,
    isSearchFocused,
    handleSearchChange,
    handleSearchFocus,
    handleSearchBlur,
    handleSelectEstablishment,
    handleShowAllResults
  } = useSearch(allEstablishments, navigation, selectedLocation);

  useEffect(() => {
    const params = route.params as any;
    if (params?.openMenu) {
      setMenuVisible(true);
      navigation.setParams({ openMenu: undefined } as any);
    }
  }, [route.params, navigation]);

  useEffect(() => {
    const params = route.params as any;
    if (params?.refreshTimestamp) {
      navigation.setParams({ refreshTimestamp: undefined } as any);
      if (params?.openMenu) {
        setMenuVisible(true);
      }
    }
  }, [route.params?.refreshTimestamp, navigation]);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    if (currentScrollY < 0) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }
    setScrollY(currentScrollY);
  };

  const handleCategoryPress = (categoryId: string, categoryTitle: string) => {
    if (selectedLocation) {
      navigation.navigate('CategoryScreen', {
        categoryId,
        categoryTitle,
        selectedLocation
      });
    }
  };

  const handleEstablishmentPress = (establishmentId: string) => {
    navigation.navigate('EstablishmentScreen', { establishmentId });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <MenuController
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
      />

      <ImageBackground
        source={backgroundImage}
        style={styles.fixedBackground}
      >
        <View style={styles.headerOverlay} />
      </ImageBackground>

      <SafeAreaView style={styles.fixedHeaderContainer} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('LocationSelection')}
          >
            <ArrowLeftIcon width={width * 0.1} height={width * 0.1} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
            <MenuIcon width={width * 0.1} height={width * 0.1} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="never"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          overScrollMode="never"
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer} />

          <View style={styles.contentContainer}>
            <Text style={styles.heroTitle}>{i18n.t('home.explore')} {locationName}</Text>

            <View style={styles.searchContainer}>
              <SearchBar
                placeholder={i18n.t('home.searchPlaceholder')}
                value={searchQuery}
                onChangeText={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                style={styles.searchBar}
              />

              <SearchDropdown
                results={searchResults}
                onSelectEstablishment={handleSelectEstablishment}
                onShowAllResults={handleShowAllResults}
                visible={isSearchFocused && searchQuery.trim() !== ''}
              />
            </View>

            <CategoriesGrid
              categories={categories}
              onCategoryPress={handleCategoryPress}
            />

            <EstablishmentSection
              title={i18n.t('home.recommended')}
              establishments={recommendedEstablishments}
              onEstablishmentPress={handleEstablishmentPress}
            />

            <EstablishmentSection
              title={i18n.t('home.mostPopular')}
              establishments={popularEstablishments}
              onEstablishmentPress={handleEstablishmentPress}
            />

            <EstablishmentSection
              title={i18n.t('home.topRated')}
              establishments={topRatedEstablishments}
              onEstablishmentPress={handleEstablishmentPress}
            />

            <EstablishmentSection
              title={i18n.t('home.trendingNow')}
              establishments={trendingEstablishments}
              onEstablishmentPress={handleEstablishmentPress}
            />

            <EstablishmentSection
              title={i18n.t('home.premiumSelection')}
              establishments={featuredEstablishments}
              onEstablishmentPress={handleEstablishmentPress}
            />

            <EstablishmentSection
              title={i18n.t('home.discover')}
              establishments={newEstablishments}
              onEstablishmentPress={handleEstablishmentPress}
            />

            <View style={{ height: 100 }} />
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.floatingMapButton}
          onPress={() => {
            navigation.navigate('MapScreen', {
              selectedLocation: selectedLocation || undefined
            });
          }}
        >
          <LandLayerLocationIcon
            width={width * 0.045}
            height={width * 0.045}
            fill="#FFFFFF"
            style={{ marginRight: width * 0.02 }}
          />
          <Text style={styles.floatingMapButtonText}>{i18n.t('home.seeMap')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    backgroundColor: 'transparent',
  },
  fixedBackground: {
    position: 'absolute',
    height: height * 0.45,
    width: '100%',
    top: 0,
    left: 0,
  },
  fixedHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerOverlay: {
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
  },
  headerContainer: {
    height: width * 0.5,
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: width * 0.04,
  },
  backButton: {
    width: width * 0.12,
    height: width * 0.18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    width: width * 0.12,
    height: width * 0.18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: 'white',
    paddingHorizontal: width * 0.06,
    paddingTop: width * 0.06,
    paddingBottom: width * 0.2,
  },
  heroTitle: {
    fontSize: width * 0.045,
    fontFamily: 'EuclidSquare-SemiBold',
    marginBottom: width * 0.03,
    color: '#1A1A2E',
  },
  searchContainer: {
    position: 'relative',
    zIndex: 100,
    marginBottom: width * 0.04,
  },
  searchBar: {},
  floatingMapButton: {
    position: 'absolute',
    bottom: width * 0.30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00B383',
    paddingVertical: width * 0.030,
    paddingHorizontal: width * 0.07,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingMapButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Medium',
  },
});

export default HomeScreen;