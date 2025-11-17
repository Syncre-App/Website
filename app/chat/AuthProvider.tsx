'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '@/lib/auth';
import type { UserProfile } from '@/lib/types';

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const useProfileLoader = (
  setUser: (user: UserProfile | null) => void,
  logout: () => void
) =>
  useCallback(
    async (token: string | null) => {
      if (!token) {
        setUser(null);
        return;
      }
      const response = await authApi.fetchProfile(token);
      if (response.success && response.data) {
        setUser(response.data);
      } else if (response.statusCode === 401) {
        logout();
      }
    },
    [logout, setUser]
  );

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const logout = useCallback(() => {
    authApi.clearToken();
    setUser(null);
    setToken(null);
  }, []);

  const loadProfile = useProfileLoader(setUser, logout);

  useEffect(() => {
    const stored = authApi.getStoredToken();
    if (stored) {
      setToken(stored);
      loadProfile(stored).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    await loadProfile(token);
  }, [loadProfile, token]);

  const login = useCallback(
    async (email: string, password: string) => {
      setAuthError(null);
      const response = await authApi.login(email, password);
      if (!response.success || !response.data) {
        const errorMessage = response.error || 'Hibás belépési adatok.';
        setAuthError(errorMessage);
        return { success: false, error: errorMessage };
      }
      const nextToken = response.data.token;
      authApi.persistToken(nextToken);
      setToken(nextToken);
      setUser(response.data.user);
      await loadProfile(nextToken);
      return { success: true };
    },
    [loadProfile]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      authError,
      login,
      logout,
      refreshProfile,
    }),
    [authError, loading, login, logout, refreshProfile, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth csak AuthProvider alatt használható');
  }
  return context;
};
