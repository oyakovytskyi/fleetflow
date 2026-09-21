import type { LatLng } from './region';

type BuildMapHtmlArgs = {
  center: LatLng;
  zoom: number;
  pickup: LatLng | null;
  destination: LatLng | null;
  driver: LatLng | null;
  routeTitle: string;
  tint: string;
  danger: string;
  success: string;
  isDark: boolean;
};

/**
 * Leaflet + free Carto/OSM raster tiles — no API key, works in Expo Go.
 * Attribution stays on the map (Carto + OpenStreetMap).
 */
export function buildLeafletMapHtml({
  center,
  zoom,
  pickup,
  destination,
  driver,
  routeTitle,
  tint,
  danger,
  success,
  isDark,
}: BuildMapHtmlArgs): string {
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const payload = JSON.stringify({
    center: [center.latitude, center.longitude],
    zoom,
    pickup: pickup ? [pickup.latitude, pickup.longitude] : null,
    destination: destination ? [destination.latitude, destination.longitude] : null,
    driver: driver ? [driver.latitude, driver.longitude] : null,
    routeTitle,
    tint,
    danger,
    success,
    tileUrl,
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: ${isDark ? '#0f172a' : '#e2e8f0'}; }
    .leaflet-control-attribution { font-size: 10px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    (function () {
      var cfg = ${payload};
      var map = L.map('map', { zoomControl: true }).setView(cfg.center, cfg.zoom);
      L.tileLayer(cfg.tileUrl, {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(map);

      var bounds = [];
      function pin(latlng, color, label) {
        var icon = L.divIcon({
          className: '',
          html: '<div style="width:16px;height:16px;border-radius:50%;background:' + color + ';border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        L.marker(latlng, { icon: icon }).addTo(map).bindPopup(label);
        bounds.push(latlng);
      }

      if (cfg.pickup) pin(cfg.pickup, cfg.tint, 'Pickup: ' + cfg.routeTitle);
      if (cfg.destination) pin(cfg.destination, cfg.danger, 'Destination: ' + cfg.routeTitle);
      if (cfg.driver) pin(cfg.driver, cfg.success, 'You');

      if (cfg.pickup && cfg.destination) {
        L.polyline([cfg.pickup, cfg.destination], { color: cfg.tint, weight: 4, opacity: 0.9 }).addTo(map);
      }

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 14);
      }
    })();
  </script>
</body>
</html>`;
}

export function zoomFromDelta(latitudeDelta: number): number {
  // Rough conversion from region delta → Leaflet zoom.
  const zoom = Math.round(Math.log2(360 / Math.max(latitudeDelta, 0.005)));
  return Math.min(16, Math.max(10, zoom));
}
