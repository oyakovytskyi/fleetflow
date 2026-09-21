import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

import { useAppDispatch } from '@/src/store/hooks';
import { connectivityChanged } from '@/src/store/slices/networkSlice';

/**
 * Keeps Redux `network.isOnline` in sync with the device connectivity state.
 */
export function useNetworkStatus(): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      dispatch(connectivityChanged(online));
    });

    void NetInfo.fetch().then((state) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      dispatch(connectivityChanged(online));
    });

    return unsubscribe;
  }, [dispatch]);
}
