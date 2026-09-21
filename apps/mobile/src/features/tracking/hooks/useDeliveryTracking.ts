import { useCallback, useRef } from 'react';

import { postLocation } from '@/src/features/tracking/api';
import {
  isWatchingLocation,
  startLocationWatch,
  stopLocationWatch,
} from '@/src/features/tracking/locationWatch';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
  locationReceived,
  selectIsTracking,
  trackingFailed,
  trackingStarted,
  trackingStopped,
} from '@/src/store/slices/trackingSlice';

/**
 * Starts/stops foreground GPS and posts samples to the API while a delivery
 * is in progress. Safe to call start twice for the same delivery.
 */
export function useDeliveryTracking() {
  const dispatch = useAppDispatch();
  const isTracking = useAppSelector(selectIsTracking);
  const deliveryIdRef = useRef<string | null>(null);
  const postingRef = useRef(false);

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
          if (!activeId || postingRef.current) return;

          postingRef.current = true;
          void postLocation({ ...sample, deliveryId: activeId })
            .catch(() => {
              // Keep watching; offline queue lands in Sprint 7.
            })
            .finally(() => {
              postingRef.current = false;
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
