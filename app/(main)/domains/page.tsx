'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, getToken } from '@/lib/api';
import { useHydrated } from '@/lib/use-hydrated';
import {
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
} from '@/lib/ui';

type Domain = {
  _id: string;
  name: string;
  createdAt?: string;
};

export default function DomainsPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [adding, setAdding] = useState(false);
  const [scanningId, setScanningId] = useState<string | null>(null);

  function load() {
    api<Domain[]>('/domains').then(setDomains).catch((e: Error) => setErr(e.message));
  }

  useEffect(() => {
    if (!hydrated) return;
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    load();
  }, [hydrated, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr('');
    setMsg('');
    setAdding(true);
    try {
      const res = await api<{ discovery?: string }>('/domains', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      setName('');
      setMsg(
        res.discovery ||
          'Domain added. Discovery runs in the background (crt.sh can take ~30–60s). Refresh Subdomains shortly.',
      );
      load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed');
    } finally {
      setAdding(false);
    }
  }

  async function scan(id: string) {
    setErr('');
    setScanningId(id);
    try {
      await api(`/domains/${id}/scan`, { method: 'POST' });
      setMsg(
        'Discovery started in the background (crt.sh often takes 30–60s). Open Subdomains and refresh in a moment.',
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed');
    } finally {
      setScanningId(null);
    }
  }

  if (!hydrated) {
    return (
      <div className="space-y-6 animate-pulse px-1">
        <div className="h-8 w-48 rounded bg-zinc-800" />
        <div className="h-24 rounded-xl bg-zinc-900/80" />
        <div className="h-40 rounded-xl bg-zinc-900/80" />
      </div>
    );
  }
  if (!getToken()) return null;

  return (
    <div className="space-y-10">
      <header>
        <h1 className={pageTitle}>Domains</h1>
        <p className={pageSubtitle}>
          Adding a domain queues subdomain discovery; Certificate Transparency coverage is
          best-effort.
        </p>
      </header>

      <section className={`${card} p-6 sm:p-8`}>
        <form onSubmit={onSubmit} className="flex flex-col gap-5 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="domain" className={label}>
              Domain name
            </label>
            <input
              id="domain"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="example.com"
              required
              className={`${field} mt-2`}
            />
          </div>
          <button type="submit" disabled={adding} className={`${btnPrimary} shrink-0 disabled:opacity-50`}>
            {adding ? 'Adding…' : 'Add domain'}
          </button>
        </form>
      </section>

      {msg && <p className={messageOk}>{msg}</p>}
      {err && <p className={messageErr}>{err}</p>}

      <div className={cardInner}>
        <ul className="divide-y divide-white/[0.06]">
          {domains.length === 0 && (
            <li className="px-6 py-14 text-center text-sm text-zinc-500">
              No domains yet — add one above to start discovery.
            </li>
          )}
          {domains.map((d) => (
            <li
              key={d._id}
              className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 transition hover:bg-white/[0.02]"
            >
              <div>
                <Link
                  href={`/domains/${d._id}`}
                  className="font-medium tracking-tight text-zinc-100 underline-offset-4 hover:text-emerald-300 hover:underline"
                >
                  {d.name}
                </Link>
                {d.createdAt && (
                  <p className="mt-1 text-xs text-zinc-500">
                    Added {new Date(d.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/attack-surface?domainId=${d._id}`} className={btnSecondary}>
                  Attack surface
                </Link>
                <Link href={`/subdomains?domainId=${d._id}`} className={btnSecondary}>
                  Subdomains
                </Link>
                <button
                  type="button"
                  disabled={scanningId !== null}
                  onClick={() => scan(d._id)}
                  className={`${btnSecondary} disabled:opacity-50`}
                >
                  {scanningId === d._id ? 'Starting…' : 'Trigger scan'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
