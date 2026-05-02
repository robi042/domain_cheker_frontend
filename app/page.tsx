'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getToken() ? '/dashboard' : '/login');
  }, [router]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 animate-pulse rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-90 shadow-lg shadow-emerald-900/40" />
      <p className="text-sm text-zinc-500">Redirecting…</p>
    </div>
  );
}
