/**
 * Public runtime config.
 *
 * Only `EXPO_PUBLIC_*` variables are readable here — Expo inlines them into the
 * bundle at build time, so nothing secret may live in this file or in `.env`.
 */

const DEV_FALLBACK_API_URL = 'http://localhost:8000';

function stripTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, '');
}

function readApiUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!raw) {
    if (!__DEV__) {
      throw new Error('EXPO_PUBLIC_API_URL must be set for production builds.');
    }
    return DEV_FALLBACK_API_URL;
  }

  return stripTrailingSlashes(raw);
}

function toWebSocketUrl(apiUrl: string): string {
  return apiUrl.replace(/^http/, 'ws');
}

const apiUrl = readApiUrl();

export const env = {
  apiUrl,
  /** Base for the tracking socket, e.g. `ws://192.168.0.10:8000`. */
  wsUrl: toWebSocketUrl(apiUrl),
  isDev: __DEV__,
} as const;
