'use client';

type Timeline = {
  expired: number;
  due0to7Days: number;
  due8to30Days: number;
  beyond30Days: number;
  noExpiryData: number;
};

export function ExpiryTimelineBoard({
  totalHosts,
  timeline,
}: {
  totalHosts: number;
  timeline: Timeline;
}) {
  const redCount = timeline.expired + timeline.due0to7Days;
  const flex = (n: number) => (totalHosts > 0 && n > 0 ? Math.max(n, 0) : 0);
  const r = flex(redCount);
  const y = flex(timeline.due8to30Days);
  const g = flex(timeline.beyond30Days);
  const u = flex(timeline.noExpiryData);
  const sum = r + y + g + u;

  const rows: Array<{
    key: string;
    emoji: string;
    label: string;
    sub?: string;
    count: number;
    barClass: string;
    dotClass: string;
  }> = [
    {
      key: 'red',
      emoji: '🔴',
      label: 'Critical · expired or ≤ 7 days',
      sub: `${timeline.expired} expired · ${timeline.due0to7Days} rolling off soon`,
      count: redCount,
      barClass: 'bg-gradient-to-r from-rose-600 to-rose-500 shadow-[0_0_24px_rgba(244,63,94,0.35)]',
      dotClass: 'bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.8)]',
    },
    {
      key: 'yellow',
      emoji: '🟡',
      label: 'Elevated · 7–30 days remaining',
      sub: 'More than one week before expiry',
      count: timeline.due8to30Days,
      barClass: 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.25)]',
      dotClass: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.55)]',
    },
    {
      key: 'green',
      emoji: '🟢',
      label: 'Stable · 30+ days remaining',
      count: timeline.beyond30Days,
      barClass: 'bg-gradient-to-r from-emerald-700 to-emerald-500 shadow-[0_0_22px_rgba(52,211,153,0.28)]',
      dotClass: 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.55)]',
    },
    {
      key: 'gray',
      emoji: '⚪',
      label: 'No expiry on record',
      sub: 'Run SSL checks to populate timelines',
      count: timeline.noExpiryData,
      barClass: 'bg-gradient-to-r from-zinc-600 to-zinc-500',
      dotClass: 'bg-zinc-400',
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-zinc-900/95 via-zinc-950/98 to-black shadow-2xl shadow-black/60 ring-1 ring-white/[0.05]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-emerald-500/[0.06] blur-3xl" aria-hidden />

      <div className="relative p-6 sm:p-8">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.06] pb-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400/90">
              Control center
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Certificate expiry timeline
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
              Fleet posture by days-to-expiry across every monitored host. Red captures overdue certs and
              anything inside one week.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-950/40 px-4 py-2.5 text-xs font-medium text-emerald-100/90 shadow-inner shadow-black/30">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-35" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            </span>
            Queue monitoring active
          </div>
        </header>

        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between gap-4 text-xs text-zinc-500">
            <span className="font-medium uppercase tracking-wider">Fleet distribution</span>
            <span className="tabular-nums text-zinc-400">
              {totalHosts} host{totalHosts !== 1 ? 's' : ''} tracked
            </span>
          </div>

          {totalHosts === 0 ? (
            <p className="rounded-xl border border-white/[0.06] bg-black/30 px-4 py-8 text-center text-sm text-zinc-500">
              Add domains and subdomains to populate the expiry timeline.
            </p>
          ) : sum === 0 ? (
            <p className="rounded-xl border border-white/[0.06] bg-black/30 px-4 py-8 text-center text-sm text-zinc-500">
              No certificate data yet — enqueue SSL checks from Subdomains.
            </p>
          ) : (
            <div
              className="flex h-5 w-full overflow-hidden rounded-full bg-zinc-900 ring-1 ring-white/[0.08]"
              role="img"
              aria-label={`Expiry bands: ${redCount} critical, ${timeline.due8to30Days} elevated, ${timeline.beyond30Days} stable, ${timeline.noExpiryData} unknown`}
            >
              {r > 0 && (
                <div
                  className={`min-w-[6px] transition-[flex-grow] duration-500 ${rows[0].barClass}`}
                  style={{ flexGrow: r }}
                  title={`Critical: ${redCount}`}
                />
              )}
              {y > 0 && (
                <div
                  className={`min-w-[6px] transition-[flex-grow] duration-500 ${rows[1].barClass}`}
                  style={{ flexGrow: y }}
                  title={`8–30 days: ${y}`}
                />
              )}
              {g > 0 && (
                <div
                  className={`min-w-[6px] transition-[flex-grow] duration-500 ${rows[2].barClass}`}
                  style={{ flexGrow: g }}
                  title={`30+ days: ${g}`}
                />
              )}
              {u > 0 && (
                <div
                  className={`min-w-[6px] transition-[flex-grow] duration-500 ${rows[3].barClass}`}
                  style={{ flexGrow: u }}
                  title={`No data: ${u}`}
                />
              )}
            </div>
          )}
        </div>

        <dl className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((row) => (
            <div
              key={row.key}
              className="rounded-xl border border-white/[0.06] bg-black/35 px-4 py-4 shadow-inner shadow-black/40 backdrop-blur-sm"
            >
              <div className="flex items-start gap-3">
                <span className="text-lg leading-none" aria-hidden>
                  {row.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                    {row.label}
                  </dt>
                  <dd className="mt-2 flex items-baseline gap-2">
                    <span className={`inline-flex h-2 w-2 shrink-0 rounded-full ${row.dotClass}`} aria-hidden />
                    <span className="text-3xl font-semibold tabular-nums tracking-tight text-white">
                      {row.count}
                    </span>
                  </dd>
                  {row.sub ? <p className="mt-2 text-[11px] leading-snug text-zinc-600">{row.sub}</p> : null}
                </div>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
