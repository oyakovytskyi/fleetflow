import * as SecureStore from 'expo-secure-store';

import { STORAGE_KEYS } from '@/src/constants';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(STORAGE_KEYS.accessToken);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(STORAGE_KEYS.refreshToken);
}

export async function saveTokens({ accessToken, refreshToken }: TokenPair): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(STORAGE_KEYS.accessToken, accessToken),
    SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(STORAGE_KEYS.accessToken),
    SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken),
  ]);
}
