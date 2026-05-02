'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken } from '@/lib/api';
import { useHydrated } from '@/lib/use-hydrated';
import {
  cardInner,
  messageErr,
  pageSubtitle,
  pageTitle,
} from '@/lib/ui';

type PopulatedSub = { _id: string; name: string };

type NotificationRow = {
  _id: string;
  subdomainId: PopulatedSub | string;
  type: string;
  sentAt: string;
  certExpiresAt?: string;
};

export default function AlertsPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!hydrated) return;
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    api<NotificationRow[]>('/notifications')
      .then(setRows)
      .catch((e: Error) => setErr(e.message));
  }, [hydrated, router]);

  function host(n: NotificationRow): string {
    const sub = n.subdomainId;
    if (sub && typeof sub === 'object' && 'name' in sub) {
      return sub.name;
    }
    return String(sub);
  }

  if (!hydrated) return null;
  if (!getToken()) return null;

  return (
    <div className="space-y-10">
      <header>
        <h1 className={pageTitle}>Alerts</h1>
        <p className={pageSubtitle}>
          Email notifications when certificates approach expiry (configure SMTP on the API).
        </p>
      </header>

      {err && <p className={messageErr}>{err}</p>}

      <div className={cardInner}>
        <ul className="divide-y divide-white/[0.06]">
          {rows.length === 0 && (
            <li className="px-6 py-14 text-center text-sm text-zinc-500">
              No alerts logged yet.
            </li>
          )}
          {rows.map((r) => (
            <li key={r._id} className="px-6 py-5 transition hover:bg-white/[0.02]">
              <p className="font-mono text-sm font-medium text-emerald-300/95">{host(r)}</p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                <span className="text-zinc-400">{r.type.replace('_', ' ')}</span>
                {' · '}
                {new Date(r.sentAt).toLocaleString()}
                {r.certExpiresAt && (
                  <>
                    {' · '}
                    cert {new Date(r.certExpiresAt).toLocaleDateString()}
                  </>
                )}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
