'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ApiService } from '../services/ApiService';
import { StorageService } from '../services/StorageService';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    // Countdown timer for resend
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await ApiService.post('/auth/verify', { email, code });

      if (response.success && response.data?.token) {
        await StorageService.setAuthToken(response.data.token);
        if (response.data.user?.id) {
          localStorage.setItem('syncre_user_id', response.data.user.id.toString());
        }
        setSuccess(true);
        setTimeout(() => {
          router.push('/app/chats');
        }, 1500);
      } else {
        setError(response.error || 'Invalid verification code');
      }
    } catch (error: any) {
      setError(error.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    setError('');
    try {
      const response = await ApiService.post('/auth/resend-verification', { email });
      if (response.success) {
        setResendTimer(60);
      } else {
        setError(response.error || 'Failed to resend code');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Verify your email</h1>
          <p className="text-white/60">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {success ? (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center">
            <p className="text-green-400 font-medium">Email verified!</p>
            <p className="text-green-400/80 text-sm mt-1">Redirecting to app...</p>
          </div>
        ) : (
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
              <label htmlFor="code" className="block text-sm font-medium text-white/80 mb-2">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 text-center text-2xl tracking-widest"
                placeholder="000000"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        )}

        <div className="text-center space-y-4">
          <p className="text-white/60 text-sm">
            Didn&apos;t receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={resendTimer > 0}
              className={`${resendTimer > 0 ? 'text-white/40' : 'text-blue-500 hover:text-blue-400'} transition-colors`}
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend'}
            </button>
          </p>

          <p className="text-white/60 text-sm">
            Wrong email?{' '}
            <Link href="/register" className="text-blue-500 hover:text-blue-400">
              Go back
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
