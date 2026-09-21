import { useCallback, useRef, useState } from 'react';

import {
  canUseBackgroundLocation,
  startBackgroundLocation,
  stopBackgroundLocation,
} from '@/src/features/tracking/backgroundLocation';
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

export type BackgroundTrackingMode = 'foreground-only' | 'background' | 'denied';

/**
 * Starts/stops GPS for an active delivery.
 * Prefers background updates on EAS/dev builds; Expo Go stays foreground-only.
 */
export function useDeliveryTracking() {
  const dispatch = useAppDispatch();
  const isTracking = useAppSelector(selectIsTracking);
  const isOnline = useAppSelector(selectIsOnline);
  const deliveryIdRef = useRef<string | null>(null);
  const onlineRef = useRef(isOnline);
  onlineRef.current = isOnline;
  const [backgroundMode, setBackgroundMode] = useState<BackgroundTrackingMode>(
    canUseBackgroundLocation() ? 'foreground-only' : 'foreground-only',
  );

  const stopTracking = useCallback(async () => {
    deliveryIdRef.current = null;
    await stopBackgroundLocation();
    await stopLocationWatch();
    dispatch(trackingStopped());
  }, [dispatch]);

  const startTracking = useCallback(
    async (deliveryId: string) => {
      deliveryIdRef.current = deliveryId;
      dispatch(trackingStarted(deliveryId));

      try {
        const bg = await startBackgroundLocation(deliveryId);
        if (bg === 'started') {
          setBackgroundMode('background');
          // Still run a light foreground watch so the map "You" marker updates
          // while the app is open; background task covers backgrounded state.
        } else if (bg === 'denied') {
          setBackgroundMode('denied');
        } else {
          setBackgroundMode('foreground-only');
        }

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
        await stopBackgroundLocation();
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
    backgroundMode,
    canUseBackground: canUseBackgroundLocation(),
    startTracking,
    stopTracking,
  };
}
