import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import { env } from '@/src/config/env';
import { API_PATHS, REQUEST_TIMEOUT_MS } from '@/src/constants';

import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from './tokenStorage';

type RetryableRequest = InternalAxiosRequestConfig & { retriedAfterRefresh?: boolean };

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

/** Set by the auth feature so a dead session can clear Redux state. */
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null): void {
  onSessionExpired = handler;
}

const baseConfig = {
  baseURL: env.apiUrl,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
};

export const apiClient: AxiosInstance = axios.create(baseConfig);

/** Interceptor-free client — refreshing through `apiClient` would recurse. */
const refreshClient: AxiosInstance = axios.create(baseConfig);

/** Concurrent 401s share one refresh round-trip. */
let inFlightRefresh: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { data } = await refreshClient.post<RefreshResponse>(API_PATHS.refresh, {
      refreshToken,
    });
    await saveTokens(data);
    return data.accessToken;
  } catch {
    await clearTokens();
    return null;
  }
}

function requestRefresh(): Promise<string | null> {
  inFlightRefresh ??= refreshAccessToken().finally(() => {
    inFlightRefresh = null;
  });
  return inFlightRefresh;
}

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) throw error;

    const request = error.config as RetryableRequest | undefined;
    const isAuthFailure = error.response?.status === 401;

    // Retry once: a second 401 means the refresh token is dead too.
    if (!isAuthFailure || !request || request.retriedAfterRefresh) {
      throw error;
    }

    const accessToken = await requestRefresh();
    if (!accessToken) {
      onSessionExpired?.();
      throw error;
    }

    request.retriedAfterRefresh = true;
    request.headers.Authorization = `Bearer ${accessToken}`;
    return apiClient.request(request);
  },
);
