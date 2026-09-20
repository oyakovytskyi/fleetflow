import type { DeliveryDto } from '@fleetflow/shared-types';

import { API_PATHS } from '@/src/constants';
import { apiClient } from '@/src/services/apiClient';

export async function fetchDeliveries(): Promise<DeliveryDto[]> {
  const { data } = await apiClient.get<DeliveryDto[]>(API_PATHS.deliveries);
  return data;
}

export async function fetchDelivery(id: string): Promise<DeliveryDto> {
  const { data } = await apiClient.get<DeliveryDto>(`${API_PATHS.deliveries}/${id}`);
  return data;
}

export async function claimDelivery(id: string): Promise<DeliveryDto> {
  const { data } = await apiClient.post<DeliveryDto>(`${API_PATHS.deliveries}/${id}/claim`);
  return data;
}

export async function startDelivery(id: string): Promise<DeliveryDto> {
  const { data } = await apiClient.post<DeliveryDto>(`${API_PATHS.deliveries}/${id}/start`);
  return data;
}

export async function completeDelivery(id: string): Promise<DeliveryDto> {
  const { data } = await apiClient.post<DeliveryDto>(`${API_PATHS.deliveries}/${id}/complete`);
  return data;
}
