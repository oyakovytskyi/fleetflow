import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@/src/constants';

import {
  claimDelivery,
  completeDelivery,
  fetchDeliveries,
  fetchDelivery,
  startDelivery,
} from '../api';

export function useDeliveries() {
  return useQuery({
    queryKey: QUERY_KEYS.deliveries(),
    queryFn: fetchDeliveries,
  });
}

export function useDelivery(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.delivery(id),
    queryFn: () => fetchDelivery(id),
    enabled: Boolean(id),
  });
}

function useInvalidateDeliveries() {
  const queryClient = useQueryClient();
  return (id?: string) => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deliveries() });
    if (id) {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.delivery(id) });
    }
  };
}

export function useClaimDelivery() {
  const invalidate = useInvalidateDeliveries();
  return useMutation({
    mutationFn: claimDelivery,
    onSuccess: (delivery) => invalidate(delivery.id),
  });
}

export function useStartDelivery() {
  const invalidate = useInvalidateDeliveries();
  return useMutation({
    mutationFn: startDelivery,
    onSuccess: (delivery) => invalidate(delivery.id),
  });
}

export function useCompleteDelivery() {
  const invalidate = useInvalidateDeliveries();
  return useMutation({
    mutationFn: completeDelivery,
    onSuccess: (delivery) => invalidate(delivery.id),
  });
}
