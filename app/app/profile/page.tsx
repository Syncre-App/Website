'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChatContext } from '../../context/ChatContext';
import { StorageService } from '../../services/StorageService';
import { HiOutlinePencil, HiOutlineCog, HiOutlineShieldCheck, HiOutlineLogout } from 'react-icons/hi';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isOnline } = useChatContext();
  const [showLogout, setShowLogout] = useState(false);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const token = await StorageService.getAuthToken();
      if (!token) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await StorageService.clearAll();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen">
      <header className="fixed top-16 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-white">Profile</h1>
        </div>
      </header>

      <div className="px-4 pt-32 pb-20 max-w-lg mx-auto">
        <div className="flex flex-col items-center py-8">
          <div className="relative">
            <img src={user?.profile_picture || '/default-avatar.svg'} alt={user?.username} className="w-24 h-24 rounded-full object-cover border-4 border-white/20" />
            <span className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-black ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
          </div>
          <h2 className="text-2xl font-bold text-white mt-4">{user?.username || 'User'}</h2>
          <p className="text-white/60">{user?.email || ''}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {[
            { icon: <HiOutlinePencil className="w-5 h-5" />, title: 'Edit Profile', subtitle: 'Update your profile', onClick: () => {} },
            { icon: <HiOutlineCog className="w-5 h-5" />, title: 'Settings', subtitle: 'App preferences', onClick: () => {} },
            { icon: <HiOutlineShieldCheck className="w-5 h-5" />, title: 'Privacy', subtitle: 'Security settings', onClick: () => {} },
          ].map((item, i) => (
            <button key={item.title} onClick={item.onClick} className={`w-full flex items-center gap-4 p-4 hover:bg-white/5 ${i !== 2 ? 'border-b border-white/5' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">{item.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-white/60">{item.subtitle}</p>
              </div>
              <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mt-6">
          <button onClick={() => setShowLogout(true)} className="w-full flex items-center gap-4 p-4 hover:bg-white/5">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center text-red-500"><HiOutlineLogout className="w-5 h-5" /></div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-500">Log Out</h3>
              <p className="text-sm text-white/60">Sign out of your account</p>
            </div>
          </button>
        </div>

        {showLogout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="bg-black border border-white/10 rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-white mb-2">Log Out?</h3>
              <p className="text-white/60 mb-6">Are you sure you want to log out?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogout(false)} className="flex-1 bg-white/10 text-white py-3 rounded-full font-semibold">Cancel</button>
                <button onClick={handleLogout} className="flex-1 bg-red-500 text-white py-3 rounded-full font-semibold">Log Out</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
