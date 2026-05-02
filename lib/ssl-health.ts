export type HealthRiskKey = 'low' | 'medium' | 'high' | 'critical';

export type SslHealthBreakdown = {
  score?: number;
  statusLabel?: string;
  statusKey?: HealthRiskKey;
  components?: {
    expiry: { points: number; max: number; daysLeft?: number };
    cipher: {
      points: number;
      max: number;
      weakCipherDetected: boolean;
      cipherName?: string | null;
      tlsProtocol?: string | null;
    };
    redirect: {
      points: number;
      max: number;
      httpRedirectsToHttps: boolean | null;
      note?: string;
    };
    hsts: { points: number; max: number; enabled: boolean | null };
  };
};

export function riskBadgeClasses(key: HealthRiskKey | string | undefined): string {
  switch (key) {
    case 'low':
      return 'bg-emerald-950/80 text-emerald-200 ring-emerald-500/35';
    case 'medium':
      return 'bg-amber-950/80 text-amber-100 ring-amber-500/35';
    case 'high':
      return 'bg-orange-950/80 text-orange-100 ring-orange-500/35';
    case 'critical':
      return 'bg-rose-950/85 text-rose-100 ring-rose-500/40';
    default:
      return 'bg-zinc-800 text-zinc-400 ring-white/10';
  }
}

/** Solid CSS colors for score text / SVG stroke (avoids invisible gradient-clipped text). */
export function overviewScoreHex(key: HealthRiskKey | string | undefined): string {
  switch (key) {
    case 'low':
      return '#34d399';
    case 'medium':
      return '#fbbf24';
    case 'high':
      return '#fb923c';
    case 'critical':
      return '#fb7185';
    default:
      return '#a1a1aa';
  }
}

export function overviewAccentClasses(key: HealthRiskKey | string | undefined): {
  glow: string;
  stroke: string;
  gradient: string;
} {
  switch (key) {
    case 'low':
      return {
        glow: 'shadow-emerald-500/25',
        stroke: 'stroke-emerald-400',
        gradient: 'from-emerald-400 to-teal-500',
      };
    case 'medium':
      return {
        glow: 'shadow-amber-500/20',
        stroke: 'stroke-amber-400',
        gradient: 'from-amber-400 to-yellow-500',
      };
    case 'high':
      return {
        glow: 'shadow-orange-500/20',
        stroke: 'stroke-orange-400',
        gradient: 'from-orange-400 to-amber-600',
      };
    case 'critical':
      return {
        glow: 'shadow-rose-500/25',
        stroke: 'stroke-rose-400',
        gradient: 'from-rose-400 to-red-600',
      };
    default:
      return {
        glow: 'shadow-zinc-500/10',
        stroke: 'stroke-zinc-500',
        gradient: 'from-zinc-400 to-zinc-600',
      };
  }
}

export function formatHealthTooltip(b: SslHealthBreakdown | undefined): string {
  if (!b?.components) return '';
  const c = b.components;
  const lines = [
    `Certificate expiry: ${c.expiry.points}/${c.expiry.max} pts (${c.expiry.daysLeft ?? '—'} d left)`,
    `Cipher / TLS: ${c.cipher.points}/${c.cipher.max} pts (${c.cipher.tlsProtocol ?? '—'} · ${c.cipher.cipherName ?? '—'})${c.cipher.weakCipherDetected ? ' · weak patterns flagged' : ''}`,
    `HTTP→HTTPS: ${c.redirect.points}/${c.redirect.max} pts (${c.redirect.httpRedirectsToHttps === true ? 'redirects' : c.redirect.httpRedirectsToHttps === false ? 'no HTTPS redirect' : 'not assessed'})`,
    `HSTS: ${c.hsts.points}/${c.hsts.max} pts (${c.hsts.enabled === true ? 'present' : c.hsts.enabled === false ? 'missing' : 'unknown'})`,
  ];
  if (c.redirect.note) lines.push(c.redirect.note);
  return lines.join('\n');
}
