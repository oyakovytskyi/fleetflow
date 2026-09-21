import { useEffect, useRef } from 'react';

import { postLocation } from '@/src/features/tracking/api';
import {
  clearLocationQueue,
  loadLocationQueue,
  peekLocationQueue,
  replaceLocationQueue,
  subscribeLocationQueue,
} from '@/src/services/locationQueue';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { selectIsOnline } from '@/src/store/slices/networkSlice';
import { pendingCountChanged, queueFlushed } from '@/src/store/slices/trackingSlice';

/**
 * Hydrates the offline location queue into Redux and flushes FIFO when online.
 */
export function useLocationQueueFlush(): void {
  const dispatch = useAppDispatch();
  const isOnline = useAppSelector(selectIsOnline);
  const flushingRef = useRef(false);

  useEffect(() => {
    void loadLocationQueue().then((items) => {
      dispatch(pendingCountChanged(items.length));
    });
    return subscribeLocationQueue((items) => {
      dispatch(pendingCountChanged(items.length));
    });
  }, [dispatch]);

  useEffect(() => {
    if (!isOnline || flushingRef.current) return;

    let cancelled = false;

    async function flush(): Promise<void> {
      flushingRef.current = true;
      try {
        let remaining = await peekLocationQueue();
        while (!cancelled && remaining.length > 0) {
          const [head, ...tail] = remaining;
          if (!head) break;
          try {
            await postLocation(head);
            remaining = tail;
            await replaceLocationQueue(remaining);
          } catch {
            // Keep the failed head and stop; retry on next online tick.
            break;
          }
        }
        if (!cancelled && remaining.length === 0) {
          await clearLocationQueue();
          dispatch(queueFlushed());
        }
      } finally {
        flushingRef.current = false;
      }
    }

    void flush();

    return () => {
      cancelled = true;
    };
  }, [dispatch, isOnline]);
}
