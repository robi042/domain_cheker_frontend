'use client';

import { card } from '@/lib/ui';
import type { HealthRiskKey } from '@/lib/ssl-health';
import { overviewAccentClasses, overviewScoreHex, riskBadgeClasses } from '@/lib/ssl-health';

type SubPartial = {
  sslHealthScore?: number;
  sslHealthStatus?: string;
  sslHealthBreakdown?: { statusKey?: HealthRiskKey };
};

export function SslHealthOverview({ subs }: { subs: SubPartial[] }) {
  const scored = subs.filter((s) => typeof s.sslHealthScore === 'number');
  const avg =
    scored.length > 0
      ? Math.round(scored.reduce((a, s) => a + (s.sslHealthScore as number), 0) / scored.length)
      : null;

  const riskOrder: HealthRiskKey[] = ['critical', 'high', 'medium', 'low'];
  const counts: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  for (const s of scored) {
    const k = s.sslHealthBreakdown?.statusKey;
    if (k && k in counts) counts[k] += 1;
  }

  const riskKey =
    avg === null || scored.length === 0 ? undefined : inferRiskFromScore(avg);

  const accent = overviewAccentClasses(riskKey);
  const scoreColor = overviewScoreHex(riskKey);

  return (
    <section
      className={`${card} relative overflow-hidden p-8 sm:p-10`}
      aria-labelledby="ssl-health-heading"
    >
      <div
        className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br opacity-[0.12] blur-3xl ${accent.gradient}`}
        aria-hidden
      />
      <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-400/90">
            Security posture
          </p>
          <h2 id="ssl-health-heading" className="text-2xl font-semibold tracking-tight text-white">
            SSL Health Score
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Blended rating from certificate lifetime risk, negotiated cipher strength, whether plain HTTP
            upgrades to HTTPS, and Strict-Transport-Security headers — computed asynchronously after each
            check.
          </p>
          {scored.length > 0 && (
            <dl className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-500">
              {riskOrder.map((k) =>
                counts[k] > 0 ? (
                  <div key={k} className="flex items-center gap-2">
                    <dt className="capitalize text-zinc-600">{k}:</dt>
                    <dd className="tabular-nums text-zinc-400">{counts[k]} hosts</dd>
                  </div>
                ) : null,
              )}
            </dl>
          )}
        </div>

        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
          {avg === null ? (
            <div className="rounded-2xl border border-white/[0.08] bg-black/30 px-10 py-8 text-center">
              <p className="text-sm font-medium text-zinc-400">No scores yet</p>
              <p className="mt-2 max-w-[14rem] text-xs leading-relaxed text-zinc-600">
                Run <span className="text-zinc-400">Check all SSL</span> or individual checks to generate
                health ratings for this domain.
              </p>
            </div>
          ) : (
            <>
              <div
                className={`relative flex h-36 w-36 items-center justify-center rounded-full bg-zinc-950/80 shadow-2xl ring-2 ring-white/[0.07] ${accent.glow}`}
              >
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${avg * 2.64} 264`}
                    className="transition-[stroke-dasharray] duration-700"
                  />
                </svg>
                <div className="relative text-center">
                  <p
                    className="text-4xl font-bold tabular-nums drop-shadow-[0_0_20px_currentColor]"
                    style={{ color: scoreColor }}
                  >
                    {avg}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    / 100 avg
                  </p>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Domain status</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {riskKey ? (
                    <span
                      className={`inline-flex rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ${riskBadgeClasses(riskKey)}`}
                    >
                      {labelForRisk(riskKey)}
                    </span>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </p>
                <p className="mt-3 max-w-xs text-xs leading-relaxed text-zinc-500">
                  Average across <span className="tabular-nums text-zinc-400">{scored.length}</span>{' '}
                  assessed host{scored.length !== 1 ? 's' : ''}. Improve scores by renewing certs early,
                  disabling legacy TLS, forcing HTTPS redirects, and enabling HSTS.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function inferRiskFromScore(avg: number): HealthRiskKey {
  if (avg >= 80) return 'low';
  if (avg >= 60) return 'medium';
  if (avg >= 40) return 'high';
  return 'critical';
}

function labelForRisk(k: HealthRiskKey): string {
  switch (k) {
    case 'low':
      return 'Low Risk';
    case 'medium':
      return 'Medium Risk';
    case 'high':
      return 'High Risk';
    case 'critical':
      return 'Critical';
  }
}
