// MenuController.tsx - Versión temporal sin AuthContext
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SideMenu from './SideMenu';
import GuestMenu from './GuestMenu';

interface MenuControllerProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

const MenuController: React.FC<MenuControllerProps> = ({ visible, onClose, navigation }) => {
  const [isGuest, setIsGuest] = useState(true); // Por defecto, mostrar el menú de invitado
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('@goldenbook_auth_token');
        // Si hay un token, no es invitado
        setIsGuest(!token);
      } catch (error) {
        console.error('Error checking auth status:', error);
        // En caso de error, asumir invitado
        setIsGuest(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (visible) {
      checkAuthStatus();
    }
  }, [visible]);

  if (isLoading) {
    return null;
  }

  return isGuest ? (
    <GuestMenu visible={visible} onClose={onClose} navigation={navigation} />
  ) : (
    <SideMenu visible={visible} onClose={onClose} navigation={navigation} />
  );
};

export default MenuController;