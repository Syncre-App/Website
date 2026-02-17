'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineBell, HiOutlineMoon, HiOutlineInformationCircle } from 'react-icons/hi';

export default function SettingsPage() {
  const router = useRouter();

  const settingsItems = [
    {
      icon: <HiOutlineBell className="w-5 h-5" />,
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      onClick: () => {},
    },
    {
      icon: <HiOutlineMoon className="w-5 h-5" />,
      title: 'Appearance',
      subtitle: 'Dark mode settings',
      onClick: () => {},
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      title: 'Language',
      subtitle: 'Change app language',
      onClick: () => {},
    },
    {
      icon: <HiOutlineInformationCircle className="w-5 h-5" />,
      title: 'About',
      subtitle: 'App version and information',
      onClick: () => {},
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
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <div className="px-4 pt-20 max-w-lg mx-auto">
        <div className="card overflow-hidden">
          {settingsItems.map((item, index) => (
            <button
              key={item.title}
              onClick={item.onClick}
              className={`w-full flex items-center gap-4 p-4 text-left hover:bg-white/5 transition-colors ${
                index !== settingsItems.length - 1 ? 'border-b border-white/5' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 text-[var(--text)]">
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{item.subtitle}</p>
              </div>
              <svg className="w-5 h-5 text-[var(--text-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-sm text-[var(--text-subtle)]">
          <p>Syncre Web v1.0.0</p>
          <p className="mt-1">Built with Next.js & React</p>
        </div>
      </div>
    </div>
  );
}
