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

export interface DriverLocationUpdatedEvent {
  type: 'driver.location.updated';
  payload: {
    driverId: string;
    lat: number;
    lng: number;
    timestamp: number;
  };
}

export type FleetWsEvent = DriverLocationUpdatedEvent;
