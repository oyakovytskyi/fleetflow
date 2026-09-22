'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { CircleMarker, Map as LeafletMap, Polyline } from 'leaflet';
import L from 'leaflet';

import type { DeliveryDto, DriverLocationSnapshotDto } from '@fleetflow/shared-types';

import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER: [number, number] = [50.087, 14.421];
const TRAIL_MAX = 80;
const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving/';

type TrailPoint = { lat: number; lng: number };

interface LiveMapProps {
  locations: DriverLocationSnapshotDto[];
  /** Optional historical trail keyed by driverId (oldest → newest). */
  trails?: Record<string, TrailPoint[]>;
  /** Active deliveries — used to draw OSRM road polylines (pickup → destination). */
  deliveries?: DeliveryDto[];
}

function near(a: TrailPoint, b: TrailPoint): boolean {
  return Math.abs(a.lat - b.lat) < 0.00005 && Math.abs(a.lng - b.lng) < 0.00005;
}

function dedupeAppend(base: TrailPoint[], next: TrailPoint): TrailPoint[] {
  const last = base[base.length - 1];
  if (last && near(last, next)) return base;
  return [...base, next].slice(-TRAIL_MAX);
}

function mergeTrail(history: TrailPoint[], live: TrailPoint[]): TrailPoint[] {
  if (history.length === 0) return live;
  let merged = [...history];
  for (const point of live) {
    merged = dedupeAppend(merged, point);
  }
  return merged.slice(-TRAIL_MAX);
}

