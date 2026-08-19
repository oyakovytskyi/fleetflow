/**
 * Mobile-only types. Prefer importing from @fleetflow/shared-types.
 */

export type { DeliveryDto, LocationSampleDto, UserDto } from '@fleetflow/shared-types';

export interface TrackingUiState {
  isTracking: boolean;
  activeDeliveryId: string | null;
  lastError: string | null;
}
