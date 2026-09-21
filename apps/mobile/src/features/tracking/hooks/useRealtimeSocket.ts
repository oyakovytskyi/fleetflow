import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import {
  isDeliveryLifecycleEvent,
  type DeliveryLifecycleEvent,
  type FleetWsEvent,
} from '@fleetflow/shared-types';

import { QUERY_KEYS } from '@/src/constants';
import { ensureNotificationPermission, notifyDeliveryEvent } from '@/src/services/notifications';
import { getAccessToken } from '@/src/services/tokenStorage';
import { websocketManager } from '@/src/services/websocketManager';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { selectIsHydrated, selectUser } from '@/src/store/slices/authSlice';
import { connectionStatusChanged } from '@/src/store/slices/trackingSlice';

function shouldNotifyUser(
  event: DeliveryLifecycleEvent,
  userId: string | undefined,
  role: string | undefined,
): boolean {
  const delivery = event.payload.delivery;

  if (event.type === 'delivery.created') {
    // Drivers get pinged for open jobs; admins already see the panel.
    return role === 'DRIVER';
  }

  if (event.type === 'delivery.assigned') {
    return role === 'DRIVER' && delivery.driverId === userId;
  }

  if (event.type === 'delivery.started' || event.type === 'delivery.completed') {
    // Notify admin when a driver progresses a job; driver already triggered it.
    return role === 'ADMIN';
  }

  if (event.type === 'delivery.cancelled') {
    return role === 'ADMIN' || delivery.driverId === userId;
  }

  return false;
}

/**
 * Keeps an authenticated live socket (DRIVER + ADMIN).
 * Invalidates delivery queries on lifecycle events and fires local notifications.
 */
export function useRealtimeSocket(): void {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const user = useAppSelector(selectUser);
  const hydrated = useAppSelector(selectIsHydrated);
  const signedIn = Boolean(user);

  useEffect(() => {
    return websocketManager.onStatus((status) => {
      dispatch(connectionStatusChanged(status));
    });
  }, [dispatch]);

  useEffect(() => {
    if (!signedIn) return;
    void ensureNotificationPermission();
  }, [signedIn]);

  useEffect(() => {
    if (!signedIn) return;

    return websocketManager.subscribe((event: FleetWsEvent) => {
      if (!isDeliveryLifecycleEvent(event)) return;

      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deliveries() });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.delivery(event.payload.delivery.id),
      });

      if (shouldNotifyUser(event, user?.id, user?.role)) {
        void notifyDeliveryEvent(event);
      }
    });
  }, [queryClient, signedIn, user?.id, user?.role]);

  useEffect(() => {
    let cancelled = false;

    async function sync(): Promise<void> {
      if (!hydrated || !signedIn) {
        websocketManager.disconnect();
        return;
      }

      const token = await getAccessToken();
      if (cancelled) return;

      if (!token) {
        websocketManager.disconnect();
        return;
      }

      websocketManager.connect(token);
    }

    void sync();

    return () => {
      cancelled = true;
      websocketManager.disconnect();
    };
  }, [hydrated, signedIn, user?.id]);
}
