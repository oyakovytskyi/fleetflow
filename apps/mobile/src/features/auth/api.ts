import type {
  AuthResponseDto,
  LoginRequestDto,
  RegisterRequestDto,
  UserDto,
} from '@fleetflow/shared-types';
import axios from 'axios';

import { API_PATHS } from '@/src/constants';
import { apiClient } from '@/src/services/apiClient';
import { clearTokens, getRefreshToken, saveTokens } from '@/src/services/tokenStorage';

export async function login(payload: LoginRequestDto): Promise<UserDto> {
  const { data } = await apiClient.post<AuthResponseDto>(API_PATHS.login, payload);
  await saveTokens(data.tokens);
  return data.user;
}

export async function register(payload: RegisterRequestDto): Promise<UserDto> {
  const { data } = await apiClient.post<AuthResponseDto>(API_PATHS.register, payload);
  await saveTokens(data.tokens);
  return data.user;
}

export async function fetchCurrentUser(): Promise<UserDto> {
  const { data } = await apiClient.get<UserDto>(API_PATHS.me);
  return data;
}

export async function logout(): Promise<void> {
  const refreshToken = await getRefreshToken();
  try {
    if (refreshToken) {
      await apiClient.post(API_PATHS.logout, { refreshToken });
    }
  } catch {
    // Local sign-out still wins if the network call fails.
  } finally {
    await clearTokens();
  }
}

/** Maps FastAPI / Axios failures into a short UI string. */
export function getAuthErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Something went wrong. Please try again.';
  }

  const detail = error.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) {
    return String(detail[0].msg);
  }

  if (error.code === 'ECONNABORTED') return 'Request timed out. Check your connection.';
  if (!error.response) return 'Cannot reach the server. Is the API running?';

  return 'Request failed. Please try again.';
}
