'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import { clearSession, getStoredUser } from '@/lib/auth';

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(getStoredUser()?.email ?? null);
  }, []);

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
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(15,20,25,0.9)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.1em', color: 'var(--muted)' }}>FLEETFLOW</div>
            <div style={{ fontWeight: 700 }}>Admin</div>
          </div>
          <nav style={{ display: 'flex', gap: 8 }}>
            <NavLink href="/live" active={Boolean(pathname?.startsWith('/live'))}>
              Live map
            </NavLink>
            <NavLink href="/deliveries" active={Boolean(pathname?.startsWith('/deliveries'))}>
              Deliveries
            </NavLink>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>{email ?? 'admin'}</span>
          <button type="button" onClick={signOut} style={ghostBtn}>
            Sign out
          </button>
        </div>
      </header>
      {children}
    </main>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: '8px 12px',
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: active ? 'var(--accent-soft)' : 'transparent',
        color: 'var(--text)',
        fontSize: 14,
        fontWeight: active ? 700 : 500,
      }}
    >
      {children}
    </Link>
  );
}

const ghostBtn = {
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--text)',
  borderRadius: 8,
  padding: '8px 12px',
  cursor: 'pointer',
} as const;
