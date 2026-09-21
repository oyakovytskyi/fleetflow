'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  isDeliveryLifecycleEvent,
  type DeliveryDto,
  type DeliveryLifecycleEvent,
  type DriverLocationSnapshotDto,
} from '@fleetflow/shared-types';

import { createDelivery, fetchDeliveries, fetchLocations } from '@/lib/api';
import { clearSession, getAccessToken, getStoredUser } from '@/lib/auth';
import { AdminLiveSocket } from '@/lib/ws';

const LiveMap = dynamic(() => import('@/components/LiveMap').then((m) => m.LiveMap), {
  ssr: false,
  loading: () => <div style={{ padding: 24, color: 'var(--muted)' }}>Loading map…</div>,
});

const DEMO_DELIVERY = {
  title: 'Demo Prague drop',
  description: 'Seeded from admin for phone ↔ live-map testing',
  pickupLatitude: 50.087,
  pickupLongitude: 14.421,
  destinationLatitude: 50.105,
  destinationLongitude: 14.45,
};

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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [locations, setLocations] = useState<DriverLocationSnapshotDto[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryDto[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [socketStatus, setSocketStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING'>(
    'DISCONNECTED',
  );
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
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
    setUserEmail(stored.email);

    let cancelled = false;
    const socket = new AdminLiveSocket();

    async function bootstrap() {
      try {
        const [locs, dels] = await Promise.all([fetchLocations(), fetchDeliveries()]);
        if (!cancelled) {
          setLocations(locs);
          setDeliveries(dels);
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
    socket.connect(token);

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

  async function seedDemo() {
    setSeeding(true);
    setError(null);
    try {
      await createDelivery(DEMO_DELIVERY);
      // List/activity updates arrive over the delivery.created socket event.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create demo delivery');
    } finally {
      setSeeding(false);
    }
  }

  function signOut() {
    clearSession();
    router.replace('/login');
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(15,20,25,0.85)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div>
          <div style={{ fontSize: 12, letterSpacing: '0.1em', color: 'var(--muted)' }}>FLEETFLOW</div>
          <h1 style={{ margin: 0, fontSize: 22 }}>Live map</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>
            {userEmail ?? 'admin'} · {socketStatus.toLowerCase()}
            {freshestAge ? ` · last ping ${freshestAge}` : ''}
          </span>
          <button type="button" onClick={signOut} style={ghostBtn}>
            Sign out
          </button>
        </div>
      </header>

      <div className="live-layout" style={layoutStyle}>
        <aside style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
          <Stat label="Active drivers" value={String(locations.length)} />
          <Stat label="In progress" value={String(counts.IN_PROGRESS)} />
          <Stat label="Assigned" value={String(counts.ASSIGNED)} />
          <Stat label="Pending" value={String(counts.PENDING)} />
          <Stat label="Completed" value={String(counts.COMPLETED)} />

          <button type="button" onClick={() => void seedDemo()} disabled={seeding} style={primaryBtn}>
            {seeding ? 'Creating…' : 'Seed Prague demo delivery'}
          </button>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 12, lineHeight: 1.4 }}>
            Drivers get a local notification on new jobs. This panel updates over WebSocket.
          </p>

          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 10,
              background: 'var(--panel)',
              padding: 12,
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Activity</div>
            {activity.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>Waiting for events…</p>
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
          <LiveMap locations={locations} />
        </section>
      </div>

      <style>{`
        .live-layout {
          display: grid;
          grid-template-columns: minmax(220px, 280px) 1fr;
          gap: 16px;
          padding: 16px;
          min-height: 0;
        }
        @media (max-width: 840px) {
          .live-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
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

const layoutStyle = {
  display: 'grid',
  gap: 16,
  padding: 16,
  minHeight: 0,
} as const;

const ghostBtn = {
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--text)',
  borderRadius: 8,
  padding: '8px 12px',
  cursor: 'pointer',
} as const;

const primaryBtn = {
  border: 0,
  borderRadius: 8,
  padding: '12px 14px',
  background: 'var(--accent)',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
} as const;
