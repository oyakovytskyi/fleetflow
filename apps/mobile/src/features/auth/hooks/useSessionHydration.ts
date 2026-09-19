import { useEffect, useRef } from 'react';

import { clearTokens, getAccessToken, getRefreshToken } from '@/src/services/tokenStorage';
import { useAppDispatch } from '@/src/store/hooks';
import { sessionRestored } from '@/src/store/slices/authSlice';

import { fetchCurrentUser } from '../api';

/**
 * Runs once on launch: if SecureStore has tokens, hit `/auth/me` and restore
 * the user; otherwise mark the session hydrated as signed-out.
 */
export function useSessionHydration(): void {
  const dispatch = useAppDispatch();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let cancelled = false;

    async function hydrate() {
      try {
        const [accessToken, refreshToken] = await Promise.all([
          getAccessToken(),
          getRefreshToken(),
        ]);

        if (!accessToken && !refreshToken) {
          if (!cancelled) dispatch(sessionRestored(null));
          return;
        }

        const user = await fetchCurrentUser();
        if (!cancelled) dispatch(sessionRestored(user));
      } catch {
        await clearTokens();
        if (!cancelled) dispatch(sessionRestored(null));
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);
}
