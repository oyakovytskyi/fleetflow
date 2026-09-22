'use client';

import { useCallback, useEffect, useState, type CSSProperties, type FormEvent } from 'react';
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

const EMPTY_FORM = {
  title: '',
  description: '',
  pickupLatitude: '',
  pickupLongitude: '',
  destinationLatitude: '',
  destinationLongitude: '',
};

type LoadState = 'loading' | 'ready' | 'error';

type CreateForm = {
  title: string;
  description: string;
  pickupLatitude: string;
  pickupLongitude: string;
  destinationLatitude: string;
  destinationLongitude: string;
};

export default function DeliveriesPage() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<DeliveryDto[]>([]);
  const [drivers, setDrivers] = useState<UserDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoadState('loading');
    setError(null);
    try {
      const [dels, drvs] = await Promise.all([fetchDeliveries(), fetchDrivers()]);
      setDeliveries(dels);
      setDrivers(drvs);
      setLoadState('ready');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load deliveries');
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || getStoredUser()?.role !== 'ADMIN') {
      router.replace('/login');
      return;
    }
    void load();
  }, [router, load]);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const title = form.title.trim();
    if (!title) {
      setError('Title is required.');
      return;
    }
    const pickupLatitude = Number(form.pickupLatitude);
    const pickupLongitude = Number(form.pickupLongitude);
    const destinationLatitude = Number(form.destinationLatitude);
    const destinationLongitude = Number(form.destinationLongitude);
    if (
      [pickupLatitude, pickupLongitude, destinationLatitude, destinationLongitude].some(
        (n) => Number.isNaN(n),
      )
    ) {
      setError('Coordinates must be valid numbers.');
      return;
    }

    setCreating(true);
    try {
      const created = await createDelivery({
        title,
        description: form.description.trim() || undefined,
        pickupLatitude,
        pickupLongitude,
        destinationLatitude,
        destinationLongitude,
      });
      setDeliveries((prev) => [created, ...prev]);
      setForm((prev) => ({ ...prev, title: '', description: '' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setCreating(false);
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
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Deliveries</h1>
          <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: 14 }}>
            Create jobs and assign drivers. Race-safe assign is enforced by the API.
          </p>
        </div>

        <form
          onSubmit={(e) => void onCreate(e)}
          style={{
            border: '1px solid var(--border)',
            borderRadius: 10,
            background: 'var(--panel)',
            padding: 14,
            display: 'grid',
            gap: 12,
          }}
        >
          <strong style={{ fontSize: 15 }}>Create delivery</strong>
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <Field
              label="Title"
              value={form.title}
              onChange={(title) => setForm((f) => ({ ...f, title }))}
              required
              placeholder="Downtown pickup"
            />
            <Field
              label="Description"
              value={form.description}
              onChange={(description) => setForm((f) => ({ ...f, description }))}
              placeholder="Optional notes"
            />
          </div>
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            <Field
              label="Pickup lat"
              value={form.pickupLatitude}
              onChange={(pickupLatitude) => setForm((f) => ({ ...f, pickupLatitude }))}
              required
              placeholder="50.087"
            />
            <Field
              label="Pickup lng"
              value={form.pickupLongitude}
              onChange={(pickupLongitude) => setForm((f) => ({ ...f, pickupLongitude }))}
              required
              placeholder="14.421"
            />
            <Field
              label="Destination lat"
              value={form.destinationLatitude}
              onChange={(destinationLatitude) => setForm((f) => ({ ...f, destinationLatitude }))}
              required
              placeholder="50.100"
            />
            <Field
              label="Destination lng"
              value={form.destinationLongitude}
              onChange={(destinationLongitude) => setForm((f) => ({ ...f, destinationLongitude }))}
              required
              placeholder="14.440"
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="submit" style={primaryBtn} disabled={creating || loadState === 'loading'}>
              {creating ? 'Creating…' : 'Create delivery'}
            </button>
            <button
              type="button"
              style={ghostBtn}
              onClick={() => setForm(EMPTY_FORM)}
              disabled={creating}
            >
              Clear
            </button>
          </div>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 12 }}>
            Coordinates are WGS84 decimal degrees (pickup and destination).
          </p>
        </form>

        {error ? <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p> : null}

        {loadState === 'loading' ? (
          <p style={{ color: 'var(--muted)', margin: 0 }}>Loading deliveries…</p>
        ) : null}

        {loadState === 'error' ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <p style={{ color: 'var(--muted)', margin: 0 }}>Could not load the deliveries list.</p>
            <button type="button" onClick={() => void load()} style={ghostBtn}>
              Retry
            </button>
          </div>
        ) : null}

        {loadState === 'ready' ? (
          <div style={{ display: 'grid', gap: 10 }}>
            {deliveries.length === 0 ? (
              <div style={{ display: 'grid', gap: 6 }}>
                <p style={{ margin: 0, fontWeight: 600 }}>No deliveries yet</p>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
                  Use the form above to create a job, then assign a driver.
                </p>
              </div>
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
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}
                  >
                    <div>
                      <strong>{delivery.title}</strong>
                      <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
                        {delivery.status.replaceAll('_', ' ')}
                        {delivery.driverId
                          ? ` · ${
                              drivers.find((d) => d.id === delivery.driverId)?.name ??
                              `driver ${delivery.driverId.slice(0, 8)}…`
                            }`
                          : ''}
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>
                        {delivery.pickupLatitude.toFixed(4)}, {delivery.pickupLongitude.toFixed(4)}
                        {' → '}
                        {delivery.destinationLatitude.toFixed(4)},{' '}
                        {delivery.destinationLongitude.toFixed(4)}
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
        ) : null}

        {loadState === 'ready' && drivers.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>
            No drivers registered yet. Create a DRIVER account from the mobile app, then refresh.
          </p>
        ) : null}
      </div>
    </AdminShell>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ color: 'var(--muted)', fontSize: 12 }}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        style={inputStyle}
      />
    </label>
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

const inputStyle: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '8px 10px',
  background: '#0c1117',
  color: 'var(--text)',
};
