import React, { useEffect, useState } from 'react';
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
import { useAuth } from '../context/AuthContext'; // Importar useAuth

// Import SVG components
import ArrowRightIcon from '../assets/images/icons/arrow-right-bg.svg';
import CloseIcon from '../assets/images/icons/close.svg';
import HeartIcon from '../assets/images/icons/heart.svg';
import LogoutIcon from '../assets/images/icons/logout.svg';
import SettingsIcon from '../assets/images/icons/settings.svg';
import UserIcon from '../assets/images/icons/user.svg';
import i18n from '../i18n';

const { width, height } = Dimensions.get('window');

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

const SideMenu: React.FC<SideMenuProps> = ({ visible, onClose, navigation }) => {
  const slideAnim = React.useRef(new Animated.Value(-width)).current;
  const [userData, setUserData] = useState<any>(null);

  // Usar Auth Context en lugar de lógica interna
  const auth = useAuth();

  // Función para verificar si el usuario se logueó con Google
  const isGoogleUser = () => {
    return auth.user?.providerData?.some(provider => provider.providerId === 'google.com') || false;
  };

  // Actualizar datos de usuario directamente desde AuthContext
  useEffect(() => {
    if (auth.userData) {
      setUserData(auth.userData);
    } else if (auth.user) {
      // Usar datos del usuario de Firebase si no hay userData
      setUserData({
        displayName: auth.user.displayName || 'Usuario',
        email: auth.user.email || '',
        photoURL: auth.user.photoURL || null
      });
    } else {
      setUserData(null);
    }
  }, [auth.userData, auth.user]);

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
      // Usar la función de logout del AuthContext
      await auth.logout();

      console.log("Logout completado, redirigiendo a LoginStep1");

      // Navegar a la pantalla de login
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginStep1' }],
      });
    } catch (error) {
      console.error('Error durante el logout:', error);
    }
  };

  // Crear elementos del menú basado en el tipo de usuario
  const getMenuItems = () => {
    const baseItems = [
      {
        id: 'favorites',
        title: i18n.t('menu.myFavorites'),
        icon: HeartIcon,
        onPress: () => navigation.navigate('MyFavoritesScreen'),
      },
      {
        id: 'settings',
        title: i18n.t('menu.settings'),
        icon: SettingsIcon,
        onPress: () => navigation.navigate('SettingsScreen'),
      },
    ];

    // Solo agregar perfil si NO es usuario de Google
    if (!isGoogleUser()) {
      return [
        {
          id: 'profile',
          title: i18n.t('menu.myProfile'),
          icon: UserIcon,
          onPress: () => navigation.navigate('ProfileScreen'),
        },
        ...baseItems
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  // Si está cargando o no hay usuario, no mostrar nada
  if (auth.isLoading || (!userData && !auth.isGuest)) {
    return null;
  }

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

            {/* Información del usuario */}
            <View style={styles.userInfoContainer}>
              <View style={styles.userAvatar}>
                <Image
                  source={
                    userData?.photoURL
                      ? { uri: userData.photoURL }
                      : require('../assets/images/default-avatar.png')
                  }
                  style={styles.avatarImage}
                />
              </View>
              <Text style={styles.userName}>{userData?.displayName || 'John Doe'}</Text>
              <Text style={styles.userEmail}>{userData?.email || 'john.doe@example.com'}</Text>

              {/* Solo mostrar botón de editar perfil si NO es usuario de Google */}
              {!isGoogleUser() && (
                <TouchableOpacity
                  style={styles.editProfileButton}
                  onPress={() => {
                    onClose();
                    navigation.navigate('ProfileScreen');
                  }}
                >
                  <Text style={styles.editProfileText}>{i18n.t('menu.editProfile')}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Menú de opciones */}
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
                    <item.icon width={width * 0.06} height={width * 0.06} />
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </View>
                  <ArrowRightIcon width={width * 0.05} height={width * 0.05} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Footer con botón de logout */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LogoutIcon width={width * 0.06} height={width * 0.06} />
                <Text style={styles.logoutText}>{i18n.t('menu.logOut')}</Text>
              </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: width * 0.03,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
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
  googleUserText: {
    fontSize: width * 0.03,
    fontFamily: 'EuclidSquare-Medium',
    color: '#2E7D32',
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