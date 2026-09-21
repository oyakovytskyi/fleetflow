import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';
import { useDeliveries } from '@/src/features/deliveries/hooks/useDeliveries';
import { DeliveryMapView } from '@/src/features/map/components/DeliveryMapView';
import { DeliveryPicker } from '@/src/features/map/components/DeliveryPicker';
import { getCurrentCoords } from '@/src/features/map/location';
import { pickMapDelivery, type LatLng } from '@/src/features/map/region';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { selectUser } from '@/src/store/slices/authSlice';
import {
  deliverySelected,
  selectSelectedDeliveryId,
} from '@/src/store/slices/deliveriesSlice';
import {
  selectActiveDeliveryId,
  selectCurrentLocation,
} from '@/src/store/slices/trackingSlice';

export default function MapScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const activeDeliveryId = useAppSelector(selectActiveDeliveryId);
  const trackedLocation = useAppSelector(selectCurrentLocation);
  const selectedFromStore = useAppSelector(selectSelectedDeliveryId);
  const tint = useThemeColor({}, 'tint');
  const danger = useThemeColor({}, 'danger');
  const onTint = useThemeColor({}, 'onTint');
  const { data: deliveries = [], isLoading, isError, refetch } = useDeliveries();

  const [fallbackLocation, setFallbackLocation] = useState<LatLng | null>(null);
  const [locationNote, setLocationNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLocation() {
      try {
        const coords = await getCurrentCoords();
        if (cancelled) return;
        if (coords) {
          setFallbackLocation(coords);
          setLocationNote(null);
        } else {
          setLocationNote('Location permission needed to show you on the map.');
        }
      } catch {
        if (!cancelled) {
          setLocationNote('Could not read current location.');
        }
      }
    }

    void loadLocation();
    return () => {
      cancelled = true;
    };
  }, []);

  const driverLocation: LatLng | null = trackedLocation
    ? { latitude: trackedLocation.lat, longitude: trackedLocation.lng }
    : fallbackLocation;
  useEffect(() => {
    if (selectedFromStore && deliveries.some((d) => d.id === selectedFromStore)) return;
    const picked = pickMapDelivery(deliveries, {
      userId: user?.id,
      preferredId: activeDeliveryId ?? selectedFromStore,
    });
    if (picked && picked.id !== selectedFromStore) {
      dispatch(deliverySelected(picked.id));
    }
  }, [deliveries, selectedFromStore, user?.id, activeDeliveryId, dispatch]);

  const selected = useMemo(
    () => deliveries.find((d) => d.id === selectedFromStore) ?? null,
    [deliveries, selectedFromStore],
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={tint} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.error, { color: danger }]}>Could not load deliveries for the map.</Text>
        <Text style={[styles.link, { color: tint }]} onPress={() => void refetch()}>
          Retry
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <DeliveryMapView delivery={selected} driverLocation={driverLocation} />
      <DeliveryPicker
        deliveries={deliveries}
        selectedId={selectedFromStore}
        onSelect={(id) => dispatch(deliverySelected(id))}
      />

      {!selected ? (
        <View style={[styles.banner, { backgroundColor: 'rgba(15,23,42,0.88)' }]}>
          <Text style={[styles.bannerText, { color: onTint }]}>
            No delivery selected. Claim a job to see the route.
          </Text>
        </View>
      ) : null}

      {locationNote ? (
        <View style={[styles.banner, styles.bannerBottom, { backgroundColor: 'rgba(15,23,42,0.88)' }]}>
          <Text style={[styles.bannerText, { color: onTint }]}>{locationNote}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  error: {
    fontWeight: '600',
    textAlign: 'center',
  },
  link: {
    fontWeight: '700',
  },
  banner: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 24,
    padding: 12,
    borderRadius: 10,
  },
  bannerBottom: {
    bottom: 80,
  },
  bannerText: {
    textAlign: 'center',
    fontSize: 13,
  },
});
