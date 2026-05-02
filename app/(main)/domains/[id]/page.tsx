'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { api, getToken } from '@/lib/api';
import { useHydrated } from '@/lib/use-hydrated';
import {
  btnSecondary,
  card,
  messageErr,
  messageOk,
  pageSubtitle,
  pageTitle,
} from '@/lib/ui';

type IntelPayload = {
  id: string;
  name: string;
  intelligence: {
    fetchedAt?: string;
    whois?: Record<string, unknown>;
    dns?: Record<string, unknown>;
    hosting?: Record<string, unknown>;
  } | null;
};

function formatList(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val.map(String).filter(Boolean);
}

export default function DomainProfilePage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const [data, setData] = useState<IntelPayload | null>(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setErr('');
    api<IntelPayload>(`/domains/${id}/intelligence`)
      .then(setData)
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!hydrated) return;
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    load();
  }, [hydrated, router, load]);

  async function refresh() {
    setErr('');
    setMsg('');
    try {
      await api(`/domains/${id}/intelligence/refresh`, { method: 'POST' });
      setMsg('Profiling queued — WHOIS and DNS can take a short moment.');
      setTimeout(load, 2500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed');
    }
  }

  if (!hydrated) return null;
  if (!getToken()) return null;

  const intel = data?.intelligence;
  const whois = intel?.whois as Record<string, unknown> | undefined;
  const dns = intel?.dns as Record<string, unknown> | undefined;
  const hosting = intel?.hosting as Record<string, unknown> | undefined;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-400/90">
            Domain profiling
          </p>
          <h1 className={pageTitle}>{data?.name ?? (loading ? '…' : 'Domain')}</h1>
          <p className={pageSubtitle}>
            WHOIS, DNS records, and approximate hosting location from the resolved IP — refreshed in the
            background.
          </p>
          {intel?.fetchedAt && (
            <p className="mt-2 text-xs text-zinc-500">
              Last updated {new Date(intel.fetchedAt).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/domains" className={btnSecondary}>
            ← All domains
          </Link>
          <Link href={`/attack-surface?domainId=${id}`} className={btnSecondary}>
            Attack surface
          </Link>
          <Link href={`/subdomains?domainId=${id}`} className={btnSecondary}>
            Subdomains
          </Link>
          <button type="button" className={btnSecondary} onClick={refresh}>
            Refresh intelligence
          </button>
        </div>
      </header>

      {msg && <p className={messageOk}>{msg}</p>}
      {err && <p className={messageErr}>{err}</p>}

      {!loading && !intel && (
        <p className="rounded-xl border border-white/[0.08] bg-black/25 px-4 py-3 text-sm text-zinc-400">
          No intelligence snapshot yet. Click <span className="text-zinc-200">Refresh intelligence</span> or
          wait for the worker after adding the domain.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={`${card} p-6 sm:p-8`}>
          <h2 className="text-lg font-semibold text-white">WHOIS</h2>
          {whois?.error ? (
            <p className="mt-3 text-sm text-rose-300">{String(whois.error)}</p>
          ) : (
            <dl className="mt-4 space-y-3 text-sm">
              <IntelRow label="Registrar" value={whois?.registrar} />
              <IntelRow label="Domain age" value={formatAge(whois?.domainAgeDays)} />
              <IntelRow label="Created" value={formatIso(whois?.createdDate)} />
              <IntelRow label="Updated" value={formatIso(whois?.updatedDate)} />
              <IntelRow label="Expires" value={formatIso(whois?.expiryDate)} />
              <IntelRow label="Registry ID" value={whois?.registryDomainId} mono />
              {Array.isArray(whois?.status) && whois!.status.length > 0 && (
                <div>
                  <dt className={dtClass}>Status</dt>
                  <dd className="mt-1 font-mono text-xs text-zinc-300">
                    {(whois!.status as string[]).join(', ')}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </section>

        <section className={`${card} p-6 sm:p-8`}>
          <h2 className="text-lg font-semibold text-white">Hosting (IP geo)</h2>
          {!dns?.a && !dns?.aaaa && !dns?.error ? (
            <p className="mt-3 text-sm text-zinc-500">No A/AAAA records — cannot infer hosting IP.</p>
          ) : dns?.error ? (
            <p className="mt-3 text-sm text-rose-300">{String(dns.error)}</p>
          ) : hosting?.error ? (
            <p className="mt-3 text-sm text-rose-300">{String(hosting.error)}</p>
          ) : (
            <dl className="mt-4 space-y-3 text-sm">
              <IntelRow label="Resolved IP" value={hosting?.ip} mono />
              <IntelRow
                label="Location"
                value={[hosting?.city, hosting?.region, hosting?.country].filter(Boolean).join(', ')}
              />
              <IntelRow label="ISP / network" value={hosting?.isp} />
              {typeof hosting?.lat === 'number' && typeof hosting?.lon === 'number' && (
                <IntelRow label="Coordinates" value={`${hosting.lat}, ${hosting.lon}`} mono />
              )}
            </dl>
          )}
        </section>
      </div>

      <section className={`${card} p-6 sm:p-8`}>
        <h2 className="text-lg font-semibold text-white">DNS records</h2>
        {dns?.error ? (
          <p className="mt-3 text-sm text-rose-300">{String(dns.error)}</p>
        ) : (
          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <DnsBlock title="A" lines={formatList(dns?.a)} />
            <DnsBlock title="AAAA" lines={formatList(dns?.aaaa)} />
            <DnsBlock
              title="MX"
              lines={mxLines(dns?.mx)}
            />
            <DnsBlock title="NS" lines={formatList(dns?.ns)} />
            <div className="lg:col-span-2">
              <DnsBlock title="TXT" lines={formatList(dns?.txt)} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

const dtClass = 'text-[11px] font-semibold uppercase tracking-wider text-zinc-500';

function IntelRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: unknown;
  mono?: boolean;
}) {
  const s = value == null || value === '' ? null : String(value);
  if (!s) return null;
  return (
    <div>
      <dt className={dtClass}>{label}</dt>
      <dd className={`mt-1 text-zinc-200 ${mono ? 'font-mono text-xs break-all' : ''}`}>{s}</dd>
    </div>
  );
}

function formatIso(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}

function formatAge(days: unknown): string | null {
  if (typeof days !== 'number' || days < 0) return null;
  if (days < 14) return `${days} days`;
  const y = Math.floor(days / 365);
  const rem = days % 365;
  if (y >= 1) return `${y} yr${y !== 1 ? 's' : ''}${rem > 30 ? ` (${days} days)` : ''}`;
  return `${Math.round(days / 30)} mo (${days} days)`;
}

function DnsBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400/85">{title}</h3>
      {lines.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-600">—</p>
      ) : (
        <ul className="mt-2 space-y-1.5 font-mono text-xs leading-relaxed text-zinc-300 break-all">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function mxLines(mx: unknown): string[] {
  if (!Array.isArray(mx)) return [];
  return mx.map((row) => {
    if (row && typeof row === 'object' && 'exchange' in row && 'priority' in row) {
      const r = row as { exchange: string; priority: number };
      return `${r.priority} ${r.exchange}`;
    }
    return String(row);
  });
}
