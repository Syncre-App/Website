'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CryptoService } from '../services/CryptoService';
import { ApiService } from '../services/ApiService';

export default function E2EESetupPage() {
  const router = useRouter();
  const [hasIdentity, setHasIdentity] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkIdentity = async () => {
      const exists = await CryptoService.hasIdentity();
      setHasIdentity(exists);
    };
    checkIdentity();
  }, []);

  const handleCreateIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await CryptoService.initializeIdentity(password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/app/chats');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to create identity');
    } finally {
      setLoading(false);
    }
  };

  const handleImportIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!password) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    try {
      await CryptoService.decryptIdentityFromServer(password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/app/chats');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to import identity. Wrong password?');
    } finally {
      setLoading(false);
    }
  };

  if (hasIdentity === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (hasIdentity) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">End-to-End Encryption Active</h1>
            <p className="text-white/60">Your messages are securely encrypted on this device.</p>
          </div>
          
          <button
            onClick={() => router.push('/app/chats')}
            className="w-full bg-blue-500 text-white py-3 rounded-full font-medium hover:bg-blue-600 transition-colors"
          >
            Continue to Chats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Set Up Encryption</h1>
          <p className="text-white/60">
            Enable end-to-end encryption to secure your messages. Choose an option below.
          </p>
        </div>

        {success ? (
          <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-center">
            <p className="text-green-400 font-medium">Success! Redirecting...</p>
          </div>
        ) : (
          <>
            {/* Create New Identity */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">Create New Encryption Key</h2>
              <p className="text-sm text-white/60 mb-4">
                Set up encryption on this device. Your messages will be encrypted and can only be read on devices with your encryption key.
              </p>
              
              <form onSubmit={handleCreateIdentity} className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create password (min 8 chars)"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Setting up...' : 'Create Encryption Key'}
                </button>
              </form>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-white/40">or</span>
              </div>
            </div>

            {/* Import Existing Identity */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">Import from Another Device</h2>
              <p className="text-sm text-white/60 mb-4">
                If you have encryption set up on another device, enter your password to import your encryption key.
              </p>
              
              <form onSubmit={handleImportIdentity} className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your encryption password"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white/10 text-white py-3 rounded-lg font-medium hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Importing...' : 'Import Encryption Key'}
                </button>
              </form>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={() => router.push('/app/chats')}
              className="w-full text-white/40 hover:text-white text-sm transition-colors"
            >
              Skip for now (messages won't be encrypted)
            </button>
          </>
        )}
      </div>
    </div>
  );
}
