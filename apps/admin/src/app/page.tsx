'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { getAccessToken, getStoredUser } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    const user = getStoredUser();
    if (token && user?.role === 'ADMIN') {
      router.replace('/live');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return <main style={{ padding: 32, color: 'var(--muted)' }}>Loading…</main>;
}
