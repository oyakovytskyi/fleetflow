'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { DeliveryDto, UserDto } from '@fleetflow/shared-types';

import { AdminShell } from '@/components/AdminShell';
import {
  assignDelivery,
  cancelDelivery,
  createDelivery,
  fetchDeliveries,
  fetchDrivers,
} from '@/lib/api';
import { getAccessToken, getStoredUser } from '@/lib/auth';

const DEMO = {
  title: 'Admin-created Prague job',
  description: 'Created from Deliveries page',
  pickupLatitude: 50.087,
  pickupLongitude: 14.421,
  destinationLatitude: 50.1,
  destinationLongitude: 14.44,
};

export default function DeliveriesPage() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<DeliveryDto[]>([]);
  const [drivers, setDrivers] = useState<UserDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || getStoredUser()?.role !== 'ADMIN') {
      router.replace('/login');
      return;
    }

    void Promise.all([fetchDeliveries(), fetchDrivers()])
      .then(([dels, drvs]) => {
        setDeliveries(dels);
        setDrivers(drvs);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load deliveries');
      });
  }, [router]);

  async function onCreate() {
    setError(null);
    try {
      const created = await createDelivery(DEMO);
      setDeliveries((prev) => [created, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    }
  }

  async function onAssign(deliveryId: string, driverId: string) {
    setBusyId(deliveryId);
    setError(null);
    try {
      const updated = await assignDelivery(deliveryId, driverId);
      setDeliveries((prev) => prev.map((d) => (d.id === deliveryId ? updated : d)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assign failed');
    } finally {
      setBusyId(null);
    }
  }

  async function onCancel(deliveryId: string) {
    setBusyId(deliveryId);
    setError(null);
    try {
      const updated = await cancelDelivery(deliveryId);
      setDeliveries((prev) => prev.map((d) => (d.id === deliveryId ? updated : d)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminShell>
      <div style={{ padding: 20, display: 'grid', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24 }}>Deliveries</h1>
            <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: 14 }}>
              Create jobs and assign drivers. Race-safe assign is enforced by the API.
            </p>
          </div>
          <button type="button" onClick={() => void onCreate()} style={primaryBtn}>
            Create Prague delivery
          </button>
        </div>

        {error ? <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p> : null}

        <div style={{ display: 'grid', gap: 10 }}>
          {deliveries.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No deliveries yet.</p>
          ) : (
            deliveries.map((delivery) => (
              <article
                key={delivery.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  background: 'var(--panel)',
                  padding: 14,
                  display: 'grid',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <strong>{delivery.title}</strong>
                    <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
                      {delivery.status.replaceAll('_', ' ')}
                      {delivery.driverId ? ` · driver ${delivery.driverId.slice(0, 8)}…` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {(delivery.status === 'PENDING' || delivery.status === 'ASSIGNED') &&
                    drivers.length > 0 ? (
                      <select
                        defaultValue=""
                        disabled={busyId === delivery.id}
                        onChange={(e) => {
                          const driverId = e.target.value;
                          if (driverId) void onAssign(delivery.id, driverId);
                          e.target.value = '';
                        }}
                        style={selectStyle}
                      >
                        <option value="" disabled>
                          Assign driver…
                        </option>
                        {drivers.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name} ({driver.email})
                          </option>
                        ))}
                      </select>
                    ) : null}
                    {delivery.status !== 'COMPLETED' && delivery.status !== 'CANCELLED' ? (
                      <button
                        type="button"
                        disabled={busyId === delivery.id}
                        onClick={() => void onCancel(delivery.id)}
                        style={ghostBtn}
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {drivers.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>
            No drivers registered yet. Create a DRIVER account from the mobile app, then refresh.
          </p>
        ) : null}
      </div>
    </AdminShell>
  );
}

const primaryBtn = {
  border: 0,
  borderRadius: 8,
  padding: '10px 14px',
  background: 'var(--accent)',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
} as const;

const ghostBtn = {
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--text)',
  borderRadius: 8,
  padding: '8px 12px',
  cursor: 'pointer',
} as const;

const selectStyle = {
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '8px 10px',
  background: '#0c1117',
  color: 'var(--text)',
} as const;
