import type { DeliveryDto } from '@fleetflow/shared-types';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

import { buildLeafletMapHtml, zoomFromDelta } from '../leafletHtml';
import {
  defaultRegion,
  destinationCoord,
  pickupCoord,
  regionFitting,
  type LatLng,
} from '../region';

type Props = {
  delivery: DeliveryDto | null;
  driverLocation: LatLng | null;
};

/**
 * Free OpenStreetMap basemap via Leaflet (Carto tiles) inside a WebView.
 * Pickup→destination follows OSM roads via the public OSRM demo (no API key).
 */
export function DeliveryMapView({ delivery, driverLocation }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const html = useMemo(() => {
    const pickup = delivery ? pickupCoord(delivery) : null;
    const destination = delivery ? destinationCoord(delivery) : null;
    const points: LatLng[] = [];
    if (pickup) points.push(pickup);
    if (destination) points.push(destination);
    if (driverLocation) points.push(driverLocation);

    const region = regionFitting(points.length > 0 ? points : [defaultRegion()]);

    return buildLeafletMapHtml({
      center: { latitude: region.latitude, longitude: region.longitude },
      zoom: zoomFromDelta(region.latitudeDelta),
      pickup,
      destination,
      driver: driverLocation,
      routeTitle: delivery?.title ?? 'Delivery',
      tint: colors.tint,
      danger: colors.danger,
      success: colors.success,
      isDark: scheme === 'dark',
    });
  }, [delivery, driverLocation, colors.tint, colors.danger, colors.success, scheme]);

  return (
    <View style={styles.wrap}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        allowsInlineMediaPlayback
        mixedContentMode="always"
        // OSRM + tile CDNs need network from the WebView.
        allowFileAccess
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  map: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
