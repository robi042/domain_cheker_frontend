/**
 * Shared UI classes — inputs use explicit text-zinc-100 so typed content stays visible on dark surfaces.
 */
export const field =
  'w-full rounded-xl border border-white/[0.12] bg-zinc-900/95 px-3.5 py-2.5 text-[15px] leading-snug text-zinc-100 caret-emerald-400 placeholder:text-zinc-500 shadow-[inset_0_1px_3px_rgba(0,0,0,0.45)] outline-none transition-[border-color,box-shadow,background-color] duration-200 hover:border-white/[0.18] focus:border-emerald-400/55 focus:bg-zinc-900 focus:shadow-[inset_0_1px_3px_rgba(0,0,0,0.4),0_0_0_3px_rgba(52,211,153,0.12)] disabled:cursor-not-allowed disabled:opacity-45';

/** Same readable text as inputs; native dropdown chrome varies by browser — options styled in `globals.css`. */
export const selectField = `${field} cursor-pointer min-w-[13rem]`;

export const btnPrimary =
  'inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold tracking-wide text-white shadow-lg shadow-emerald-950/35 ring-1 ring-white/15 transition hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-900/45 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40';

export const btnSecondary =
  'inline-flex items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.05] px-3.5 py-2 text-xs font-medium text-zinc-100 shadow-sm transition hover:bg-white/[0.1] hover:border-white/[0.2] active:scale-[0.98]';

export const btnMuted =
  'inline-flex items-center justify-center rounded-lg border border-white/[0.08] bg-transparent px-2.5 py-1 text-xs font-medium text-zinc-400 transition hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-zinc-200';

export const btnDanger =
  'inline-flex items-center justify-center rounded-lg border border-rose-500/25 bg-rose-950/30 px-2.5 py-1 text-xs font-medium text-rose-200 transition hover:border-rose-400/35 hover:bg-rose-950/50';

export const pageTitle =
  'text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl';

export const pageSubtitle = 'mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400';

export const card =
  'rounded-2xl border border-white/[0.07] bg-gradient-to-br from-zinc-900/90 via-zinc-900/55 to-zinc-950/90 shadow-2xl shadow-black/50 backdrop-blur-xl';

export const cardInner =
  'overflow-hidden rounded-2xl border border-white/[0.06] bg-black/20 shadow-inner shadow-black/40';

export const label =
  'block text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500';

export const messageOk =
  'rounded-xl border border-emerald-500/30 bg-emerald-950/45 px-4 py-3 text-sm text-emerald-50';

export const messageErr =
  'rounded-xl border border-rose-500/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-50';

export const linkAccent = 'font-medium text-emerald-400 underline-offset-4 hover:text-emerald-300 hover:underline';
