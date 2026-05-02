'use client';

import { useEffect, useState } from 'react';
import { api, getToken } from '@/lib/api';
import { card } from '@/lib/ui';

export type SubdomainChangeEvent = {
  _id: string;
  addedHosts: string[];
  removedHosts: string[];
  source?: string;
  createdAt?: string;
};

export function SubdomainChangeDetection({ domainId }: { domainId: string }) {
  const [events, setEvents] = useState<SubdomainChangeEvent[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!domainId || !getToken()) {
      setEvents([]);
      return;
    }
    setErr('');
    api<SubdomainChangeEvent[]>(`/subdomains/changes?domainId=${domainId}&limit=35`)
      .then(setEvents)
      .catch((e: Error) => setErr(e.message));
  }, [domainId]);

  return (
    <section className={`${card} p-6 sm:p-8`} aria-labelledby="ct-drift-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-400/90">
            Attack surface drift
          </p>
          <h2 id="ct-drift-heading" className="mt-1 text-xl font-semibold tracking-tight text-white">
            Subdomain change detection
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Each discovery run compares Certificate Transparency to the previous poll for this domain:
            <span className="text-emerald-400/90"> new</span> hostnames and{' '}
            <span className="text-rose-400/90">removed</span> hostnames are logged below (baseline run is
            silent).
          </p>
        </div>
      </div>

      {err && (
        <p className="mt-6 rounded-xl border border-rose-500/25 bg-rose-950/35 px-4 py-3 text-sm text-rose-50">
          {err}
        </p>
      )}

      <div className="mt-8 space-y-4">
        {events.length === 0 && !err && (
          <div className="rounded-xl border border-white/[0.06] bg-black/25 px-5 py-10 text-center">
            <p className="text-sm text-zinc-400">No drift events recorded yet.</p>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-zinc-600">
              Trigger another scan after your first baseline completes — the next crt.sh poll will start
              surfacing <span className="font-semibold text-zinc-400">New</span> and{' '}
              <span className="font-semibold text-zinc-400">Removed</span> deltas.
            </p>
          </div>
        )}

        {events.map((ev) => (
          <article
            key={ev._id}
            className="rounded-xl border border-white/[0.07] bg-black/20 px-5 py-4 shadow-inner shadow-black/30"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/[0.05] pb-3">
              <time className="text-xs font-medium tabular-nums text-zinc-500">
                {ev.createdAt ? new Date(ev.createdAt).toLocaleString() : '—'}
              </time>
              <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                {ev.source === 'crt_sh' ? 'crt.sh poll' : ev.source ?? 'discovery'}
              </span>
            </div>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-500/90">
                  New ({ev.addedHosts?.length ?? 0})
                </p>
                {ev.addedHosts?.length ? (
                  <ul className="mt-2 space-y-1 font-mono text-xs text-emerald-200/95">
                    {ev.addedHosts.map((h) => (
                      <li key={h} className="truncate" title={h}>
                        + {h}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-zinc-600">None</p>
                )}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-500/90">
                  Removed ({ev.removedHosts?.length ?? 0})
                </p>
                {ev.removedHosts?.length ? (
                  <ul className="mt-2 space-y-1 font-mono text-xs text-rose-200/95">
                    {ev.removedHosts.map((h) => (
                      <li key={h} className="truncate" title={h}>
                        − {h}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-zinc-600">None</p>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
