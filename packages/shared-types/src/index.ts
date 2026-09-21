/**
 * @fleetflow/shared-types
 * Single source of truth for cross-app contracts.
 */

export type UserRole = 'DRIVER' | 'ADMIN';

export type DeliveryStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type WsConnectionStatus =
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'RECONNECTING';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto extends LoginRequestDto {
  name: string;
}

export interface RefreshRequestDto {
  refreshToken: string;
}

/** Returned by `/auth/register` and `/auth/login`. `/auth/refresh` returns tokens only. */
export interface AuthResponseDto {
  user: UserDto;
  tokens: AuthTokensDto;
}

export interface DeliveryDto {
  id: string;
  title: string;
  description: string;
  pickupLatitude: number;
  pickupLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  status: DeliveryStatus;
  driverId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LocationSampleDto {
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

/** Body for `POST /tracking/location`. */
export interface PostLocationRequestDto extends LocationSampleDto {
  deliveryId: string;
}

export interface DriverLocationSnapshotDto {
  driverId: string;
  deliveryId?: string | null;
  lat: number;
  lng: number;
  timestamp: number;
}

/** Who should receive a fan-out frame (server filters before send). */
export interface WsAudience {
  roles?: UserRole[];
  userIds?: string[];
}

export interface DriverLocationUpdatedEvent {
  type: 'driver.location.updated';
  payload: {
    driverId: string;
    deliveryId?: string;
    lat: number;
    lng: number;
    timestamp: number;
  };
  audience?: WsAudience;
}

export interface TrackingSnapshotEvent {
  type: 'tracking.snapshot';
  payload: {
    locations: DriverLocationSnapshotDto[];
  };
}

export type DeliveryLifecycleEventType =
  | 'delivery.created'
  | 'delivery.assigned'
  | 'delivery.started'
  | 'delivery.completed'
  | 'delivery.cancelled';

export interface DeliveryLifecycleEvent {
  type: DeliveryLifecycleEventType;
  payload: {
    delivery: DeliveryDto;
  };
  audience?: WsAudience;
}

export interface WsPingEvent {
  type: 'ping';
}

export type FleetWsEvent =
  | DriverLocationUpdatedEvent
  | TrackingSnapshotEvent
  | DeliveryLifecycleEvent
  | WsPingEvent;

export function isDeliveryLifecycleEvent(event: FleetWsEvent): event is DeliveryLifecycleEvent {
  return event.type.startsWith('delivery.');
}
