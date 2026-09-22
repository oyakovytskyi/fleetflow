'use client';

import { useState, type CSSProperties, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { login } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.includes('@')) {
      setBusy(false);
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setBusy(false);
      setError('Password must be at least 8 characters.');
      return;
    }
    try {
      await login(trimmedEmail, password);
      router.replace('/live');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
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
          gap: 16,
          padding: 32,
          border: '1px solid var(--border)',
          background: 'var(--panel)',
          borderRadius: 14,
          boxShadow: '0 24px 48px rgba(0,0,0,0.35)',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: '0.14em',
              color: 'var(--muted)',
              fontWeight: 600,
            }}
          >
            FLEETFLOW
          </div>
          <h1 style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 700 }}>Operations sign in</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: 15, lineHeight: 1.45 }}>
            Live map and delivery management for operators.
          </p>
        </div>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 500 }}>Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            placeholder="you@company.com"
            style={inputStyle}
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 500 }}>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            minLength={8}
            placeholder="••••••••"
            style={inputStyle}
          />
        </label>

        {error ? (
          <p style={{ margin: 0, color: 'var(--danger)', fontSize: 14 }} role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          style={{
            marginTop: 4,
            border: 0,
            borderRadius: 10,
            padding: '12px 16px',
            background: 'var(--accent)',
            color: '#fff',
            fontWeight: 600,
            cursor: busy ? 'wait' : 'pointer',
            opacity: busy ? 0.85 : 1,
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
  borderRadius: 10,
  padding: '11px 12px',
  background: 'var(--panel-elevated)',
  color: 'var(--text)',
};
