'use client';

import { FormEvent, useState } from 'react';

interface PinGateProps {
  unlocking: boolean;
  error: string | null;
  onUnlock: (pin: string) => Promise<{ success: boolean; error?: string }>;
  onReset: () => void;
}

export const PinGate = ({ unlocking, error, onUnlock, onReset }: PinGateProps) => {
  const [pin, setPin] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!pin.trim()) {
      setLocalError('Írd be a mobil appban megadott PIN kódot.');
      return;
    }
    const result = await onUnlock(pin.trim());
    if (!result.success) {
      setLocalError(result.error || 'Nem sikerült feloldani a titkosítást.');
    } else {
      setLocalError(null);
    }
  };

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
        <div className="space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-blue-200/80">PIN szükséges</p>
          <h1 className="text-3xl font-semibold text-white">Oldd fel a titkosított üzeneteket</h1>
          <p className="text-sm text-gray-300">
            Add meg a mobil appban beállított PIN kódot. Mentjük, így legközelebb nem kell újra beírnod.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
          <label className="text-sm font-medium text-gray-200">
            PIN kód
            <input
              type="password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              placeholder="PIN kód"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-blue-400"
              disabled={unlocking}
              required
            />
          </label>
          {localError || error ? (
            <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{localError || error}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={unlocking}
              className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-800/60"
            >
              {unlocking ? 'Feloldás...' : 'Feloldás'}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="rounded-2xl border border-white/10 px-4 py-3 text-xs text-white/70 transition hover:border-red-400 hover:text-white"
            >
              Kulcs törlése
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
