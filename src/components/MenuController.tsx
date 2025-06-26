import React from 'react';
import { useAuth } from '../context/AuthContext';
import GuestMenu from './GuestMenu';
import SideMenu from './SideMenu';

interface MenuControllerProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

const MenuController: React.FC<MenuControllerProps> = ({ visible, onClose, navigation }) => {
  try {
    const { isGuest, isLoading, user } = useAuth();

    // Si el menú no es visible, no mostrar nada
    if (!visible) {
      return null;
    }

    // Si está cargando, no mostrar nada por ahora
    if (isLoading) {
      return null;
    }

    // Decisión más explícita:
    const shouldShowGuestMenu = !user || isGuest;

    if (shouldShowGuestMenu) {
      return <GuestMenu visible={visible} onClose={onClose} navigation={navigation} />;
    } else {
      return <SideMenu visible={visible} onClose={onClose} navigation={navigation} />;
    }
  } catch (error) {
    console.error("Error en MenuController:", error);

    // En caso de error, mostrar el GuestMenu por defecto
    return <GuestMenu visible={visible} onClose={onClose} navigation={navigation} />;
  }
};

export default MenuController;