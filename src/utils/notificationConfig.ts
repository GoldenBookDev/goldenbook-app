// utils/notificationConfig.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configuración global de notificaciones
export const configureNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Configurar categorías de notificaciones (opcional)
  if (Platform.OS === 'ios') {
    Notifications.setNotificationCategoryAsync('order', [
      {
        identifier: 'view_order',
        buttonTitle: 'Ver Pedido',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'dismiss',
        buttonTitle: 'Dispensar',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);

    Notifications.setNotificationCategoryAsync('promotion', [
      {
        identifier: 'view_offer',
        buttonTitle: 'Ver Oferta',
        options: {
          opensAppToForeground: true,
        },
      },
    ]);
  }
};

// Tipos de notificaciones para tu app
export const NotificationTypes = {
  ORDER_STATUS: 'order_status',
  PROMOTION: 'promotion',
  REMINDER: 'reminder',
  GENERAL: 'general',
} as const;

// Helper para programar notificaciones locales
export const scheduleLocalNotification = async (
  title: string,
  body: string,
  data?: any,
  trigger?: Notifications.NotificationTriggerInput
) => {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
        badge: 1,
      },
      trigger: trigger || null, // null = mostrar inmediatamente
    });
    
    return id;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

// Helper para cancelar notificaciones
export const cancelNotification = async (notificationId: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

// Helper para cancelar todas las notificaciones
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};