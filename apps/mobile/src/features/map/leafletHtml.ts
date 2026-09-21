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
      position: absolute; z-index: 500; left: 12px; right: 12px; top: 12px;
      display: flex; gap: 8px; flex-wrap: wrap; pointer-events: none;
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
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a> | routing OSRM'
      }).addTo(map);

      var bounds = [];
      var routeLayer = null;
      var chip = document.getElementById('routeChip');

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
        L.marker(latlng, { icon: icon }).addTo(map).bindPopup(label);
        bounds.push(latlng);
      }

      if (cfg.pickup) pin(cfg.pickup, cfg.tint, 'Pickup: ' + cfg.routeTitle);
      if (cfg.destination) pin(cfg.destination, cfg.danger, 'Destination: ' + cfg.routeTitle);
      if (cfg.driver) pin(cfg.driver, cfg.success, 'You');

      function fitMarkers() {
        if (bounds.length > 1) {
          map.fitBounds(bounds, { padding: [56, 56], maxZoom: 15 });
        } else if (bounds.length === 1) {
          map.setView(bounds[0], 14);
        }
      }

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
        map.fitBounds(routeLayer.getBounds(), { padding: [56, 56], maxZoom: 15 });
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

      // Prefer live driver→destination when tracking; else pickup→destination.
      var origin = cfg.driver || cfg.pickup;
      var dest = cfg.destination;
      var labelPrefix = cfg.driver ? 'To destination · ' : 'Pickup → drop · ';

      if (origin && dest) {
        fetchRoad(origin, dest)
          .then(function (result) {
            drawLine(result.latLngs, false);
            setChip(labelPrefix + formatRoute(result.distance, result.duration));
          })
          .catch(function () {
            drawLine([origin, dest], true);
            setChip('Road routing unavailable · straight line');
          });
      } else {
        setChip(cfg.pickup || cfg.destination ? 'Select a delivery with both ends' : 'No delivery selected');
        fitMarkers();
      }
    })();
  </script>
</body>
</html>`;
}

export function zoomFromDelta(latitudeDelta: number): number {
  const zoom = Math.round(Math.log2(360 / Math.max(latitudeDelta, 0.005)));
  return Math.min(16, Math.max(10, zoom));
}
