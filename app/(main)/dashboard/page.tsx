'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExpiryTimelineBoard } from '@/components/ExpiryTimelineBoard';
import { api, getToken } from '@/lib/api';
import { useHydrated } from '@/lib/use-hydrated';
import { btnSecondary, card, messageErr, pageSubtitle, pageTitle } from '@/lib/ui';

type ExpiryTimeline = {
  expired: number;
  due0to7Days: number;
  due8to30Days: number;
  beyond30Days: number;
  noExpiryData: number;
};

type Summary = {
  totalDomains: number;
  totalSubdomains: number;
  expiringSoon: number;
  expired: number;
  expiryTimeline: ExpiryTimeline;
};

export default function DashboardPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [data, setData] = useState<Summary | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!hydrated) return;
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    api<Summary>('/dashboard/summary')
      .then(setData)
      .catch((e: Error) => setErr(e.message));
  }, [hydrated, router]);

  if (!hydrated) return null;
  if (!getToken()) return null;

  const timeline: ExpiryTimeline =
    data?.expiryTimeline ?? {
      expired: 0,
      due0to7Days: 0,
      due8to30Days: 0,
      beyond30Days: 0,
      noExpiryData: 0,
    };

  const statDeck = [
    {
      label: 'Domains',
      value: data?.totalDomains ?? '—',
      hint: 'Roots under watch',
      tint: 'from-white/[0.07] to-transparent',
      accent: 'text-white',
    },
    {
      label: 'Hosts',
      value: data?.totalSubdomains ?? '—',
      hint: 'Subdomains monitored',
      tint: 'from-sky-500/12 to-transparent',
      accent: 'text-sky-100',
    },
    {
      label: 'Expired',
      value: data?.expired ?? '—',
      hint: 'Past validity / TLS failure',
      tint: 'from-rose-500/14 to-transparent',
      accent: 'text-rose-200',
    },
    {
      label: 'Due ≤ 7d',
      value: data?.expiringSoon ?? '—',
      hint: 'Still valid, urgent window',
      tint: 'from-amber-500/14 to-transparent',
      accent: 'text-amber-200',
    },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Mission overview
          </p>
          <h1 className={pageTitle}>Dashboard</h1>
          <p className={pageSubtitle}>
            Background SSL workers keep certificates warm; this board summarizes horizon risk across your
            fleet.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/subdomains" className={btnSecondary}>
            Subdomains
          </Link>
          <Link href="/attack-surface" className={btnSecondary}>
            Attack surface
          </Link>
        </div>
      </header>

      {err && <p className={messageErr}>{err}</p>}

      <ExpiryTimelineBoard totalHosts={data?.totalSubdomains ?? 0} timeline={timeline} />

      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Fleet counters
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statDeck.map((c) => (
            <div
              key={c.label}
              className={`${card} relative overflow-hidden border-white/[0.08] p-5`}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${c.tint} opacity-95`}
                aria-hidden
              />
              <div className="relative">
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                  {c.label}
                </p>
                <p className={`mt-3 font-mono text-3xl font-semibold tabular-nums tracking-tight ${c.accent}`}>
                  {c.value}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">{c.hint}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
