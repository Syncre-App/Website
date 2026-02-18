'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { RiMessage3Line, RiMessage3Fill } from 'react-icons/ri';
import { HiUsers, HiOutlineUsers } from 'react-icons/hi';
import { HiOutlineUserCircle, HiUserCircle } from 'react-icons/hi2';
import { ChatProvider, useChatContext } from '../context/ChatContext';
import { StorageService } from '../services/StorageService';

interface Tab {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  iconActive: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: 'chats',
    label: 'Chats',
    path: '/chats',
    icon: <RiMessage3Line size={24} />,
    iconActive: <RiMessage3Fill size={24} />,
  },
  {
    id: 'friends',
    label: 'Friends',
    path: '/friends',
    icon: <HiOutlineUsers size={24} />,
    iconActive: <HiUsers size={24} />,
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/profile',
    icon: <HiOutlineUserCircle size={24} />,
    iconActive: <HiUserCircle size={24} />,
  },
];

function TabLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { totalUnreadChats, incomingRequests } = useChatContext();
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  // Check authentication
  React.useEffect(() => {
    const checkAuth = async () => {
      const token = await StorageService.getAuthToken();
      if (!token) {
        router.push('/login');
        return;
      }
      setIsAuthenticated(true);
    };
    checkAuth();
  }, [router]);

  const activeTab = tabs.find(tab => pathname?.startsWith(`/app${tab.path}`)) || tabs[0];

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <main className="flex-1 overflow-auto pb-20 pt-16">
        {children}
      </main>

      {/* Bottom Tab Navigation */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-white/10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around max-w-lg mx-auto h-16">
          {tabs.map((tab) => {
            const isActive = activeTab.id === tab.id;
            const unreadBadge = tab.id === 'chats' && totalUnreadChats > 0
              ? totalUnreadChats > 99 ? '99+' : String(totalUnreadChats)
              : null;
            const friendBadge = tab.id === 'friends' && incomingRequests.length > 0
              ? String(incomingRequests.length)
              : null;
            
            return (
              <button
                key={tab.id}
                onClick={() => router.push(`/app${tab.path}`)}
                className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors duration-200 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <div className="relative">
                  {isActive ? tab.iconActive : tab.icon}
                  {(unreadBadge || friendBadge) && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                      {unreadBadge || friendBadge}
                    </span>
                  )}
                </div>
                <span className={`text-[11px] font-semibold mt-1 ${isActive ? 'text-white' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <TabLayout>{children}</TabLayout>
    </ChatProvider>
  );
}
