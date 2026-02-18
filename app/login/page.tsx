'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiService } from '../services/ApiService';
import { StorageService } from '../services/StorageService';
import { CryptoService } from '../services/CryptoService';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already logged in
    const checkAuth = async () => {
      const token = await StorageService.getAuthToken();
      if (token) {
        router.push('/app/chats');
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await ApiService.post('/auth/login', { email, password });
      
      if (response.success && response.data?.token) {
        await StorageService.setAuthToken(response.data.token);
        if (response.data.user?.id) {
          localStorage.setItem('syncre_user_id', response.data.user.id.toString());
        }
        
        // Check if user has E2EE identity
        const hasIdentity = await CryptoService.hasIdentity();
        if (!hasIdentity) {
          // Try to decrypt from server first
          try {
            await CryptoService.decryptIdentityFromServer(password);
            router.push('/app/chats');
          } catch (decryptErr: any) {
            console.log('[Login] Failed to decrypt identity from server:', decryptErr.message);
            
            // Check if it's a nonce length error (old AES-GCM encrypted key)
            if (decryptErr?.message?.includes('incorrect nonce length')) {
              console.log('[Login] Old identity key format detected, resetting...');
              // Delete old identity from server
              try {
                await ApiService.delete('/keys/identity');
                console.log('[Login] Old identity deleted from server');
              } catch (deleteErr) {
                console.warn('[Login] Could not delete old identity:', deleteErr);
              }
            }
            
            // Create new identity
            try {
              await CryptoService.initializeIdentity(password);
              router.push('/app/chats');
            } catch (initErr) {
              console.error('Failed to create E2EE identity:', initErr);
              // Continue without E2EE
              router.push('/app/chats');
            }
          }
        } else {
          router.push('/app/chats');
        }
      } else {
        setError(response.error || 'Invalid credentials');
      }
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-white/60">Sign in to your Syncre account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-0"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center space-y-4">
          <p className="text-white/60">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-500 hover:text-blue-400">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
