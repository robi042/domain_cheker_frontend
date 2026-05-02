'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, setToken } from '@/lib/api';
import {
  btnPrimary,
  card,
  field,
  label,
  linkAccent,
} from '@/lib/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr('');
    try {
      const res = await api<{ access_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(res.access_token);
      router.push('/dashboard');
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Login failed');
    }
  }

  return (
    <div className="relative flex min-h-full flex-col justify-center px-4 py-16">
      <div className="pointer-events-none absolute left-1/2 top-24 h-40 w-[min(90vw,28rem)] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className={`relative mx-auto w-full max-w-md ${card} p-8 sm:p-10`}>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg font-bold text-zinc-950 shadow-xl shadow-emerald-900/40 ring-1 ring-white/25">
            S
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-50">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-400">Sign in to your SSL monitoring workspace</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className={label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`${field} mt-2`}
            />
          </div>
          <div>
            <label htmlFor="password" className={label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`${field} mt-2`}
            />
          </div>
          {err && (
            <p className="rounded-lg border border-rose-500/25 bg-rose-950/50 px-3 py-2 text-sm text-rose-100">
              {err}
            </p>
          )}
          <button type="submit" className={`${btnPrimary} w-full`}>
            Sign in
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-500">
          No account?{' '}
          <Link href="/register" className={linkAccent}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
