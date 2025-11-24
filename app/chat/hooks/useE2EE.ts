'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { e2ee } from '@/lib/e2ee';

export const useE2EE = (token: string | null) => {
  const [ready, setReady] = useState(() => e2ee.hasIdentity());
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(ready ? 1 : 0);

  useEffect(() => {
    if (!token) {
      e2ee.clearIdentity();
      setReady(false);
      setVersion(0);
      setError(null);
      return;
    }
    if (e2ee.hasIdentity()) {
      setReady(true);
      setVersion((prev) => (prev === 0 ? 1 : prev));
    }
  }, [token]);

  const unlock = useCallback(
    async (pin: string) => {
      if (!token) {
        setError('Hiányzó token a titkosítás feloldásához.');
        return { success: false, error: 'Hiányzó token' };
      }
      setUnlocking(true);
      const result = await e2ee.unlockIdentity(pin, token);
      setUnlocking(false);
      if (result.success) {
        setReady(true);
        setError(null);
        setVersion((prev) => prev + 1);
      } else if (result.error) {
        setError(result.error);
      }
      return result;
    },
    [token]
  );

  const reset = useCallback(() => {
    e2ee.clearIdentity();
    setReady(false);
    setVersion((prev) => prev + 1);
    setError(null);
  }, []);

  return useMemo(
    () => ({
      ready,
      unlocking,
      error,
      version,
      unlock,
      reset,
    }),
    [error, ready, reset, unlock, unlocking, version]
  );
};
