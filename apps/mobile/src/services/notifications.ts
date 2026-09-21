import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { DeliveryLifecycleEvent } from '@fleetflow/shared-types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let permissionReady: Promise<boolean> | null = null;

export async function ensureNotificationPermission(): Promise<boolean> {
  permissionReady ??= (async () => {
    if (Platform.OS === 'web') return false;
    const current = await Notifications.getPermissionsAsync();
    if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
      return true;
    }
    const asked = await Notifications.requestPermissionsAsync();
    return Boolean(
      asked.granted || asked.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL,
    );
  })();
  return permissionReady;
}

const TITLES: Record<DeliveryLifecycleEvent['type'], string> = {
  'delivery.created': 'New delivery available',
  'delivery.assigned': 'Delivery assigned',
  'delivery.started': 'Delivery started',
  'delivery.completed': 'Delivery completed',
  'delivery.cancelled': 'Delivery cancelled',
};

export async function notifyDeliveryEvent(event: DeliveryLifecycleEvent): Promise<void> {
  const allowed = await ensureNotificationPermission();
  if (!allowed) return;

  const delivery = event.payload.delivery;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: TITLES[event.type],
      body: delivery.title,
      data: {
        type: event.type,
        deliveryId: delivery.id,
      },
    },
    trigger: null,
  });
}
