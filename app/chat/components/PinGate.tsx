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
      <div className="max-w-4xl w-full">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-blue-200/80">PIN szükséges</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Oldd fel a titkosított üzeneteket</h1>
          <p className="mt-2 text-sm text-white/70">
            A webes chat csak akkor érhető el, ha megadod a mobil appban beállított PIN kódodat.
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
