'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { CircleMarker, Map as LeafletMap } from 'leaflet';
import L from 'leaflet';

import type { DriverLocationSnapshotDto } from '@fleetflow/shared-types';

import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER: [number, number] = [50.087, 14.421];

interface LiveMapProps {
  locations: DriverLocationSnapshotDto[];
}

export function LiveMap({ locations }: LiveMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<string, CircleMarker>>(new Map());
  const [ready, setReady] = useState(false);
  const [userMoved, setUserMoved] = useState(false);

  const countLabel = useMemo(
    () => `${locations.length} driver${locations.length === 1 ? '' : 's'}`,
    [locations.length],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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
    }

    for (const [driverId, marker] of markersRef.current) {
      if (!seen.has(driverId)) {
        marker.remove();
        markersRef.current.delete(driverId);
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
  }, [locations, ready, userMoved]);

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
  return `<strong>Driver</strong> ${loc.driverId.slice(0, 8)}…<br/>${when} (${age})`;
}
