import React from 'react';
import SideMenu from './SideMenu';
import GuestMenu from './GuestMenu';
import { useAuth } from '../context/AuthContext';

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
    
    // Decisión simplificada:
    // - Si no hay usuario o es invitado → GuestMenu
    // - Si hay usuario y no es invitado → SideMenu
    if (!user || isGuest) {
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