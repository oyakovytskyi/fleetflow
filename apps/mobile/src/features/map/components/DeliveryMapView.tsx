import type { DeliveryDto } from '@fleetflow/shared-types';
import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

import { buildLeafletMapHtml, driverUpdateScript, zoomFromDelta } from '../leafletHtml';
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
 * Free OpenStreetMap basemap via Leaflet inside a WebView.
 * Pickup→destination follows OSM roads via the public OSRM demo (no API key).
 * Driver GPS updates are injected so the WebView does not remount every tick.
 */
export function DeliveryMapView({ delivery, driverLocation }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const webRef = useRef<WebView>(null);
  const readyRef = useRef(false);
  const lastInjected = useRef<string | null>(null);

  const pickup = delivery ? pickupCoord(delivery) : null;
  const destination = delivery ? destinationCoord(delivery) : null;

  const html = useMemo(() => {
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
      // Initial driver only; later updates go through injectJavaScript.
      driver: driverLocation,
      routeTitle: delivery?.title ?? 'Delivery',
      tint: colors.tint,
      danger: colors.danger,
      success: colors.success,
      isDark: scheme === 'dark',
    });
    // Intentionally omit driverLocation — remount only when the delivery/theme changes.
  }, [
    delivery?.id,
    delivery?.title,
    pickup?.latitude,
    pickup?.longitude,
    destination?.latitude,
    destination?.longitude,
    colors.tint,
    colors.danger,
    colors.success,
    scheme,
  ]);

  useEffect(() => {
    readyRef.current = false;
    lastInjected.current = null;
  }, [html]);

  useEffect(() => {
    if (!driverLocation || !readyRef.current) return;
    const key = `${driverLocation.latitude.toFixed(5)},${driverLocation.longitude.toFixed(5)}`;
    if (key === lastInjected.current) return;
    lastInjected.current = key;
    webRef.current?.injectJavaScript(
      driverUpdateScript(driverLocation.latitude, driverLocation.longitude),
    );
  }, [driverLocation]);

  return (
    <View style={styles.wrap}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        allowsInlineMediaPlayback
        mixedContentMode="always"
        allowFileAccess
        onLoadEnd={() => {
          readyRef.current = true;
          if (driverLocation) {
            const key = `${driverLocation.latitude.toFixed(5)},${driverLocation.longitude.toFixed(5)}`;
            lastInjected.current = key;
            webRef.current?.injectJavaScript(
              driverUpdateScript(driverLocation.latitude, driverLocation.longitude),
            );
          }
        }}
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
