import type { AuthResponseDto, DeliveryDto, DriverLocationSnapshotDto } from '@fleetflow/shared-types';

import { env } from './env';
import { clearSession, getAccessToken, saveSession, type StoredUser } from './auth';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${env.apiUrl}${path}`, { ...init, headers });
  if (response.status === 401) {
    clearSession();
    throw new Error('Session expired. Sign in again.');
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(body?.detail ?? `Request failed (${response.status})`);
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
    throw new Error('Admin role required. Register with role ADMIN for this panel.');
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

export async function fetchLocations(): Promise<DriverLocationSnapshotDto[]> {
  const data = await request<{ locations: DriverLocationSnapshotDto[] }>('/tracking/locations');
  return data.locations;
}
