'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  isDeliveryLifecycleEvent,
  type DeliveryDto,
  type DeliveryLifecycleEvent,
  type DriverLocationSnapshotDto,
} from '@fleetflow/shared-types';

import { AdminShell } from '@/components/AdminShell';
import { fetchDeliveries, fetchDriverTrail, fetchLocations } from '@/lib/api';
import { getAccessToken, getStoredUser } from '@/lib/auth';
import { AdminLiveSocket } from '@/lib/ws';

const LiveMap = dynamic(() => import('@/components/LiveMap').then((m) => m.LiveMap), {
  ssr: false,
  loading: () => <div style={{ padding: 24, color: 'var(--muted)' }}>Loading map…</div>,
});

const EVENT_LABEL: Record<DeliveryLifecycleEvent['type'], string> = {
  'delivery.created': 'Created',
  'delivery.assigned': 'Assigned',
  'delivery.started': 'Started',
  'delivery.completed': 'Completed',
  'delivery.cancelled': 'Cancelled',
};

type ActivityItem = {
  id: string;
  at: number;
  type: DeliveryLifecycleEvent['type'];
  title: string;
};

function upsertDelivery(list: DeliveryDto[], delivery: DeliveryDto): DeliveryDto[] {
  const without = list.filter((item) => item.id !== delivery.id);
  return [delivery, ...without];
}

function browserNotify(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

export default function LivePage() {
  const router = useRouter();
  const [locations, setLocations] = useState<DriverLocationSnapshotDto[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryDto[]>([]);
  const [trails, setTrails] = useState<Record<string, { lat: number; lng: number }[]>>({});
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [socketStatus, setSocketStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING'>(
    'DISCONNECTED',
  );
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 5_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    const stored = getStoredUser();
    if (!token || stored?.role !== 'ADMIN') {
      router.replace('/login');
      return;
    }

    let cancelled = false;
    const socket = new AdminLiveSocket();

    async function bootstrap() {
      try {
        const [locs, dels] = await Promise.all([fetchLocations(), fetchDeliveries()]);
        if (cancelled) return;
        setLocations(locs);
        setDeliveries(dels);

        const trailEntries = await Promise.all(
          locs.map(async (loc) => {
            try {
              const trail = await fetchDriverTrail(loc.driverId);
              return [loc.driverId, trail.points.map((p) => ({ lat: p.lat, lng: p.lng }))] as const;
            } catch {
              return [loc.driverId, []] as const;
            }
          }),
        );
        if (!cancelled) {
          setTrails(Object.fromEntries(trailEntries));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load admin data');
        }
      }
    }

    void bootstrap();

    socket.onStatus(setSocketStatus);
    socket.subscribe((event) => {
      if (event.type === 'tracking.snapshot') {
        setLocations(event.payload.locations);
        return;
      }
      if (event.type === 'driver.location.updated') {
        const next = event.payload;
        setLocations((prev) => {
          const without = prev.filter((item) => item.driverId !== next.driverId);
          return [
            ...without,
            {
              driverId: next.driverId,
              driverName: next.driverName ?? null,
              deliveryId: next.deliveryId ?? null,
              lat: next.lat,
              lng: next.lng,
              timestamp: next.timestamp,
            },
          ];
        });
        return;
      }
      if (isDeliveryLifecycleEvent(event)) {
        const delivery = event.payload.delivery;
        setDeliveries((prev) => upsertDelivery(prev, delivery));
        setActivity((prev) =>
          [
            {
              id: `${event.type}-${delivery.id}-${Date.now()}`,
              at: Date.now(),
              type: event.type,
              title: delivery.title,
            },
            ...prev,
          ].slice(0, 20),
        );
        if (event.type !== 'delivery.created') {
          browserNotify(EVENT_LABEL[event.type], delivery.title);
        }
      }
    });
    socket.connect();

    return () => {
      cancelled = true;
      socket.disconnect();
    };
  }, [router]);

  const counts = useMemo(() => {
    const byStatus = {
      PENDING: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    for (const d of deliveries) {
      byStatus[d.status] += 1;
    }
    return byStatus;
  }, [deliveries]);

  const freshestAge = useMemo(() => {
    if (locations.length === 0) return null;
    const newest = Math.max(...locations.map((l) => l.timestamp));
    const ageSec = Math.max(0, Math.round((now - newest) / 1000));
    if (ageSec < 60) return `${ageSec}s ago`;
    return `${Math.round(ageSec / 60)}m ago`;
  }, [locations, now]);

  return (
    <AdminShell>
      <div style={{ padding: '10px 22px', color: 'var(--muted)', fontSize: 13 }}>
        Socket {socketStatus.toLowerCase()}
        {freshestAge ? ` · last ping ${freshestAge}` : ''}
      </div>
      <div className="live-layout" style={{ display: 'grid', gap: 16, padding: '8px 16px 16px', minHeight: 0 }}>
        <aside style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
          <Stat label="Active drivers" value={String(locations.length)} />
          <Stat label="In progress" value={String(counts.IN_PROGRESS)} />
          <Stat label="Assigned" value={String(counts.ASSIGNED)} />
          <Stat label="Pending" value={String(counts.PENDING)} />
          <Stat label="Completed" value={String(counts.COMPLETED)} />

          <Link href="/deliveries" style={primaryLink}>
            Manage deliveries
          </Link>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 12, lineHeight: 1.45 }}>
            Create and assign jobs from Deliveries. Drivers share GPS while a delivery is in progress.
          </p>

          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 10,
              background: 'var(--panel)',
              padding: 12,
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 600 }}>
              Activity
            </div>
            {activity.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>No recent events</p>
            ) : (
              <div style={{ display: 'grid', rowGap: 8 }}>
                {activity.map((item) => (
                  <div key={item.id} style={{ fontSize: 13, lineHeight: 1.35 }}>
                    <strong>{EVENT_LABEL[item.type]}</strong> · {item.title}
                    <div style={{ color: 'var(--muted)', fontSize: 11 }}>
                      {new Date(item.at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error ? <p style={{ color: 'var(--danger)', fontSize: 13, margin: 0 }}>{error}</p> : null}
        </aside>

        <section
          style={{
            minHeight: '60vh',
            border: '1px solid var(--border)',
            borderRadius: 12,
            overflow: 'hidden',
            background: 'var(--panel)',
          }}
        >
          <LiveMap locations={locations} trails={trails} deliveries={deliveries} />
        </section>
      </div>

      <style>{`
        .live-layout {
          grid-template-columns: minmax(220px, 280px) 1fr;
        }
        @media (max-width: 840px) {
          .live-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 10,
        border: '1px solid var(--border)',
        background: 'var(--panel)',
      }}
    >
      <div style={{ color: 'var(--muted)', fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  );
}

const primaryLink = {
  display: 'block',
  textAlign: 'center' as const,
  border: 0,
  borderRadius: 10,
  padding: '12px 14px',
  background: 'var(--accent)',
  color: '#fff',
  fontWeight: 600,
};
