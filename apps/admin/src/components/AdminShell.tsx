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
          padding: '14px 22px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(11, 16, 22, 0.92)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--muted)', fontWeight: 600 }}>
              FLEETFLOW
            </div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>Operations</div>
          </div>
          <nav style={{ display: 'flex', gap: 6 }}>
            <NavLink href="/live" active={Boolean(pathname?.startsWith('/live'))}>
              Live map
            </NavLink>
            <NavLink href="/deliveries" active={Boolean(pathname?.startsWith('/deliveries'))}>
              Deliveries
            </NavLink>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>{email ?? 'Operator'}</span>
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
        padding: '8px 14px',
        borderRadius: 999,
        border: '1px solid',
        borderColor: active ? 'transparent' : 'var(--border)',
        background: active ? 'var(--accent)' : 'transparent',
        color: active ? '#fff' : 'var(--text)',
        fontSize: 14,
        fontWeight: active ? 600 : 500,
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
