'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../layout';
import { HiOutlinePencil, HiOutlineCog, HiOutlineShieldCheck, HiOutlineLogout } from 'react-icons/hi';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isOnline } = useAppContext();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleEditProfile = () => {
    router.push('/app/settings/edit-profile');
  };

  const handleSettings = () => {
    router.push('/app/settings');
  };

  const handlePrivacy = () => {
    router.push('/app/settings/privacy');
  };

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    sessionStorage.removeItem('chat-skeleton');
    sessionStorage.removeItem('chat-fade');
    
    // Redirect to login
    window.location.href = '/';
  };

  const menuItems = [
    {
      icon: <HiOutlinePencil className="w-5 h-5" />,
      title: 'Edit Profile',
      subtitle: 'Update your profile picture and username',
      onClick: handleEditProfile,
      destructive: false,
    },
    {
      icon: <HiOutlineCog className="w-5 h-5" />,
      title: 'Settings',
      subtitle: 'App preferences and notifications',
      onClick: handleSettings,
      destructive: false,
    },
    {
      icon: <HiOutlineShieldCheck className="w-5 h-5" />,
      title: 'Privacy',
      subtitle: 'Manage blocked users and security',
      onClick: handlePrivacy,
      destructive: false,
    },
  ];

  return (
    <div className="min-h-screen pt-14 pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-strong px-4 py-3">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </header>

      <div className="px-4 pt-20 max-w-lg mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col items-center py-8">
          <div className="relative">
            <img
              src={user?.profile_picture || '/default-avatar.png'}
              alt={user?.username || 'User'}
              className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
            />
            <span 
              className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-[var(--background)] ${
                isOnline ? 'bg-[var(--success)]' : 'bg-[var(--text-muted)]'
              }`}
            />
          </div>
          
          <h2 className="text-2xl font-bold mt-4">{user?.username || 'User'}</h2>
          <p className="text-[var(--text-muted)]">{user?.email || ''}</p>
          
          {/* Status */}
          <div className="flex items-center gap-2 mt-3">
            <span 
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline ? 'bg-[var(--success)]' : 'bg-[var(--text-muted)]'
              }`}
            />
            <span className="text-sm text-[var(--text-muted)]">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="card overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.title}
              onClick={item.onClick}
              className={`w-full flex items-center gap-4 p-4 text-left hover:bg-white/5 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-white/5' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                item.destructive 
                  ? 'bg-[var(--error)]/15 text-[var(--error)]' 
                  : 'bg-white/10 text-[var(--text)]'
              }`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${item.destructive ? 'text-[var(--error)]' : ''}`}>
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)]">{item.subtitle}</p>
              </div>
              <svg className="w-5 h-5 text-[var(--text-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <div className="card overflow-hidden mt-6">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--error)]/15 text-[var(--error)]">
              <HiOutlineLogout className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--error)]">Log Out</h3>
              <p className="text-sm text-[var(--text-muted)]">Sign out of your account</p>
            </div>
          </button>
        </div>

        {/* App Info */}
        <div className="text-center mt-8 text-sm text-[var(--text-subtle)]">
          <p>Syncre v1.0.0</p>
          <p className="mt-1">End-to-end encrypted messaging</p>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card p-6 max-w-sm w-full animate-slide-up">
            <h3 className="text-lg font-bold mb-2">Log Out</h3>
            <p className="text-[var(--text-muted)] mb-6">
              Are you sure you want to log out? You'll need to sign in again to access your messages.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 btn-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 btn-primary bg-[var(--error)]"
                style={{ background: 'var(--error)' }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
