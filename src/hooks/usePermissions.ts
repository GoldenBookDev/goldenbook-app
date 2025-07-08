import * as Notifications from 'expo-notifications';
import * as TrackingTransparency from 'expo-tracking-transparency';
import { useEffect, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import i18n from '../i18n';

interface PermissionStatus {
  notifications: boolean;
  tracking: boolean;
  isLoading: boolean;
  hasRequestedPermissions: boolean;
}

interface UsePermissionsOptions {
  requestOnMount?: boolean;
  onComplete?: () => void;
  showAlertOnDenied?: boolean;
}

const usePermissions = (options: UsePermissionsOptions = {}) => {
  const {
    requestOnMount = false,
    onComplete,
    showAlertOnDenied = true
  } = options;

  const [status, setStatus] = useState<PermissionStatus>({
    notifications: false,
    tracking: false,
    isLoading: false,
    hasRequestedPermissions: false,
  });

  // Verificar permisos actuales
  const checkCurrentPermissions = async () => {
    try {
      const notificationStatus = await Notifications.getPermissionsAsync();
      const trackingStatus = Platform.OS === 'ios' 
        ? await TrackingTransparency.getTrackingPermissionsAsync()
        : { status: 'granted' };

      setStatus(prev => ({
        ...prev,
        notifications: notificationStatus.status === 'granted',
        tracking: trackingStatus.status === 'granted',
      }));

      return {
        notifications: notificationStatus.status === 'granted',
        tracking: trackingStatus.status === 'granted',
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return {
        notifications: false,
        tracking: false,
      };
    }
  };

  // Solicitar permiso de notificaciones
  const requestNotificationPermission = async (): Promise<boolean> => {
    try {
      const currentStatus = await Notifications.getPermissionsAsync();
      
      if (currentStatus.status === 'granted') {
        return true;
      }

      if (currentStatus.status === 'denied') {
        if (showAlertOnDenied) {
          Alert.alert(
            i18n.t('permissions.notifications.denied.title'),
            i18n.t('permissions.notifications.denied.settingsMessage'),
            [
              { text: i18n.t('common.cancel'), style: 'cancel' },
              { 
                text: i18n.t('common.settings'), 
                onPress: () => Linking.openSettings()
              }
            ]
          );
        }
        return false;
      }

      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: false,
          allowCriticalAlerts: false,
          provideAppNotificationSettings: false,
          allowProvisional: false,
        },
      });

      const granted = status === 'granted';

      if (!granted && showAlertOnDenied) {
        Alert.alert(
          i18n.t('permissions.notifications.denied.title'),
          i18n.t('permissions.notifications.denied.message'),
          [{ text: i18n.t('common.ok'), style: 'default' }]
        );
      }

      return granted;
    } catch (error) {
      console.error('🔥 PERMISSIONS: Error requesting notification permission:', error);
      return false;
    }
  };

  // Solicitar permiso de tracking (solo iOS)
  const requestTrackingPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') {
      return true;
    }

    try {
      const { status: currentStatus } = await TrackingTransparency.getTrackingPermissionsAsync();
      
      if (currentStatus === 'granted') {
        return true;
      }

      if (currentStatus === 'denied') {
        return false;
      }

      // ✅ FORZAR REQUEST INCLUSO SI NO HAY TRACKING REAL
      const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();
      
      const granted = status === 'granted';
      return granted;
    } catch (error) {
      console.error('🔥 PERMISSIONS: Error requesting tracking permission:', error);
      return false;
    }
  };

  // ✅ CORREGIDO: Solicitar todos los permisos secuencialmente
  const requestAllPermissions = async () => {

    
    if (status.hasRequestedPermissions) {

      return status;
    }


    setStatus(prev => ({ ...prev, isLoading: true }));

    try {

      // 1. Solicitar notificaciones
      const notificationsGranted = await requestNotificationPermission();

      
      // 2. Solicitar tracking (solo iOS)
      let trackingGranted = true;
      if (Platform.OS === 'ios') {

        await new Promise(resolve => setTimeout(resolve, 500));
        trackingGranted = await requestTrackingPermission();
   
      } else {
        console.log('🔥 PERMISSIONS: Skipping tracking (not iOS)');
      }

      // ✅ ACTUALIZAR ESTADO FINAL
      const finalStatus = {
        notifications: notificationsGranted,
        tracking: trackingGranted,
        isLoading: false,
        hasRequestedPermissions: true,
      };


      setStatus(finalStatus);

      // ✅ LLAMAR CALLBACK DESPUÉS DE ACTUALIZAR ESTADO
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 100);

      return finalStatus;
    } catch (error) {
      console.error('🔥 PERMISSIONS: Error requesting permissions:', error);
      const errorStatus = {
        notifications: false,
        tracking: false,
        isLoading: false,
        hasRequestedPermissions: true,
      };
      
      setStatus(errorStatus);
      
      if (showAlertOnDenied) {
        Alert.alert(
          i18n.t('common.error'),
          i18n.t('permissions.error.message')
        );
      }

      // ✅ LLAMAR CALLBACK INCLUSO SI HAY ERROR
      setTimeout(() => {
        console.log('🔥 PERMISSIONS: Calling onComplete callback after error');
        if (onComplete) {
          onComplete();
        }
      }, 100);

      return errorStatus;
    }
  };

  // Configurar notificaciones si están habilitadas
  useEffect(() => {
    if (status.notifications) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }
  }, [status.notifications]);

  // Solicitar permisos automáticamente si está configurado
  useEffect(() => {
    if (requestOnMount && !status.hasRequestedPermissions) {
      const timer = setTimeout(() => {
        requestAllPermissions();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [requestOnMount, status.hasRequestedPermissions]);

  // Verificar permisos actuales al montar
  useEffect(() => {
    checkCurrentPermissions();
  }, []);

  return {
    ...status,
    requestAllPermissions,
    requestNotificationPermission,
    requestTrackingPermission,
    checkCurrentPermissions,
  };
};

export default usePermissions;