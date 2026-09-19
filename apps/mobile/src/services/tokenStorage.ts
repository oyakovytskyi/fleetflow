import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { STORAGE_KEYS } from '@/src/constants';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Expo Go / web can ship a SecureStore JS shim whose native methods are
 * missing (`deleteValueWithKeyAsync is not a function`). Probe once with a
 * real native call; fall back to AsyncStorage so auth still works.
 */
let backend: 'secure' | 'async' | null = null;

const PROBE_KEY = 'fleetflow.__probe__';

async function resolveBackend(): Promise<'secure' | 'async'> {
  if (backend) return backend;

  if (Platform.OS === 'web') {
    backend = 'async';
    return backend;
  }

  try {
    if (!(await SecureStore.isAvailableAsync())) {
      backend = 'async';
      return backend;
    }
    // Forces the native delete path — this is the call that was crashing.
    await SecureStore.deleteItemAsync(PROBE_KEY);
    backend = 'secure';
  } catch {
    backend = 'async';
  }

  return backend;
}

async function getItem(key: string): Promise<string | null> {
  if ((await resolveBackend()) === 'secure') {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      backend = 'async';
    }
  }
  return AsyncStorage.getItem(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if ((await resolveBackend()) === 'secure') {
    try {
      await SecureStore.setItemAsync(key, value);
      return;
    } catch {
      backend = 'async';
    }
  }
  await AsyncStorage.setItem(key, value);
}

async function removeItem(key: string): Promise<void> {
  if ((await resolveBackend()) === 'secure') {
    try {
      await SecureStore.deleteItemAsync(key);
      return;
    } catch {
      backend = 'async';
    }
  }
  await AsyncStorage.removeItem(key);
}

export async function getAccessToken(): Promise<string | null> {
  return getItem(STORAGE_KEYS.accessToken);
}

export async function getRefreshToken(): Promise<string | null> {
  return getItem(STORAGE_KEYS.refreshToken);
}

export async function saveTokens({ accessToken, refreshToken }: TokenPair): Promise<void> {
  await Promise.all([
    setItem(STORAGE_KEYS.accessToken, accessToken),
    setItem(STORAGE_KEYS.refreshToken, refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    removeItem(STORAGE_KEYS.accessToken),
    removeItem(STORAGE_KEYS.refreshToken),
  ]);
}
