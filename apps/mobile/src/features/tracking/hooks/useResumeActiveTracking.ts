import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { QUERY_KEYS } from '@/src/constants';
import { fetchDeliveries } from '@/src/features/deliveries/api';
import { useDeliveryTracking } from '@/src/features/tracking/hooks/useDeliveryTracking';
import { useAppSelector } from '@/src/store/hooks';
import { selectIsAuthenticated, selectIsHydrated, selectUser } from '@/src/store/slices/authSlice';
import { selectIsTracking } from '@/src/store/slices/trackingSlice';

/**
 * After session hydrate, resume GPS for any IN_PROGRESS job owned by this driver.
 * Does not require opening the delivery detail screen.
 */
export function useResumeActiveTracking() {
  const hydrated = useAppSelector(selectIsHydrated);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const isTracking = useAppSelector(selectIsTracking);
  const { startTracking } = useDeliveryTracking();
  const attemptedFor = useRef<string | null>(null);

  const { data: deliveries } = useQuery({
    queryKey: QUERY_KEYS.deliveries(),
    queryFn: fetchDeliveries,
    enabled: hydrated && isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      attemptedFor.current = null;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!hydrated || !isAuthenticated || !user || isTracking || !deliveries) return;

    const active = deliveries.find(
      (d) => d.status === 'IN_PROGRESS' && d.driverId === user.id,
    );
    if (!active) return;
    if (attemptedFor.current === active.id) return;
    attemptedFor.current = active.id;

    void startTracking(active.id).catch(() => {
      attemptedFor.current = null;
    });
  }, [hydrated, isAuthenticated, user, isTracking, deliveries, startTracking]);
}
