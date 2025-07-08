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
import { useAuth } from '../context/AuthContext';

// Import UIIcon
import i18n from '../i18n';
import { UIIcon } from './icons/IconSystem'; // ✅ Solo UIIcon necesario

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

  // Función para generar iniciales desde el email
  const getInitialsFromEmail = (email: string): string => {
    if (!email) return 'U';
    const username = email.split('@')[0];
    // Tomar las primeras dos letras del username
    return username.substring(0, 2).toUpperCase();
  };

  // Función para obtener el nombre a mostrar
  const getDisplayName = () => {
    if (userData?.displayName && userData.displayName.trim()) {
      return userData.displayName;
    }

    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName} ${userData.lastName}`.trim();
    }

    if (userData?.firstName && userData.firstName.trim()) {
      return userData.firstName;
    }

    if (userData?.email) {
      // Extraer el nombre del usuario del email (parte antes del @)
      const username = userData.email.split('@')[0];
      // Capitalizar la primera letra y formatear
      return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
    }

    return i18n.t('menu.user'); // "Usuario" o "User" según idioma
  };

  // Función para mostrar el saludo personalizado
  const getGreeting = () => {
    const displayName = getDisplayName();
    return i18n.t('menu.hello', { name: displayName }); // "Hola, {name}" o "Hello, {name}"
  };

  // Función para verificar si necesita completar perfil
  const needsProfileCompletion = () => {
    if (isGoogleUser()) return false;

    return !userData?.displayName ||
      !userData?.displayName.trim() ||
      (!userData?.firstName && !userData?.lastName);
  };

  // Actualizar datos de usuario directamente desde AuthContext
  useEffect(() => {
    if (auth.userData) {
      setUserData(auth.userData);
    } else if (auth.user) {
      // Usar datos del usuario de Firebase si no hay userData
      setUserData({
        displayName: auth.user.displayName || '',
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
        iconName: 'love', // ✅ Usar nombre de UIIcon
        onPress: () => navigation.navigate('MyFavoritesScreen'),
      },
      {
        id: 'settings',
        title: i18n.t('menu.settings'),
        iconName: 'settings', // ✅ Usar nombre de UIIcon
        onPress: () => navigation.navigate('SettingsScreen'),
      },
    ];

    // Solo agregar perfil si NO es usuario de Google
    if (!isGoogleUser()) {
      return [
        {
          id: 'profile',
          title: i18n.t('menu.myProfile'),
          iconName: 'user', // ✅ Usar nombre de UIIcon
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
                {/* ✅ REEMPLAZAR CloseIcon por UIIcon */}
                <UIIcon name="close" size={width * 0.07} color="#915A17" />
              </TouchableOpacity>
            </View>

            {/* Información del usuario */}
            <View style={styles.userInfoContainer}>
              <View style={styles.userAvatar}>
                {userData?.photoURL ? (
                  <Image
                    source={{ uri: userData.photoURL }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitials}>
                      {getInitialsFromEmail(userData?.email || '')}
                    </Text>
                  </View>
                )}
              </View>

              {/* Usar el nombre personalizado */}
              <Text style={styles.userName}>{getDisplayName()}</Text>
              <Text style={styles.userEmail}>{userData?.email || ''}</Text>

              {/* Mostrar indicador si necesita completar perfil */}
              {needsProfileCompletion() && (
                <TouchableOpacity
                  style={styles.completeProfileButton}
                  onPress={() => {
                    onClose();
                    navigation.navigate('ProfileScreen');
                  }}
                >
                  <Text style={styles.completeProfileText}>
                    {i18n.t('menu.completeProfile')}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Botón de editar perfil normal para usuarios no-Google */}
              {!isGoogleUser() && !needsProfileCompletion() && (
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
                    {/* ✅ REEMPLAZAR SVG por UIIcon */}
                    <UIIcon
                      name={item.iconName}
                      size={width * 0.06}
                      color="#915A17"
                    />
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </View>
                  {/* ✅ REEMPLAZAR ArrowRightIcon con fondo */}
                  <View style={styles.arrowBackground}>
                    <UIIcon
                      name="arrow-right"
                      size={width * 0.035}
                      color="#343A40"
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Footer con botón de logout */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                {/* ✅ REEMPLAZAR LogoutIcon por UIIcon */}
                <UIIcon name="logout" size={width * 0.06} color="#915A17" />
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
  avatarFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
  },
  avatarInitials: {
    fontSize: width * 0.08,
    fontFamily: 'EuclidSquare-SemiBold',
    color: 'white',
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
  completeProfileButton: {
    paddingVertical: width * 0.02,
    paddingHorizontal: width * 0.04,
    backgroundColor: '#4A90E2',
    borderRadius: 50,
  },
  completeProfileText: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Medium',
    color: 'white',
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
  // ✅ NUEVO ESTILO PARA EL FONDO DE LA FLECHA
  arrowBackground: {
    width: width * 0.08,
    height: width * 0.08,
    backgroundColor: '#DEE2E6', // ✅ Fondo gris claro
    borderRadius: width * 0.04,
    justifyContent: 'center',
    alignItems: 'center',
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