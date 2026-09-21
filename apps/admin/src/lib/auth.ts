const ACCESS_KEY = 'fleetflow.admin.accessToken';
const REFRESH_KEY = 'fleetflow.admin.refreshToken';
const USER_KEY = 'fleetflow.admin.user';

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: 'DRIVER' | 'ADMIN';
}

export function saveSession(tokens: { accessToken: string; refreshToken: string }, user: StoredUser) {
  localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}
