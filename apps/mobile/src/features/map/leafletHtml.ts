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
 * Leaflet + free Carto/OSM tiles. Road geometry from public OSRM (OSM network).
 * Active trip prefers driver→destination; otherwise pickup→destination.
 *
 * Supports live driver updates via `window.__fleetUpdate({ type:'driver', lat, lng })`
 * so React Native can inject GPS without remounting the WebView.
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
  // Free OSM raster tiles (no API key). Carto CDN watermarks without a key.
  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileAttribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | routing OSRM';

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
    tileAttribution,
    osrmUrl: 'https://router.project-osrm.org/route/v1/driving/',
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
    #hud {
      position: absolute; z-index: 500; left: 12px; right: 12px; bottom: 16px;
      display: flex; gap: 8px; flex-wrap: wrap; pointer-events: none;
      justify-content: center;
    }
    .chip {
      background: rgba(15,23,42,0.88); color: #f8fafc; border-radius: 10px;
      padding: 8px 12px; font: 600 13px/1.3 -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif;
      box-shadow: 0 2px 8px rgba(0,0,0,.25);
    }
    .chip.muted { font-weight: 500; opacity: 0.92; }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="hud"><div class="chip muted" id="routeChip">Routing…</div></div>
  <script>
    (function () {
      var cfg = ${payload};
      var map = L.map('map', { zoomControl: true }).setView(cfg.center, cfg.zoom);
      L.tileLayer(cfg.tileUrl, {
        maxZoom: 19,
        attribution: cfg.tileAttribution
      }).addTo(map);

      var routeLayer = null;
      var driverMarker = null;
      var chip = document.getElementById('routeChip');
      var lastOsrmAt = 0;
      var lastOsrmKey = '';
      var routeRequestId = 0;

      function setChip(text) {
        if (chip) chip.textContent = text;
      }

      function pin(latlng, color, label) {
        var icon = L.divIcon({
          className: '',
          html: '<div style="width:16px;height:16px;border-radius:50%;background:' + color + ';border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        return L.marker(latlng, { icon: icon }).addTo(map).bindPopup(label);
      }

      if (cfg.pickup) pin(cfg.pickup, cfg.tint, 'Pickup: ' + cfg.routeTitle);
      if (cfg.destination) pin(cfg.destination, cfg.danger, 'Destination: ' + cfg.routeTitle);

      function setDriver(latlng) {
        if (!latlng) return;
        if (driverMarker) {
          driverMarker.setLatLng(latlng);
        } else {
          driverMarker = pin(latlng, cfg.success, 'You');
        }
      }

      if (cfg.driver) setDriver(cfg.driver);

      function formatRoute(distanceM, durationS) {
        var km = distanceM / 1000;
        var dist = km >= 10 ? km.toFixed(0) + ' km' : km.toFixed(1) + ' km';
        var mins = Math.max(1, Math.round(durationS / 60));
        return dist + ' · ~' + mins + ' min by road';
      }

      function drawLine(latLngs, dashed) {
        if (routeLayer) map.removeLayer(routeLayer);
        routeLayer = L.polyline(latLngs, {
          color: cfg.tint,
          weight: dashed ? 4 : 5,
          opacity: dashed ? 0.55 : 0.92,
          dashArray: dashed ? '8 10' : null
        }).addTo(map);
      }

      function lonLat(point) {
        return point[1] + ',' + point[0];
      }

      function fetchRoad(from, to) {
        var url = cfg.osrmUrl + lonLat(from) + ';' + lonLat(to) + '?overview=full&geometries=geojson';
        return fetch(url).then(function (res) {
          if (!res.ok) throw new Error('route ' + res.status);
          return res.json();
        }).then(function (data) {
          var route = data.routes && data.routes[0];
          if (!route || !route.geometry || !route.geometry.coordinates.length) {
            throw new Error('empty route');
          }
          return {
            latLngs: route.geometry.coordinates.map(function (c) { return [c[1], c[0]]; }),
            distance: route.distance,
            duration: route.duration
          };
        });
      }

      function refreshRoute(force) {
        var origin = (driverMarker ? driverMarker.getLatLng() : null);
        var originArr = origin ? [origin.lat, origin.lng] : cfg.driver;
        if (!originArr) originArr = cfg.pickup;
        var dest = cfg.destination;
        if (!originArr || !dest) {
          setChip(cfg.pickup || cfg.destination ? 'Select a delivery with both ends' : 'No delivery selected');
          return;
        }

        var labelPrefix = (driverMarker || cfg.driver) ? 'To destination · ' : 'Pickup → drop · ';
        var key = originArr[0].toFixed(4) + ',' + originArr[1].toFixed(4) + '>' + dest[0].toFixed(4) + ',' + dest[1].toFixed(4);
        var now = Date.now();
        if (!force && key === lastOsrmKey && now - lastOsrmAt < 12000) {
          return;
        }
        lastOsrmKey = key;
        lastOsrmAt = now;
        var reqId = ++routeRequestId;

        fetchRoad(originArr, dest)
          .then(function (result) {
            if (reqId !== routeRequestId) return;
            drawLine(result.latLngs, false);
            setChip(labelPrefix + formatRoute(result.distance, result.duration));
          })
          .catch(function () {
            if (reqId !== routeRequestId) return;
            drawLine([originArr, dest], true);
            setChip('Road routing unavailable · straight line');
          });
      }

      refreshRoute(true);

      window.__fleetUpdate = function (msg) {
        if (!msg || msg.type !== 'driver') return;
        if (typeof msg.lat !== 'number' || typeof msg.lng !== 'number') return;
        setDriver([msg.lat, msg.lng]);
        refreshRoute(false);
      };
    })();
  </script>
</body>
</html>`;
}

export function zoomFromDelta(latitudeDelta: number): number {
  const zoom = Math.round(Math.log2(360 / Math.max(latitudeDelta, 0.005)));
  return Math.min(16, Math.max(10, zoom));
}

/** JS snippet injected into the map WebView to move the driver pin without remount. */
export function driverUpdateScript(lat: number, lng: number): string {
  return `window.__fleetUpdate && window.__fleetUpdate({type:'driver',lat:${lat},lng:${lng}}); true;`;
}
