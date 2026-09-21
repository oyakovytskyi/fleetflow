import { useCallback, useRef } from 'react';

import { postLocation } from '@/src/features/tracking/api';
import {
  isWatchingLocation,
  startLocationWatch,
  stopLocationWatch,
} from '@/src/features/tracking/locationWatch';
import { enqueueLocation } from '@/src/services/locationQueue';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { selectIsOnline } from '@/src/store/slices/networkSlice';
import {
  locationReceived,
  selectIsTracking,
  trackingFailed,
  trackingStarted,
  trackingStopped,
} from '@/src/store/slices/trackingSlice';

/**
 * Starts/stops foreground GPS and posts samples to the API while a delivery
 * is in progress. Offline / failed posts go into the AsyncStorage queue.
 */
export function useDeliveryTracking() {
  const dispatch = useAppDispatch();
  const isTracking = useAppSelector(selectIsTracking);
  const isOnline = useAppSelector(selectIsOnline);
  const deliveryIdRef = useRef<string | null>(null);
  const onlineRef = useRef(isOnline);
  onlineRef.current = isOnline;

  const stopTracking = useCallback(async () => {
    deliveryIdRef.current = null;
    await stopLocationWatch();
    dispatch(trackingStopped());
  }, [dispatch]);

  const startTracking = useCallback(
    async (deliveryId: string) => {
      deliveryIdRef.current = deliveryId;
      dispatch(trackingStarted(deliveryId));

      try {
        await startLocationWatch((sample) => {
          dispatch(locationReceived(sample));

          const activeId = deliveryIdRef.current;
          if (!activeId) return;

          const payload = { ...sample, deliveryId: activeId };

          if (!onlineRef.current) {
            void enqueueLocation(payload);
            return;
          }

          void postLocation(payload).catch(() => {
            void enqueueLocation(payload);
          });
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not start GPS tracking.';
        await stopLocationWatch();
        dispatch(trackingFailed(message));
        throw err;
      }
    },
    [dispatch],
  );

  return {
    isTracking,
    isWatching: isWatchingLocation(),
    startTracking,
    stopTracking,
  };
}
