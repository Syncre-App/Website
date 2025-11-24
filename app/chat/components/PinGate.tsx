'use client';

import { useState } from 'react';
import { EncryptionUnlocker } from './EncryptionUnlocker';

interface PinGateProps {
  unlocking: boolean;
  error: string | null;
  onUnlock: (pin: string) => Promise<{ success: boolean; error?: string }>;
  onReset: () => void;
}

export const PinGate = ({ unlocking, error, onUnlock, onReset }: PinGateProps) => {
  const [localError, setLocalError] = useState<string | null>(null);

  const handleUnlock = async (pin: string) => {
    const result = await onUnlock(pin);
    if (!result.success) {
      setLocalError(result.error || 'Nem sikerült feloldani a titkosítást.');
    } else {
      setLocalError(null);
    }
    return result;
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
        <EncryptionUnlocker
          ready={false}
          unlocking={unlocking}
          error={localError || error}
          onUnlock={handleUnlock}
          onReset={onReset}
        />
      </div>
    </section>
  );
};
