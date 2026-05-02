'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, clearToken, getToken } from '@/lib/api';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/domains', label: 'Domains' },
  { href: '/subdomains', label: 'Subdomains' },
  { href: '/attack-surface', label: 'Attack surface' },
  { href: '/alerts', label: 'Alerts' },
];

type MeResponse = { email: string; companyName: string | null };

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<MeResponse | null>(null);

  useEffect(() => {
    if (!getToken()) {
      setProfile(null);
      return;
    }
    api<MeResponse>('/auth/me')
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [pathname]);

  function logout() {
    clearToken();
    setProfile(null);
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-zinc-950/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3.5">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:flex-none">
          <Link
            href="/dashboard"
            className="group flex shrink-0 items-center gap-2 font-semibold tracking-tight text-zinc-100"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-bold text-zinc-950 shadow-lg shadow-emerald-900/40 ring-1 ring-white/20">
              S
            </span>
            <span className="bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
              SSL Monitor
            </span>
          </Link>
          {profile?.companyName ? (
            <div className="min-w-0 max-w-[min(100%,14rem)] border-l border-white/[0.08] pl-3 sm:max-w-[16rem] sm:pl-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Organization
              </p>
              <p className="truncate text-sm font-semibold text-zinc-100">{profile.companyName}</p>
            </div>
          ) : profile?.email ? (
            <div className="min-w-0 max-w-[min(100%,14rem)] border-l border-white/[0.08] pl-3 sm:max-w-[16rem] sm:pl-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Signed in
              </p>
              <p className="truncate text-xs text-zinc-400">{profile.email}</p>
            </div>
          ) : null}
        </div>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {links.map(({ href, label }) => {
            const active =
              href === '/domains'
                ? pathname === '/domains' || pathname.startsWith('/domains/')
                : href === '/attack-surface'
                  ? pathname === '/attack-surface' || pathname.startsWith('/attack-surface/')
                  : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 font-medium transition-colors ${
                  active
                    ? 'bg-white/[0.09] text-white shadow-inner shadow-black/20 ring-1 ring-white/[0.08]'
                    : 'text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100'
                }`}
              >
                {label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={logout}
            className="ml-1 rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500 transition hover:bg-white/[0.05] hover:text-zinc-300"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
