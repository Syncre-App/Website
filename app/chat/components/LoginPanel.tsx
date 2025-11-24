'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '../AuthProvider';

export const LoginPanel = () => {
  const { login, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email || !password) {
      setLocalError('Add meg az email címed és a jelszavad.');
      return;
    }
    setSubmitting(true);
    const response = await login(email.trim(), password);
    if (!response.success) {
      setLocalError(response.error || 'Sikertelen bejelentkezés.');
    } else {
      setLocalError(null);
    }
    setSubmitting(false);
  };

  const errorMessage = localError || authError;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
      <div className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-blue-200/80">Syncre web</p>
        <h1 className="text-3xl font-semibold text-white">Lépj be a fiókodba</h1>
        <p className="text-sm text-gray-300">Ugyanazt a biztonságos chat élményt kapod, mint a mobil appban.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <label className="text-sm font-medium text-gray-200">
          Email cím
          <input
            type="email"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-gray-400 focus:border-blue-400"
            placeholder="te@pelda.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting}
            required
          />
        </label>
        <label className="text-sm font-medium text-gray-200">
          Jelszó
          <input
            type="password"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-gray-400 focus:border-blue-400"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
            required
          />
        </label>
        {errorMessage && (
          <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{errorMessage}</p>
        )}
        <button
          type="submit"
          className="mt-2 rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-600/50"
          disabled={submitting}
        >
          {submitting ? 'Belépés...' : 'Belépés'}
        </button>
      </form>
    </div>
  );
};
