import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Import SVG components
import ArrowRightIcon from '../assets/images/icons/arrow-right-bg.svg';
import BookmarkIcon from '../assets/images/icons/bookmark.svg';
import CloseIcon from '../assets/images/icons/close.svg';
import HeartIcon from '../assets/images/icons/heart.svg';
import LogoutIcon from '../assets/images/icons/logout.svg';
import SettingsIcon from '../assets/images/icons/settings.svg';
import UserIcon from '../assets/images/icons/user.svg';

const { width, height } = Dimensions.get('window');

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

const SideMenu: React.FC<SideMenuProps> = ({ visible, onClose, navigation }) => {
  const slideAnim = React.useRef(new Animated.Value(-width)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@goldenbook_auth_token');
      await AsyncStorage.removeItem('@goldenbook_user_data');
      // Navigate to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginStep1Screen' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const menuItems = [
    {
      id: 'profile',
      title: 'My Profile',
      icon: UserIcon,
      onPress: () => navigation.navigate('ProfileScreen'),
    },
    {
      id: 'favorites',
      title: 'My Favorites',
      icon: HeartIcon,
      onPress: () => navigation.navigate('FavoritesScreen'),
    },
    {
      id: 'bookmarks',
      title: 'My Bookmarks',
      icon: BookmarkIcon,
      onPress: () => navigation.navigate('BookmarksScreen'),
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: SettingsIcon,
      onPress: () => navigation.navigate('SettingsScreen'),
    },
  ];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.menuContainer,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <CloseIcon width={width * 0.07} height={width * 0.07} />
              </TouchableOpacity>
            </View>

            <View style={styles.userInfoContainer}>
              <View style={styles.userAvatar}>
                <Image 
                  source={require('../assets/images/default-avatar.png')} 
                  style={styles.avatarImage} 
                />
              </View>
              <Text style={styles.userName}>John Doe</Text>
              <Text style={styles.userEmail}>john.doe@example.com</Text>
              <TouchableOpacity 
                style={styles.editProfileButton}
                onPress={() => {
                  onClose();
                  navigation.navigate('ProfileScreen');
                }}
              >
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.menuItems}>
              {menuItems.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.menuItem}
                  onPress={() => {
                    onClose();
                    item.onPress();
                  }}
                >
                  <View style={styles.menuItemLeft}>
                    <item.icon width={width * 0.06} height={width * 0.06}/>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </View>
                  <ArrowRightIcon width={width * 0.05} height={width * 0.05}/>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LogoutIcon width={width * 0.06} height={width * 0.06}/>
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>
              <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    width: width * 0.8,
    height: '100%',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: width * 0.04,
  },
  closeButton: {
    padding: width * 0.02,
  },
  userInfoContainer: {
    alignItems: 'center',
    padding: width * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: width * 0.04,
  },
  userAvatar: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: (width * 0.2) / 2,
    //backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: width * 0.03,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  userName: {
    fontSize: width * 0.045,
    fontFamily: 'EuclidSquare-SemiBold',
    color: '#1A1A2E',
    marginBottom: width * 0.01,
  },
  userEmail: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
    marginBottom: width * 0.03,
  },
  editProfileButton: {
    paddingVertical: width * 0.02,
    paddingHorizontal: width * 0.04,
    backgroundColor: '#F5F5F5',
    borderRadius: 50,
  },
  editProfileText: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Medium',
    color: '#1A1A2E',
  },
  menuItems: {
    flex: 1,
    paddingHorizontal: width * 0.04,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: width * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Medium',
    color: '#1A1A2E',
    marginLeft: width * 0.03,
  },
  footer: {
    padding: width * 0.04,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: width * 0.03,
  },
  logoutText: {
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Medium',
    color: '#E53935',
    marginLeft: width * 0.03,
  },
  versionText: {
    fontSize: width * 0.03,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
    textAlign: 'center',
    marginTop: width * 0.04,
  },
});

export default SideMenu;