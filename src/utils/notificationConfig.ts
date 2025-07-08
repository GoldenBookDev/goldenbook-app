// utils/notificationConfig.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ✅ MEJORADO: Configuración global de notificaciones
export const configureNotifications = async () => {
  try {
    // Configurar handler global
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // ✅ MEJORADO: Configurar categorías solo en iOS y con async
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync('order', [
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

      await Notifications.setNotificationCategoryAsync('promotion', [
        {
          identifier: 'view_offer',
          buttonTitle: 'Ver Oferta',
          options: {
            opensAppToForeground: true,
          },
        },
      ]);

      // ✅ NUEVO: Categoría para Goldenbook
      await Notifications.setNotificationCategoryAsync('goldenbook', [
        {
          identifier: 'view_establishment',
          buttonTitle: 'Ver Establecimiento',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: 'save_place',
          buttonTitle: 'Guardar Lugar',
          options: {
            opensAppToForeground: false,
          },
        },
      ]);
    }

  } catch (error) {
    console.error('❌ Error configuring notifications:', error);
  }
};

// ✅ MEJORADO: Tipos de notificaciones para Goldenbook
export const NotificationTypes = {
  ORDER_STATUS: 'order_status',
  PROMOTION: 'promotion',
  REMINDER: 'reminder',
  GENERAL: 'general',
  // ✅ NUEVOS: Específicos para Goldenbook
  ESTABLISHMENT_RECOMMENDATION: 'establishment_recommendation',
  LOCATION_UPDATE: 'location_update',
  REVIEW_REMINDER: 'review_reminder',
  NEARBY_PLACES: 'nearby_places',
} as const;

export type NotificationType = typeof NotificationTypes[keyof typeof NotificationTypes];

// ✅ MEJORADO: Helper con mejor manejo de errores
export const scheduleLocalNotification = async (
  title: string,
  body: string,
  data?: any,
  trigger?: Notifications.NotificationTriggerInput,
  categoryIdentifier?: string
) => {
  try {
    // ✅ Verificar permisos antes de programar
    const { status } = await Notifications.getPermissionsAsync();
    
    if (status !== 'granted') {
      console.warn('⚠️ Notification permissions not granted');
      return null;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
        badge: 1,
        categoryIdentifier, // ✅ AÑADIDO: Soporte para categorías
      },
      trigger: trigger || null,
    });
    
    return id;
  } catch (error) {
    console.error('❌ Error scheduling notification:', error);
    return null;
  }
};

// ✅ NUEVO: Helper específico para notificaciones de Goldenbook
export const scheduleGoldenbookNotification = async (
  type: NotificationType,
  title: string,
  body: string,
  establishmentData?: any,
  delayMinutes?: number
) => {
  const trigger: Notifications.NotificationTriggerInput | null = delayMinutes 
    ? { 
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL as Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delayMinutes * 60 
      } as Notifications.TimeIntervalTriggerInput
    : null;

  return await scheduleLocalNotification(
    title,
    body,
    {
      type,
      establishmentData,
      timestamp: Date.now(),
    },
    trigger,
    'goldenbook'
  );
};

// Helper para cancelar notificaciones (sin cambios)
export const cancelNotification = async (notificationId: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('❌ Error canceling notification:', error);
  }
};

// Helper para cancelar todas las notificaciones (sin cambios)
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('❌ Error canceling all notifications:', error);
  }
};

// ✅ NUEVO: Helper para obtener notificaciones pendientes
export const getPendingNotifications = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error('❌ Error getting pending notifications:', error);
    return [];
  }
};

// ✅ NUEVO: Helper para limpiar badge
export const clearBadge = async () => {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error('❌ Error clearing badge:', error);
  }
};