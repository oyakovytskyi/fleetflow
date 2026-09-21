import type { DeliveryDto } from '@fleetflow/shared-types';

import { MAP_DEFAULTS } from '@/src/constants';

export type LatLng = { latitude: number; longitude: number };

export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export function defaultRegion(): MapRegion {
  return {
    latitude: MAP_DEFAULTS.latitude,
    longitude: MAP_DEFAULTS.longitude,
    latitudeDelta: MAP_DEFAULTS.latitudeDelta,
    longitudeDelta: MAP_DEFAULTS.longitudeDelta,
  };
}

export function pickupCoord(delivery: DeliveryDto): LatLng {
  return {
    latitude: delivery.pickupLatitude,
    longitude: delivery.pickupLongitude,
  };
}

export function destinationCoord(delivery: DeliveryDto): LatLng {
  return {
    latitude: delivery.destinationLatitude,
    longitude: delivery.destinationLongitude,
  };
}

/** Used to frame the camera before the road route geometry arrives. */
export function deliveryRoute(delivery: DeliveryDto): LatLng[] {
  return [pickupCoord(delivery), destinationCoord(delivery)];
}

export function regionFitting(points: LatLng[], paddingFactor = 1.6): MapRegion {
  if (points.length === 0) return defaultRegion();

  if (points.length === 1) {
    const [only] = points;
    return {
      latitude: only.latitude,
      longitude: only.longitude,
      latitudeDelta: 0.04,
      longitudeDelta: 0.04,
    };
  }

  let minLat = points[0].latitude;
  let maxLat = points[0].latitude;
  let minLng = points[0].longitude;
  let maxLng = points[0].longitude;

  for (const point of points) {
    minLat = Math.min(minLat, point.latitude);
    maxLat = Math.max(maxLat, point.latitude);
    minLng = Math.min(minLng, point.longitude);
    maxLng = Math.max(maxLng, point.longitude);
  }

  const latitudeDelta = Math.max((maxLat - minLat) * paddingFactor, 0.02);
  const longitudeDelta = Math.max((maxLng - minLng) * paddingFactor, 0.02);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta,
    longitudeDelta,
  };
}

/** Prefer in-progress, then assigned-to-me, then first visible delivery. */
export function pickMapDelivery(
  deliveries: DeliveryDto[],
  opts: { userId?: string | null; preferredId?: string | null } = {},
): DeliveryDto | null {
  if (deliveries.length === 0) return null;

  const { userId, preferredId } = opts;

  if (preferredId) {
    const preferred = deliveries.find((d) => d.id === preferredId);
    if (preferred) return preferred;
  }

  const inProgress = deliveries.find(
    (d) => d.status === 'IN_PROGRESS' && (!userId || d.driverId === userId),
  );
  if (inProgress) return inProgress;

  const assigned = deliveries.find(
    (d) => d.status === 'ASSIGNED' && (!userId || d.driverId === userId),
  );
  if (assigned) return assigned;

  return deliveries[0] ?? null;
}