export function LiveMap({ locations, trails = {}, deliveries = [] }: LiveMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<string, CircleMarker>>(new Map());
  const polylinesRef = useRef<Map<string, Polyline>>(new Map());
  const routeLayersRef = useRef<Map<string, Polyline>>(new Map());
  const liveTrailsRef = useRef<Map<string, TrailPoint[]>>(new Map());
  const [ready, setReady] = useState(false);
  const [userMoved, setUserMoved] = useState(false);
  const [routeNote, setRouteNote] = useState<string | null>(null);

  const countLabel = useMemo(
    () => `${locations.length} driver${locations.length === 1 ? '' : 's'}`,
    [locations.length],
  );

  const routeJobs = useMemo(
    () =>
      deliveries.filter(
        (d) =>
          d.status === 'PENDING' ||
          d.status === 'ASSIGNED' ||
          d.status === 'IN_PROGRESS',
      ),
    [deliveries],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    map.on('dragstart', () => setUserMoved(true));
    map.on('zoomstart', () => setUserMoved(true));

    mapRef.current = map;
    setReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
      polylinesRef.current.clear();
      routeLayersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const seen = new Set<string>();
    for (const loc of locations) {
      seen.add(loc.driverId);
      const existing = markersRef.current.get(loc.driverId);
      const latLng: [number, number] = [loc.lat, loc.lng];
      if (existing) {
        existing.setLatLng(latLng);
        existing.setPopupContent(popupHtml(loc));
      } else {
        const marker = L.circleMarker(latLng, {
          radius: 9,
          color: '#1a3a7a',
          weight: 2,
          fillColor: '#2f6fed',
          fillOpacity: 0.95,
        })
          .bindPopup(popupHtml(loc))
          .addTo(map);
        markersRef.current.set(loc.driverId, marker);
        setUserMoved(false);
      }

      const fromHistory = trails[loc.driverId] ?? [];
      const live = liveTrailsRef.current.get(loc.driverId) ?? [];
      const nextLive = dedupeAppend(live, { lat: loc.lat, lng: loc.lng });
      liveTrailsRef.current.set(loc.driverId, nextLive);

      const merged = mergeTrail(fromHistory, nextLive);
      const latLngs = merged.map((p) => [p.lat, p.lng] as [number, number]);
      const line = polylinesRef.current.get(loc.driverId);
      if (latLngs.length >= 2) {
        if (line) {
          line.setLatLngs(latLngs);
        } else {
          polylinesRef.current.set(
            loc.driverId,
            L.polyline(latLngs, { color: '#2f6fed', weight: 3, opacity: 0.75 }).addTo(map),
          );
        }
      }
    }

    for (const [driverId, marker] of markersRef.current) {
      if (!seen.has(driverId)) {
        marker.remove();
        markersRef.current.delete(driverId);
        polylinesRef.current.get(driverId)?.remove();
        polylinesRef.current.delete(driverId);
        liveTrailsRef.current.delete(driverId);
      }
    }

    if (userMoved || locations.length === 0) return;

    if (locations.length === 1) {
      const only = locations[0];
      if (only) map.panTo([only.lat, only.lng], { animate: true });
    } else {
      const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng] as [number, number]));
      map.fitBounds(bounds.pad(0.25), { animate: true, maxZoom: 14 });
    }
  }, [locations, ready, userMoved, trails]);

  // Planned road routes (pickup → destination) via public OSRM.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    let cancelled = false;
    const wanted = new Set(routeJobs.map((d) => d.id));

    for (const [id, layer] of routeLayersRef.current) {
      if (!wanted.has(id)) {
        layer.remove();
        routeLayersRef.current.delete(id);
      }
    }

    async function loadRoutes() {
      let ok = 0;
      let failed = 0;
      await Promise.all(
        routeJobs.map(async (delivery) => {
          if (routeLayersRef.current.has(delivery.id)) {
            ok += 1;
            return;
          }
          const from = `${delivery.pickupLongitude},${delivery.pickupLatitude}`;
          const to = `${delivery.destinationLongitude},${delivery.destinationLatitude}`;
          try {
            const res = await fetch(
              `${OSRM_URL}${from};${to}?overview=full&geometries=geojson`,
            );
            if (!res.ok) throw new Error(String(res.status));
            const data = (await res.json()) as {
              routes?: { geometry: { coordinates: [number, number][] } }[];
            };
            const coords = data.routes?.[0]?.geometry?.coordinates;
            if (!coords?.length) throw new Error('empty');
            if (cancelled || !mapRef.current) return;
            const latLngs = coords.map(([lng, lat]) => [lat, lng] as [number, number]);
            const line = L.polyline(latLngs, {
              color: '#0f9d8a',
              weight: 4,
              opacity: 0.7,
              dashArray: '10 8',
            })
              .bindPopup(`Road plan · ${delivery.title}`)
              .addTo(mapRef.current);
            routeLayersRef.current.set(delivery.id, line);
            ok += 1;
          } catch {
            failed += 1;
            if (cancelled || !mapRef.current || routeLayersRef.current.has(delivery.id)) return;
            const fallback = L.polyline(
              [
                [delivery.pickupLatitude, delivery.pickupLongitude],
                [delivery.destinationLatitude, delivery.destinationLongitude],
              ],
              { color: '#0f9d8a', weight: 3, opacity: 0.45, dashArray: '4 8' },
            )
              .bindPopup(`Straight-line plan · ${delivery.title}`)
              .addTo(mapRef.current);
            routeLayersRef.current.set(delivery.id, fallback);
          }
        }),
      );
      if (!cancelled) {
        if (routeJobs.length === 0) setRouteNote(null);
        else if (failed > 0 && ok === 0) setRouteNote('Road plans unavailable (OSRM)');
        else setRouteNote(`${routeJobs.length} road plan${routeJobs.length === 1 ? '' : 's'}`);
      }
    }

    void loadRoutes();
    return () => {
      cancelled = true;
    };
  }, [routeJobs, ready]);

  function recenter() {
    setUserMoved(false);
    const map = mapRef.current;
    if (!map || locations.length === 0) return;
    if (locations.length === 1) {
      const only = locations[0];
      if (only) map.setView([only.lat, only.lng], Math.max(map.getZoom(), 13));
      return;
    }
    const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng] as [number, number]));
    map.fitBounds(bounds.pad(0.25), { maxZoom: 14 });
  }

  return (
    <div style={{ position: 'relative', height: '100%', minHeight: 420 }}>
      <div
        style={{
          position: 'absolute',
          zIndex: 500,
          top: 12,
          left: 12,
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <div style={chipStyle}>{countLabel} on map</div>
        {routeNote ? <div style={chipStyle}>{routeNote}</div> : null}
        {userMoved ? (
          <button type="button" onClick={recenter} style={{ ...chipStyle, cursor: 'pointer' }}>
            Recenter
          </button>
        ) : null}
      </div>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}

const chipStyle: CSSProperties = {
  padding: '6px 10px',
  borderRadius: 8,
  background: 'rgba(15,20,25,0.85)',
  border: '1px solid var(--border)',
  fontSize: 13,
  color: 'var(--muted)',
};

function popupHtml(loc: DriverLocationSnapshotDto): string {
  const when = new Date(loc.timestamp).toLocaleTimeString();
  const ageSec = Math.max(0, Math.round((Date.now() - loc.timestamp) / 1000));
  const age = ageSec < 60 ? `${ageSec}s ago` : `${Math.round(ageSec / 60)}m ago`;
  const name = loc.driverName?.trim() || `Driver ${loc.driverId.slice(0, 8)}…`;
  return `<strong>${name}</strong><br/>${when} (${age})`;
}
