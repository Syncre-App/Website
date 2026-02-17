'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineBan, HiOutlineLockClosed, HiOutlineKey, HiOutlineShieldCheck } from 'react-icons/hi';

interface BlockedUser {
  id: string;
  username: string;
  profile_picture?: string;
}

export default function PrivacyPage() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading blocked users
    setTimeout(() => {
      setBlockedUsers([]);
      setLoading(false);
    }, 500);
  }, []);

  const handleUnblock = async (userId: string) => {
    // Simulate API call
    setBlockedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const privacyItems = [
    {
      icon: <HiOutlineLockClosed className="w-5 h-5" />,
      title: 'End-to-End Encryption',
      subtitle: 'All messages are encrypted',
      value: 'Enabled',
    },
    {
      icon: <HiOutlineKey className="w-5 h-5" />,
      title: 'Two-Factor Authentication',
      subtitle: 'Add extra security to your account',
      value: 'Disabled',
    },
    {
      icon: <HiOutlineShieldCheck className="w-5 h-5" />,
      title: 'Online Status',
      subtitle: 'Show when you are online',
      value: 'Visible',
    },
  ];

  return (
    <div className="min-h-screen pt-14 pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-strong px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Privacy</h1>
        </div>
      </header>

      <div className="px-4 pt-20 max-w-lg mx-auto">
        {/* Privacy Settings */}
        <h2 className="text-label mb-3">Privacy Settings</h2>
        <div className="card overflow-hidden mb-6">
          {privacyItems.map((item, index) => (
            <div
              key={item.title}
              className={`flex items-center gap-4 p-4 ${
                index !== privacyItems.length - 1 ? 'border-b border-white/5' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 text-[var(--text)]">
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{item.subtitle}</p>
              </div>
              <span className="text-sm text-[var(--accent)] font-medium">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Blocked Users */}
        <h2 className="text-label mb-3">Blocked Users</h2>
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[var(--text-muted)]">Loading...</div>
          ) : blockedUsers.length === 0 ? (
            <div className="p-8 text-center">
              <HiOutlineBan className="w-12 h-12 mx-auto mb-3 text-[var(--text-muted)]" />
              <p className="text-[var(--text-muted)]">No blocked users</p>
              <p className="text-sm text-[var(--text-subtle)] mt-1">
                Users you block will appear here
              </p>
            </div>
          ) : (
            blockedUsers.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center gap-3 p-4 ${
                  index !== blockedUsers.length - 1 ? 'border-b border-white/5' : ''
                }`}
              >
                <img
                  src={user.profile_picture || '/default-avatar.png'}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover border border-white/10"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{user.username}</h3>
                </div>
                <button
                  onClick={() => handleUnblock(user.id)}
                  className="btn-muted text-sm py-1.5 px-3"
                >
                  Unblock
                </button>
              </div>
            ))
          )}
        </div>

        {/* Security Note */}
        <div className="mt-6 p-4 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
          <div className="flex items-start gap-3">
            <HiOutlineShieldCheck className="w-6 h-6 text-[var(--accent)] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-[var(--accent)] mb-1">Your messages are secure</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Syncre uses end-to-end encryption to protect your messages. Only you and the recipient can read them.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
