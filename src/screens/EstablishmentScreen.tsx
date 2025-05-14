import React, { useState, useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/navigationTypes';
import { getEstablishmentById } from '../services/firestoreService';

import ArrowLeftIcon from '../assets/images/icons/arrow-left-bg.svg';
import PhoneIcon from '../assets/images/icons/phone.svg';
import EmailIcon from '../assets/images/icons/emailIcon.svg';
import LocationIcon from '../assets/images/icons/location_icon.svg';
import ClockIcon from '../assets/images/icons/clockIcon.svg';
import GoArrowIcon from '../assets/images/icons/go_arrow.svg';
import HeartIcon from '../assets/images/icons/heart_white.svg';
import ShareIcon from '../assets/images/icons/share.svg';
import WalkingIcon from '../assets/images/icons/walking.svg';
import ThumbIcon from '../assets/images/icons/thumb.svg';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'EstablishmentScreen'>;

const EstablishmentScreen: React.FC<Props> = ({ route, navigation }) => {
  const { establishmentId } = route.params;
  const [establishment, setEstablishment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Contacts' | 'Reservations'>('Overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEstablishmentById(establishmentId);
        setEstablishment(data);
      } catch (error) {
        console.error('Error fetching establishment:', error);
      }
    };
    fetchData();
  }, [establishmentId]);

  if (!establishment) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const renderOverview = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.sectionTitle}>About</Text>
      <Text style={styles.description}>{establishment.fullDescription}</Text>
      
      {establishment.gallery && establishment.gallery.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Gallery</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryContainer}>
            {establishment.gallery.map((imageUrl: string, index: number) => {
              // Handle Google Drive URLs
              const processedUrl = imageUrl.includes('drive.google.com/file/d/') 
                ? `https://drive.google.com/uc?export=view&id=${imageUrl.match(/\/d\/(.+?)\/view/)?.[1] || ''}`
                : imageUrl;
                
              return (
                <Image 
                  key={index} 
                  source={{ uri: processedUrl }} 
                  style={styles.galleryImage} 
                />
              );
            })}
          </ScrollView>
        </>
      )}
      
      {establishment.openingHours && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Opening Hours</Text>
          <View style={styles.infoRow}>
            <ClockIcon width={24} height={24} fill="#DAA520" />
            <Text style={styles.infoText}>{establishment.openingHours}</Text>
          </View>
        </View>
      )}
      
      {establishment.website && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Website</Text>
          <TouchableOpacity 
            style={styles.websiteButton}
            onPress={() => Linking.openURL(establishment.website.startsWith('http') 
              ? establishment.website 
              : `https://${establishment.website}`)}
          >
            <Text style={styles.websiteButtonText}>{establishment.website}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderContacts = () => (
    <View style={styles.contactsContainer}>
      <View style={styles.contactRow}>
        <View style={styles.iconCircle}>
          <LocationIcon width={20} height={20} fill="#DAA520" />
        </View>
        <View style={styles.contactContent}>
          <Text style={[styles.contactText, styles.addressText]}>
            {establishment.address}, {establishment.city}
          </Text>
          <View style={styles.walkingContainer}>
            <WalkingIcon width={14} height={14} fill="#777777" />
            <Text style={styles.subText}>2 minutes walking (320m)</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.goButton}>
          <GoArrowIcon width={18} height={18} fill="#FFFFFF" />
          <Text style={styles.goButtonText}>Ir</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.contactRow}>
        <View style={styles.iconCircle}>
          <PhoneIcon width={20} height={20} fill="#DAA520" />
        </View>
        <Text style={styles.contactText}>
          {establishment.phone || 'No phone available'}
        </Text>
      </View>
      
      <View style={styles.contactRow}>
        <View style={styles.iconCircle}>
          <EmailIcon width={20} height={20} fill="#DAA520" />
        </View>
        <Text style={styles.contactText}>
          {establishment.email || 'No email available'}
        </Text>
      </View>
      
      <View style={styles.contactRow} key="lastContactRow">
        <View style={styles.iconCircle}>
          <ClockIcon width={20} height={20} fill="#DAA520" />
        </View>
        <View style={styles.scheduleContainer}>
          <Text style={[styles.contactText, styles.openNowText]}>
            Open now
          </Text>
          <Text style={styles.closeTimeText}>• Closes 23:30</Text>
        </View>
      </View>
      
      <View style={styles.footerContainer}>
        <Text style={styles.exclusiveGuestCare}>Exclusive guest care</Text>
        <TouchableOpacity style={styles.reserveNowButton}>
          <Text style={styles.reserveNowText}>Reserve now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReservations = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.reservationsTitle}>Make a Reservation</Text>
      <Text style={styles.reservationsDescription}>
        Book your spot at {establishment.name} and enjoy a wonderful experience.
      </Text>
      
      {establishment.reservationLink ? (
        <TouchableOpacity 
          onPress={() => Linking.openURL(establishment.reservationLink)} 
          style={styles.reserveButton}
        >
          <Text style={styles.reserveText}>Reserve Now</Text>
        </TouchableOpacity>
      ) : (
        <>
          <Text style={styles.noReservationsText}>
            Online reservations are not available for this establishment.
          </Text>
          {establishment.phone && (
            <View style={styles.phoneReservation}>
              <Text style={styles.phoneReservationText}>
                You can make a reservation by phone:
              </Text>
              <TouchableOpacity
                style={styles.phoneButton}
                onPress={() => Linking.openURL(`tel:${establishment.phone}`)}
              >
                <PhoneIcon width={20} height={20} fill="#FFF" style={styles.phoneButtonIcon} />
                <Text style={styles.phoneButtonText}>{establishment.phone}</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
          
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return renderOverview();
      case 'Contacts':
        return renderContacts();
      case 'Reservations':
        return renderReservations();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: establishment.mainImage }}
          style={styles.image}
        />
        <SafeAreaView style={styles.safeHeaderContent} edges={['top']}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeftIcon width={width * 0.1} height={width * 0.1} />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIconButton}>
              <ShareIcon width={20} height={20}  />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconButton}>
              <HeartIcon width={20} height={20} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{establishment.name.charAt(0).toUpperCase() + establishment.name.slice(1).toLowerCase()}</Text>
          <View style={styles.reviewContainer}>
            <ThumbIcon width={18} height={18} fill="#DAA520" style={{ marginRight: 4 }} />
            <Text style={styles.reviewCount}>{establishment.reviewCount}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.tabContainer}>
        {['Overview', 'Contacts', 'Reservations'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab, 
              activeTab === tab && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab as 'Overview' | 'Contacts' | 'Reservations')}
          >
            <Text 
              style={[
                styles.tabText, 
                activeTab === tab && styles.activeTabText
              ]}
            >
              {tab}
            </Text>
            {activeTab === tab && (
              <View style={styles.activeTabIndicator}>
                <View style={styles.activeTabLine} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      <SafeAreaView style={styles.safeContent} edges={['bottom', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderContent()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeHeaderContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  safeContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: width * 0.05,
    fontFamily: 'EuclidSquare-Regular',
  },
  header: {
    position: 'relative',
  },
  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  headerActions: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: 'rgba(70, 70, 70, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  image: {
    width: '100%',
    height: width * 0.85,
    resizeMode: 'cover',
    marginTop: -50, // Extend image upward to cover the status bar area
  },
  titleContainer: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: 'rgba(22, 27, 51, 0.8)',  // Changed to #0B3459 with 80% opacity
  },
  title: {
    fontSize: width * 0.06,
    fontFamily: 'EuclidSquare-SemiBold',
    color: '#FFFFFF',
  },
  reviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCount: {
    color: '#FFFFFF',
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    position: 'relative',
  },
  tabText: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#999999',
  },
  activeTab: {
    borderBottomColor: '#DAA520',
  },
  activeTabText: {
    color: '#1A1A2E',
    fontFamily: 'EuclidSquare-Medium',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 3,
    alignItems: 'center',
  },
  activeTabLine: {
    width: '50%',
    height: 3,
    backgroundColor: '#DAA520',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60, // Add padding for the fixed reservation button
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Medium',
    color: '#1A1A2E',
    marginBottom: 10,
    marginTop: 15,
  },
  description: {
    fontSize: width * 0.035,
    lineHeight: width * 0.05,
    fontFamily: 'EuclidSquare-Regular',
    color: '#666666',
    marginBottom: 15,
  },
  galleryContainer: {
    marginVertical: 10,
  },
  galleryImage: {
    width: width * 0.4,
    height: width * 0.3,
    marginRight: 10,
    borderRadius: 8,
  },
  infoSection: {
    marginTop: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#666666',
  },
  websiteButton: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  websiteButtonText: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Medium',
    color: '#1A1A2E',
  },
  contactsContainer: {
    padding: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactContent: {
    flex: 1,
    marginLeft: 15,
  },
  contactText: {
    flex: 1,
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#915A17',
    marginLeft: 15,
  },
  addressText: {
    color: 'black',
  },
  walkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  subText: {
    fontSize: width * 0.03,
    fontFamily: 'EuclidSquare-Regular',
    color: '#777777',
    marginLeft: 4,
  },
  goButton: {
    backgroundColor: '#DAA520',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  goButtonText: {
    color: '#FFFFFF',
    marginLeft: 4,
    fontFamily: 'EuclidSquare-Medium',
    fontSize: width * 0.035,
  },
  reservationsTitle: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-SemiBold',
    color: '#1A1A2E',
    marginBottom: 10,
  },
  reservationsDescription: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#666666',
    marginBottom: 25,
  },
  reserveButton: {
    backgroundColor: '#00B383',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  reserveText: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Medium',
    color: '#FFFFFF',
  },
  noReservationsText: {
    fontSize: width * 0.035,
    color: '#666666',
    fontFamily: 'EuclidSquare-Regular',
    marginVertical: 15,
  },
  phoneReservation: {
    marginTop: 15,
  },
  phoneReservationText: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#1A1A2E',
    marginBottom: 10,
  },
  phoneButton: {
    flexDirection: 'row',
    backgroundColor: '#00B383',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneButtonIcon: {
    marginRight: 10,
  },
  phoneButtonText: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Medium',
    color: '#FFFFFF',
  },
  fixedReservationButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginTop: 30,
  },
  scheduleContainer: {
    flex: 1, 
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  openNowText: {
    color: '#00B383',
    marginRight: 4,
  },
  closeTimeText: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#777777',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  exclusiveGuestCare: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Medium',
    color: '#1A1A2E',
  },
  reserveNowButton: {
    backgroundColor: '#00B383',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  reserveNowText: {
    color: '#FFFFFF',
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Medium',
  },
  reservarAgoraButton: {
    backgroundColor: '#00B383',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  reservarAgoraText: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Medium',
    color: '#FFFFFF',
  },
});

export default EstablishmentScreen;