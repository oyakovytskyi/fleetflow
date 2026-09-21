'use client';

import { useState, type CSSProperties, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { login } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@fleetflow.dev');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      router.replace('/live');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: 'min(420px, 100%)',
          display: 'grid',
          gap: 14,
          padding: 28,
          border: '1px solid var(--border)',
          background: 'var(--panel)',
          borderRadius: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 13, letterSpacing: '0.08em', color: 'var(--muted)' }}>
            FLEETFLOW
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 28 }}>Admin sign in</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: 14 }}>
            Use an account registered with role <code>ADMIN</code>.
          </p>
        </div>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            style={inputStyle}
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            style={inputStyle}
          />
        </label>

        {error ? (
          <p style={{ margin: 0, color: 'var(--danger)', fontSize: 14 }}>{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          style={{
            marginTop: 4,
            border: 0,
            borderRadius: 8,
            padding: '12px 16px',
            background: 'var(--accent)',
            color: '#fff',
            fontWeight: 600,
            cursor: busy ? 'wait' : 'pointer',
          }}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}

const inputStyle: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '10px 12px',
  background: '#0c1117',
  color: 'var(--text)',
};
