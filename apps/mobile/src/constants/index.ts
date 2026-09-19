/**
 * App-wide constants. Feature-specific constants live under features/*.
 */

export const APP_NAME = 'FleetFlow';

export const LOCATION_INTERVAL_MS = 5_000;

/** Minimum device movement before a new location sample is emitted. */
export const LOCATION_DISTANCE_INTERVAL_M = 10;

export const REQUEST_TIMEOUT_MS = 15_000;

export const WS_RECONNECT_DELAYS_MS = [1_000, 2_000, 4_000, 8_000, 16_000] as const;

/** SecureStore keys — alphanumeric plus `.`, `-`, `_` only. */
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

/**
 * TanStack Query cache keys. Always build keys through this helper so
 * invalidation stays consistent across features.
 */
export const QUERY_KEYS = {
  me: () => ['me'] as const,
  deliveries: () => ['deliveries'] as const,
  delivery: (id: string) => ['deliveries', id] as const,
} as const;

export const MAP_DEFAULTS = {
  /** Kyiv — placeholder until the first GPS fix arrives. */
  latitude: 50.4501,
  longitude: 30.5234,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
} as const;
