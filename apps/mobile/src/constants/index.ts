/**
 * App-wide constants. Feature-specific constants live under features/*.
 */

export const APP_NAME = 'FleetFlow';

export const LOCATION_INTERVAL_MS = 5_000;

export const WS_RECONNECT_DELAYS_MS = [1_000, 2_000, 4_000, 8_000, 16_000] as const;

export const STORAGE_KEYS = {
  accessToken: 'fleetflow.access_token',
  refreshToken: 'fleetflow.refresh_token',
  locationQueue: 'fleetflow.location_queue',
} as const;

export const API_PATHS = {
  login: '/auth/login',
  register: '/auth/register',
  refresh: '/auth/refresh',
  me: '/auth/me',
  logout: '/auth/logout',
  deliveries: '/deliveries',
  trackingLocation: '/tracking/location',
} as const;
