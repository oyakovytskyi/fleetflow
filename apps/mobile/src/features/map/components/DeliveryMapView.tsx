import type { DeliveryDto } from '@fleetflow/shared-types';
import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import {
  defaultRegion,
  deliveryRoute,
  destinationCoord,
  pickupCoord,
  regionFitting,
  type LatLng,
} from '../region';

type Props = {
  delivery: DeliveryDto | null;
  driverLocation: LatLng | null;
};

export function DeliveryMapView({ delivery, driverLocation }: Props) {
  const mapRef = useRef<MapView>(null);
  const scheme = useColorScheme() ?? 'light';
  const tint = Colors[scheme].tint;
  const danger = Colors[scheme].danger;
  const success = Colors[scheme].success;

  const route = useMemo(() => (delivery ? deliveryRoute(delivery) : []), [delivery]);

  const fitPoints = useMemo(() => {
    const points: LatLng[] = [...route];
    if (driverLocation) points.push(driverLocation);
    return points;
  }, [route, driverLocation]);

  useEffect(() => {
    const next = regionFitting(fitPoints);
    mapRef.current?.animateToRegion(next, 400);
  }, [fitPoints]);

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={defaultRegion()}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {delivery ? (
          <>
            <Marker
              coordinate={pickupCoord(delivery)}
              title="Pickup"
              description={delivery.title}
              pinColor={tint}
            />
            <Marker
              coordinate={destinationCoord(delivery)}
              title="Destination"
              description={delivery.title}
              pinColor={danger}
            />
            <Polyline coordinates={route} strokeColor={tint} strokeWidth={4} />
          </>
        ) : null}

        {driverLocation ? (
          <Marker coordinate={driverLocation} title="You" pinColor={success} />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
});
