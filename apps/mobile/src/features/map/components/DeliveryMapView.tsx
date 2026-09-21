import type { DeliveryDto } from '@fleetflow/shared-types';
import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

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
              pinColor="#2f95dc"
            />
            <Marker
              coordinate={destinationCoord(delivery)}
              title="Destination"
              description={delivery.title}
              pinColor="#d92d20"
            />
            <Polyline coordinates={route} strokeColor="#2f95dc" strokeWidth={4} />
          </>
        ) : null}

        {driverLocation ? (
          <Marker coordinate={driverLocation} title="You" pinColor="#12b76a" />
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
