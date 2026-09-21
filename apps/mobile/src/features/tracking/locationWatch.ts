import * as Location from 'expo-location';

import type { LocationSampleDto } from '@fleetflow/shared-types';

import {
  LOCATION_DISTANCE_INTERVAL_M,
  LOCATION_INTERVAL_MS,
} from '@/src/constants';

import { requestForegroundLocation } from '@/src/features/map/location';

type SampleHandler = (sample: LocationSampleDto) => void;

let subscription: Location.LocationSubscription | null = null;

export function isWatchingLocation(): boolean {
  return subscription !== null;
}

/**
 * Foreground GPS for an active delivery. Stops any previous watch first.
 */
export async function startLocationWatch(onSample: SampleHandler): Promise<void> {
  await stopLocationWatch();

  const permission = await requestForegroundLocation();
  if (permission !== 'granted') {
    throw new Error('Location permission is required to share GPS.');
  }

  subscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: LOCATION_INTERVAL_MS,
      distanceInterval: LOCATION_DISTANCE_INTERVAL_M,
    },
    (position) => {
      onSample({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy ?? undefined,
        speed: position.coords.speed ?? undefined,
        heading: position.coords.heading ?? undefined,
        timestamp: position.timestamp,
      });
    },
  );
}

export async function stopLocationWatch(): Promise<void> {
  if (subscription) {
    subscription.remove();
    subscription = null;
  }
}
