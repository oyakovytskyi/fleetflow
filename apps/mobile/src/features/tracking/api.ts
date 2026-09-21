import type { LocationSampleDto, PostLocationRequestDto } from '@fleetflow/shared-types';

import { API_PATHS } from '@/src/constants';
import { apiClient } from '@/src/services/apiClient';

export async function postLocation(payload: PostLocationRequestDto): Promise<void> {
  await apiClient.post(API_PATHS.trackingLocation, payload);
}

export type { LocationSampleDto };
