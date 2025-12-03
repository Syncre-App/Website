'use client';

import { FormEvent, useState } from 'react';

interface EncryptionUnlockerProps {
  ready: boolean;
  unlocking: boolean;
  error?: string | null;
  onUnlock: (pin: string) => Promise<{ success: boolean; error?: string }>;
  onReset: () => void;
}

export const EncryptionUnlocker = ({ ready, unlocking, error, onUnlock, onReset }: EncryptionUnlockerProps) => {
  const [pin, setPin] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    if (!pin.trim()) {
      setLocalError('Írd be a mobil appban megadott PIN kódot.');
      return;
    }
    const result = await onUnlock(pin.trim());
    if (!result.success) {
      setLocalError(result.error || 'Nem sikerült feloldani a titkosítást.');
    } else {
      setPin('');
    }
  };

  const activeError = localError || error;

  return (
    <section className="mx-auto mb-6 max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.35em] text-blue-100/70">Végponttól-végpontig</p>
          <h3 className="text-lg font-semibold text-white">Üzenetek visszafejtése a weben</h3>
          <p className="text-sm text-white/60">
            Add meg a mobil appban használt PIN kódot, hogy a titkosított üzenetek olvashatók legyenek ezen az eszközön is.
          </p>
          {ready && !activeError && (
            <p className="text-xs text-emerald-200">A kulcs feloldva. Az új üzenetek automatikusan megjelennek.</p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2 md:w-auto md:flex-row">
          <input
            type="password"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            placeholder="PIN kód"
            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-blue-400 md:w-52"
            disabled={unlocking}
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={unlocking}
              className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-800/60"
            >
              {unlocking ? 'Feloldás...' : ready ? 'Újrapárosítás' : 'Feloldás'}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="rounded-2xl border border-white/10 px-3 py-3 text-xs text-white/70 transition hover:border-red-400 hover:text-white"
            >
              Kulcs törlése
            </button>
          </div>
        </form>
      </div>
      {activeError && (
        <p className="mt-3 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{activeError}</p>
      )}
    </section>
  );
};
