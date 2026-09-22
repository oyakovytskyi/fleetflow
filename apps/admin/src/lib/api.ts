import type {
  AuthResponseDto,
  DeliveryDto,
  DriverLocationSnapshotDto,
  UserDto,
} from '@fleetflow/shared-types';

import { env } from './env';
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  saveSession,
  type StoredUser,
} from './auth';

function formatDetail(detail: unknown): string | null {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'msg' in item) {
          return String((item as { msg: unknown }).msg);
        }
        return null;
      })
      .filter((part): part is string => Boolean(part));
    return parts.length > 0 ? parts.join(' ') : null;
  }
  return null;
}

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken();
    const user = getStoredUser();
    if (!refreshToken || !user) return false;
    try {
      const response = await fetch(`${env.apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) return false;
      const data = (await response.json()) as {
        accessToken?: string;
        refreshToken?: string;
        tokens?: { accessToken: string; refreshToken: string };
      };
      const tokens = data.tokens ?? {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
      if (!tokens.accessToken || !tokens.refreshToken) return false;
      saveSession(
        { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
        user,
      );
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

async function request<T>(path: string, init: RequestInit = {}, didRefresh = false): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${env.apiUrl}${path}`, { ...init, headers });
  if (response.status === 401 && !didRefresh && !path.startsWith('/auth/')) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, init, true);
    }
    clearSession();
    throw new Error('Session expired. Sign in again.');
  }
  if (response.status === 401) {
    clearSession();
    throw new Error('Session expired. Sign in again.');
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: unknown } | null;
    throw new Error(formatDetail(body?.detail) ?? `Request failed (${response.status})`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export async function login(email: string, password: string): Promise<StoredUser> {
  const data = await request<AuthResponseDto>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.user.role !== 'ADMIN') {
    throw new Error('Admin role required. Use an ADMIN account for this panel.');
  }
  saveSession(data.tokens, data.user);
  return data.user;
}

export async function fetchDeliveries(): Promise<DeliveryDto[]> {
  return request<DeliveryDto[]>('/deliveries');
}

export async function createDelivery(input: {
  title: string;
  description?: string;
  pickupLatitude: number;
  pickupLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
}): Promise<DeliveryDto> {
  return request<DeliveryDto>('/deliveries', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function assignDelivery(deliveryId: string, driverId: string): Promise<DeliveryDto> {
  return request<DeliveryDto>(`/deliveries/${deliveryId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ driverId }),
  });
}

export async function cancelDelivery(deliveryId: string): Promise<DeliveryDto> {
  return request<DeliveryDto>(`/deliveries/${deliveryId}/cancel`, {
    method: 'POST',
  });
}

export async function fetchDrivers(): Promise<UserDto[]> {
  return request<UserDto[]>('/users/drivers');
}

export async function fetchLocations(): Promise<DriverLocationSnapshotDto[]> {
  const data = await request<{ locations: DriverLocationSnapshotDto[] }>('/tracking/locations');
  return data.locations;
}

export async function fetchDriverTrail(
  driverId: string,
): Promise<{ driverId: string; points: { lat: number; lng: number; timestamp: number }[] }> {
  return request(`/tracking/drivers/${driverId}/trail`);
}
