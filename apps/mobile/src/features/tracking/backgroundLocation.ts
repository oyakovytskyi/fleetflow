import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import type { PostLocationRequestDto } from '@fleetflow/shared-types';

import { LOCATION_DISTANCE_INTERVAL_M, LOCATION_INTERVAL_MS, STORAGE_KEYS } from '@/src/constants';
import { postLocation } from '@/src/features/tracking/api';
import { enqueueLocation } from '@/src/services/locationQueue';

export const BACKGROUND_LOCATION_TASK = 'fleetflow-background-location';

/** Expo Go cannot run background location tasks — needs an EAS development build. */
export function canUseBackgroundLocation(): boolean {
  return Constants.appOwnership !== 'expo' && Platform.OS !== 'web';
}

async function persistActiveDeliveryId(deliveryId: string | null): Promise<void> {
  if (deliveryId) {
    await AsyncStorage.setItem(STORAGE_KEYS.activeDeliveryId, deliveryId);
  } else {
    await AsyncStorage.removeItem(STORAGE_KEYS.activeDeliveryId);
  }
}

async function readActiveDeliveryId(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.activeDeliveryId);
}

async function ingestLocations(locations: Location.LocationObject[]): Promise<void> {
  const deliveryId = await readActiveDeliveryId();
  if (!deliveryId || locations.length === 0) return;

  for (const position of locations) {
    const payload: PostLocationRequestDto = {
      deliveryId,
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy ?? undefined,
      speed: position.coords.speed ?? undefined,
      heading: position.coords.heading ?? undefined,
      timestamp: position.timestamp,
    };

    try {
      await postLocation(payload);
    } catch {
      await enqueueLocation(payload);
    }
  }
}

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.warn('[background-location]', error.message);
    return;
  }
  const payload = data as { locations?: Location.LocationObject[] } | undefined;
  if (!payload?.locations?.length) return;
  await ingestLocations(payload.locations);
});

export async function requestBackgroundLocationPermission(): Promise<boolean> {
  const foreground = await Location.getForegroundPermissionsAsync();
  if (!foreground.granted) {
    const asked = await Location.requestForegroundPermissionsAsync();
    if (!asked.granted) return false;
  }

  const background = await Location.getBackgroundPermissionsAsync();
  if (background.granted) return true;

  const askedBg = await Location.requestBackgroundPermissionsAsync();
  return askedBg.granted;
}

export async function isBackgroundLocationRunning(): Promise<boolean> {
  return Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
}

/**
 * Starts OS background location updates for an active delivery.
 * No-ops in Expo Go — callers should keep the foreground watch there.
 */
export async function startBackgroundLocation(deliveryId: string): Promise<'started' | 'unavailable' | 'denied'> {
  if (!canUseBackgroundLocation()) return 'unavailable';

  const allowed = await requestBackgroundLocationPermission();
  if (!allowed) return 'denied';

  await persistActiveDeliveryId(deliveryId);

  const already = await isBackgroundLocationRunning();
  if (already) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: LOCATION_INTERVAL_MS,
    distanceInterval: LOCATION_DISTANCE_INTERVAL_M,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'FleetFlow',
      notificationBody: 'Sharing GPS for your active delivery',
      notificationColor: '#2f6fed',
    },
  });

  return 'started';
}

export async function stopBackgroundLocation(): Promise<void> {
  await persistActiveDeliveryId(null);
  if (!canUseBackgroundLocation()) return;
  const running = await isBackgroundLocationRunning();
  if (running) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
}
