import { QueryClientProvider, focusManager } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { Provider } from 'react-redux';

import { queryClient } from '@/src/services/queryClient';
import { setSessionExpiredHandler } from '@/src/services/apiClient';
import { store } from '@/src/store';
import { signedOut } from '@/src/store/slices/authSlice';

/**
 * React Native has no window focus events, so Query needs AppState instead.
 */
function useAppStateFocus() {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
    });
    return () => subscription.remove();
  }, []);
}

/** A failed token refresh must drop the session and the cached user data. */
function useSessionExpiry() {
  useEffect(() => {
    setSessionExpiredHandler(() => {
      store.dispatch(signedOut());
      queryClient.clear();
    });
    return () => setSessionExpiredHandler(null);
  }, []);
}

export function AppProviders({ children }: { children: ReactNode }) {
  useAppStateFocus();
  useSessionExpiry();

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
}
