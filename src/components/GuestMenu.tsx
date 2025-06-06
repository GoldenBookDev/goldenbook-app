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
import i18n from '../i18n'; // Importar i18n

// Import SVG components
import ArrowRightIcon from '../assets/images/icons/arrow-right-bg.svg';
import CloseIcon from '../assets/images/icons/close.svg';
import LoginIcon from '../assets/images/icons/login.svg'; 
import UserIcon from '../assets/images/icons/user.svg';

const { width, height } = Dimensions.get('window');

interface GuestMenuProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

const GuestMenu: React.FC<GuestMenuProps> = ({ visible, onClose, navigation }) => {
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

  const menuItems = [
    {
      id: 'login',
      title: i18n.t('menu.signIn'),
      icon: LoginIcon,
      onPress: () => navigation.navigate('LoginStep1'),
    },
    {
      id: 'register',
      title: i18n.t('menu.createAccount'),
      icon: UserIcon,
      onPress: () => navigation.navigate('Register'),
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

            <View style={styles.guestInfoContainer}>
              <View style={styles.userAvatar}>
                <Image 
                  source={require('../assets/images/default-avatar.png')} 
                  style={styles.avatarImage} 
                />
              </View>
              <Text style={styles.guestTitle}>{i18n.t('menu.welcomeTitle')}</Text>
              <Text style={styles.guestSubtitle}>{i18n.t('menu.welcomeSubtitle')}</Text>
              <View style={styles.authButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.authButton, styles.signInButton]}
                  onPress={() => {
                    onClose();
                    navigation.navigate('LoginStep1');
                  }}
                >
                  <Text style={styles.signInButtonText}>{i18n.t('menu.signIn')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.authButton, styles.registerButton]}
                  onPress={() => {
                    onClose();
                    navigation.navigate('Register');
                  }}
                >
                  <Text style={styles.registerButtonText}>{i18n.t('menu.register')}</Text>
                </TouchableOpacity>
              </View>
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
              <Text style={styles.versionText}>{i18n.t('menu.version')}</Text>
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
  guestInfoContainer: {
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
  guestTitle: {
    fontSize: width * 0.045,
    fontFamily: 'EuclidSquare-SemiBold',
    color: '#1A1A2E',
    marginBottom: width * 0.01,
  },
  guestSubtitle: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
    marginBottom: width * 0.03,
  },
  authButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: width * 0.02,
  },
  authButton: {
    paddingVertical: width * 0.02,
    paddingHorizontal: width * 0.04,
    borderRadius: 50,
    minWidth: width * 0.25,
    alignItems: 'center',
    marginHorizontal: width * 0.02,
  },
  signInButton: {
    backgroundColor: '#E8A756', // Golden color to match your theme
  },
  registerButton: {
    backgroundColor: '#F5F5F5',
  },
  signInButtonText: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Medium',
    color: '#FFFFFF',
  },
  registerButtonText: {
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
  versionText: {
    fontSize: width * 0.03,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
    textAlign: 'center',
    marginTop: width * 0.04,
  },
});

export default GuestMenu;