'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, getToken } from '@/lib/api';
import type { AttackSurfaceGraph } from '@/lib/attack-surface-layout';
import { useHydrated } from '@/lib/use-hydrated';
import {
  btnSecondary,
  messageErr,
  pageSubtitle,
  pageTitle,
  selectField,
} from '@/lib/ui';

const AttackSurfaceFlow = dynamic(() => import('@/components/AttackSurfaceFlow'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-white/[0.07] bg-zinc-950/40 text-sm text-zinc-500">
      Loading graph engine…
    </div>
  ),
});

type Domain = { _id: string; name: string };

function AttackSurfaceInner() {
  const router = useRouter();
  const hydrated = useHydrated();
  const searchParams = useSearchParams();
  const qDomain = searchParams.get('domainId') || '';

  const [domains, setDomains] = useState<Domain[]>([]);
  const [domainId, setDomainId] = useState(qDomain);
  const [graph, setGraph] = useState<AttackSurfaceGraph | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const loadDomains = useCallback(() => {
    api<Domain[]>('/domains').then((d) => {
      setDomains(d);
      setDomainId((prev) => prev || qDomain || d[0]?._id || '');
    });
  }, [qDomain]);

  useEffect(() => {
    if (!hydrated) return;
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    loadDomains();
  }, [hydrated, router, loadDomains]);

  useEffect(() => {
    if (!hydrated || !domainId || !getToken()) return;
    setLoading(true);
    setErr('');
    api<AttackSurfaceGraph>(`/subdomains/attack-surface?domainId=${encodeURIComponent(domainId)}`)
      .then(setGraph)
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [hydrated, domainId]);

  if (!hydrated) return null;
  if (!getToken()) return null;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-400/90">
            Attack surface view
          </p>
          <h1 className={pageTitle}>Exposure map</h1>
          <p className={pageSubtitle}>
            Live topology: monitored domain → discovered hosts → resolved IPs (TLS peer + apex DNS from
            profiling) → HTTPS/TLS services from your latest SSL checks.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/domains" className={btnSecondary}>
            Domains
          </Link>
          <Link href={`/subdomains${domainId ? `?domainId=${domainId}` : ''}`} className={btnSecondary}>
            Subdomains
          </Link>
        </div>
      </header>

      <section className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="flex min-w-[14rem] flex-1 flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
            Scope
          </span>
          <select
            value={domainId}
            onChange={(e) => setDomainId(e.target.value)}
            className={selectField}
          >
            <option value="">Select domain…</option>
            {domains.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        {loading && (
          <p className="text-sm text-zinc-500">
            Building graph…{' '}
            <span className="text-zinc-600">
              Run SSL checks on hosts to populate TLS peer IPs and service fingerprints.
            </span>
          </p>
        )}
      </section>

      {err && <p className={messageErr}>{err}</p>}

      {!domainId && (
        <p className="rounded-xl border border-white/[0.08] bg-black/25 px-4 py-3 text-sm text-zinc-400">
          Choose a domain to render its attack surface graph.
        </p>
      )}

      {domainId && graph && !loading && (
        <>
          <AttackSurfaceFlow graph={graph} />
          <p className="text-center text-xs leading-relaxed text-zinc-600">
            Drag the canvas, scroll to zoom. Apex IPs come from domain intelligence; host IPs appear after a
            successful TLS handshake on port 443.
          </p>
        </>
      )}
    </div>
  );
}

export default function AttackSurfacePage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-sm text-zinc-500">Loading attack surface…</div>
      }
    >
      <AttackSurfaceInner />
    </Suspense>
  );
}
