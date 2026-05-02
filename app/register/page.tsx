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

export default function RegisterPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr('');
    try {
      const res = await api<{ access_token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, companyName: companyName.trim() }),
      });
      setToken(res.access_token);
      router.push('/dashboard');
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Registration failed');
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
          <h1 className="text-xl font-semibold tracking-tight text-zinc-50">Create account</h1>
          <p className="mt-2 text-sm text-zinc-400">Monitor certificate expiry with queued checks</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="company" className={label}>
              Company name
            </label>
            <input
              id="company"
              type="text"
              autoComplete="organization"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              minLength={2}
              maxLength={120}
              placeholder="Acme Security"
              className={`${field} mt-2`}
            />
          </div>
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
              Password <span className="font-normal normal-case text-zinc-600">(min 8)</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className={`${field} mt-2`}
            />
          </div>
          {err && (
            <p className="rounded-lg border border-rose-500/25 bg-rose-950/50 px-3 py-2 text-sm text-rose-100">
              {err}
            </p>
          )}
          <button type="submit" className={`${btnPrimary} w-full`}>
            Register
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-500">
          Already registered?{' '}
          <Link href="/login" className={linkAccent}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
