'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, getToken } from '@/lib/api';
import { useHydrated } from '@/lib/use-hydrated';
import { sslDaysLeft, toneClass } from '@/lib/cert';
import { SubdomainChangeDetection } from '@/components/SubdomainChangeDetection';
import { SslHealthOverview } from '@/components/SslHealthOverview';
import {
  formatHealthTooltip,
  riskBadgeClasses,
  type SslHealthBreakdown,
} from '@/lib/ssl-health';
import {
  btnDanger,
  btnMuted,
  btnPrimary,
  btnSecondary,
  card,
  cardInner,
  field,
  label,
  messageErr,
  messageOk,
  pageSubtitle,
  pageTitle,
  selectField,
} from '@/lib/ui';

type Domain = { _id: string; name: string };
type Subdomain = {
  _id: string;
  name: string;
  source?: string;
  absentFromDiscoverySince?: string;
  lastSeenInDiscoveryAt?: string;
  sslExpireAt?: string;
  sslIssuedAt?: string;
  sslIssuer?: string;
  sslHealthScore?: number;
  sslHealthStatus?: string;
  sslHealthBreakdown?: SslHealthBreakdown;
  lastCheckedAt?: string;
  status: string;
};

function SubdomainsInner() {
  const router = useRouter();
  const hydrated = useHydrated();
  const searchParams = useSearchParams();
  const qDomain = searchParams.get('domainId') || '';

  const [domains, setDomains] = useState<Domain[]>([]);
  const [domainId, setDomainId] = useState(qDomain);
  const [subs, setSubs] = useState<Subdomain[]>([]);
  const [manual, setManual] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [checkingAll, setCheckingAll] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    api<Domain[]>('/domains').then((d) => {
      setDomains(d);
      setDomainId((prev) => prev || qDomain || d[0]?._id || '');
    });
  }, [hydrated, router, qDomain]);

  useEffect(() => {
    if (!hydrated || !domainId || !getToken()) return;
    api<Subdomain[]>(`/subdomains?domainId=${domainId}`)
      .then(setSubs)
      .catch((e: Error) => setErr(e.message));
  }, [hydrated, domainId]);

  async function addManual(e: FormEvent) {
    e.preventDefault();
    setErr('');
    try {
      await api('/subdomains', {
        method: 'POST',
        body: JSON.stringify({ domainId, name: manual }),
      });
      setManual('');
      setMsg('Subdomain added.');
      const list = await api<Subdomain[]>(`/subdomains?domainId=${domainId}`);
      setSubs(list);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed');
    }
  }

  async function queueSsl(id: string) {
    setErr('');
    try {
      await api(`/ssl/check/${id}`, { method: 'POST' });
      setMsg('SSL check queued.');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed');
    }
  }

  async function queueSslAllForDomain() {
    if (!domainId || subs.length === 0) return;
    setErr('');
    setCheckingAll(true);
    try {
      const res = await api<{ queued: number }>(`/ssl/check/domain/${domainId}`, {
        method: 'POST',
      });
      setMsg(`Queued SSL checks for ${res.queued} subdomain(s). Workers will update certificates shortly.`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed');
    } finally {
      setCheckingAll(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this subdomain?')) return;
    setErr('');
    try {
      await api(`/subdomains/${id}`, { method: 'DELETE' });
      setSubs((s) => s.filter((x) => x._id !== id));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed');
    }
  }

  if (!hydrated) return null;
  if (!getToken()) return null;

  return (
    <div className="space-y-10">
      <header>
        <h1 className={pageTitle}>Subdomains</h1>
        <p className={pageSubtitle}>
          TLS checks always run via queue — per-host or all subdomains for the selected domain.
        </p>
      </header>

      <section
        className={`${card} flex flex-col gap-6 p-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:p-8`}
      >
        <div className="min-w-[14rem] flex-1">
          <span className={label}>Domain</span>
          <select
            value={domainId}
            onChange={(e) => setDomainId(e.target.value)}
            className={`${selectField} mt-2`}
          >
            {domains.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={domainId ? `/attack-surface?domainId=${domainId}` : '/attack-surface'}
            className={`${btnSecondary} px-4 py-2.5 text-sm no-underline hover:no-underline`}
          >
            Attack surface map
          </Link>
          <button
            type="button"
            disabled={!domainId || subs.length === 0 || checkingAll}
            onClick={() => void queueSslAllForDomain()}
            className={`${btnSecondary} px-4 py-2.5 text-sm disabled:pointer-events-none disabled:opacity-40`}
          >
            {checkingAll ? 'Queueing…' : 'Check all SSL'}
          </button>
          <p className="max-w-xs text-xs leading-relaxed text-zinc-500">
            Enqueues one background job per subdomain for this domain (no blocking TLS).
          </p>
        </div>
      </section>

      {domainId ? <SubdomainChangeDetection domainId={domainId} /> : null}

      <SslHealthOverview subs={subs} />

      <section className={`${card} p-6 sm:p-8`}>
        <form onSubmit={addManual} className="flex flex-col gap-5 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="manual-sub" className={label}>
              Manual hostname
            </label>
            <input
              id="manual-sub"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="api.example.com"
              className={`${field} mt-2`}
            />
          </div>
          <button type="submit" disabled={!domainId} className={`${btnPrimary} shrink-0`}>
            Add subdomain
          </button>
        </form>
      </section>

      {msg && <p className={messageOk}>{msg}</p>}
      {err && <p className={messageErr}>{err}</p>}

      <div className={`${cardInner} overflow-x-auto`}>
        <table className="w-full min-w-[102rem] text-left text-sm">
          <thead className="border-b border-white/[0.06] bg-white/[0.03] text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
            <tr>
              <th className="whitespace-nowrap px-4 py-4 font-semibold lg:px-6">Host</th>
              <th className="whitespace-nowrap px-4 py-4 font-semibold lg:px-6">CT track</th>
              <th className="whitespace-nowrap px-4 py-4 font-semibold lg:px-6">Issue date</th>
              <th className="min-w-[11rem] px-4 py-4 font-semibold lg:px-6">Issuer</th>
              <th className="whitespace-nowrap px-4 py-4 font-semibold lg:px-6">SSL expiry</th>
              <th className="whitespace-nowrap px-4 py-4 font-semibold lg:px-6">Days left</th>
              <th className="whitespace-nowrap px-4 py-4 font-semibold lg:px-6">Health</th>
              <th className="whitespace-nowrap px-4 py-4 font-semibold lg:px-6">Risk</th>
              <th className="whitespace-nowrap px-4 py-4 font-semibold lg:px-6">Last checked</th>
              <th className="whitespace-nowrap px-4 py-4 font-semibold lg:px-6">Status</th>
              <th className="whitespace-nowrap px-4 py-4 text-right font-semibold lg:px-6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {subs.length === 0 && (
              <tr>
                <td colSpan={11} className="px-6 py-14 text-center text-sm text-zinc-500">
                  No subdomains for this domain.
                </td>
              </tr>
            )}
            {subs.map((s) => {
              const left = sslDaysLeft(s.sslExpireAt);
              const tip = formatHealthTooltip(s.sslHealthBreakdown);
              return (
                <tr key={s._id} className="transition hover:bg-white/[0.02]">
                  <td className="whitespace-nowrap px-4 py-4 font-mono text-xs text-zinc-200 lg:px-6">
                    {s.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 lg:px-6">
                    {s.source === 'manual' ? (
                      <span className="inline-flex rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400 ring-1 ring-white/10">
                        Manual
                      </span>
                    ) : s.absentFromDiscoverySince ? (
                      <span
                        className="inline-flex max-w-[8rem] truncate rounded-full bg-amber-950/70 px-2 py-0.5 text-[10px] font-semibold text-amber-100 ring-1 ring-amber-500/30"
                        title={`Last seen in CT poll before ${new Date(s.absentFromDiscoverySince).toLocaleString()}`}
                      >
                        Dropped
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-500/85">
                        In CT
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-zinc-400 lg:px-6">
                    {s.sslIssuedAt ? new Date(s.sslIssuedAt).toLocaleString() : '—'}
                  </td>
                  <td className="max-w-[14rem] px-4 py-4 text-zinc-400 lg:max-w-[18rem] lg:px-6">
                    {s.sslIssuer ? (
                      <span className="block truncate text-xs leading-snug" title={s.sslIssuer}>
                        {s.sslIssuer}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-zinc-400 lg:px-6">
                    {s.sslExpireAt ? new Date(s.sslExpireAt).toLocaleString() : '—'}
                  </td>
                  <td className={`whitespace-nowrap px-4 py-4 lg:px-6 ${toneClass(left.tone)}`}>
                    {left.label}
                  </td>
                  <td
                    className="whitespace-nowrap px-4 py-4 lg:px-6"
                    title={tip || undefined}
                  >
                    {typeof s.sslHealthScore === 'number' ? (
                      <span className="inline-flex min-w-[2.25rem] items-center justify-center rounded-lg bg-white/[0.07] px-2 py-1 text-sm font-bold tabular-nums text-white ring-1 ring-white/[0.1]">
                        {s.sslHealthScore}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 lg:px-6" title={tip || undefined}>
                    {s.sslHealthStatus ? (
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${riskBadgeClasses(s.sslHealthBreakdown?.statusKey)}`}
                      >
                        {s.sslHealthStatus}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-zinc-500 lg:px-6">
                    {s.lastCheckedAt ? new Date(s.lastCheckedAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-4 lg:px-6">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        s.status === 'expired'
                          ? 'bg-rose-950/80 text-rose-200 ring-1 ring-rose-500/25'
                          : 'bg-emerald-950/70 text-emerald-200 ring-1 ring-emerald-500/20'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right lg:px-6">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => queueSsl(s._id)} className={btnMuted}>
                        Check SSL
                      </button>
                      <button type="button" onClick={() => remove(s._id)} className={btnDanger}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SubdomainsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-sm text-zinc-500">Loading subdomains…</div>
      }
    >
      <SubdomainsInner />
    </Suspense>
  );
}
