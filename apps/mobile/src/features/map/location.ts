import * as Location from 'expo-location';

import type { LatLng } from './region';

export type LocationPermission = 'granted' | 'denied' | 'undetermined';

export async function requestForegroundLocation(): Promise<LocationPermission> {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.granted) return 'granted';

  const asked = await Location.requestForegroundPermissionsAsync();
  if (asked.granted) return 'granted';
  if (asked.canAskAgain === false) return 'denied';
  return 'undetermined';
}

export async function getCurrentCoords(): Promise<LatLng | null> {
  const permission = await requestForegroundLocation();
  if (permission !== 'granted') return null;

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}
