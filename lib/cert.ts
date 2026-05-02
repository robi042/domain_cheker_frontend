/** Matches Nest SSL worker: ceil((expiry - now) / 1 day). */
export function sslDaysLeft(sslExpireAt: string | Date | undefined): {
  label: string;
  tone: 'muted' | 'ok' | 'soon' | 'today' | 'expired';
} {
  if (!sslExpireAt) {
    return { label: '—', tone: 'muted' };
  }
  const end = new Date(sslExpireAt).getTime();
  const days = Math.ceil((end - Date.now()) / 86_400_000);
  if (days < 0) {
    return { label: `${days} d`, tone: 'expired' };
  }
  if (days === 0) {
    return { label: 'Today', tone: 'today' };
  }
  return {
    label: `${days} d`,
    tone: days <= 7 ? 'soon' : 'ok',
  };
}

export function toneClass(tone: ReturnType<typeof sslDaysLeft>['tone']): string {
  switch (tone) {
    case 'expired':
      return 'text-rose-400 font-medium tabular-nums';
    case 'today':
    case 'soon':
      return 'text-amber-300 font-medium tabular-nums';
    case 'ok':
      return 'text-zinc-200 tabular-nums';
    default:
      return 'text-zinc-500 tabular-nums';
  }
}
