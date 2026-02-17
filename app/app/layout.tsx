'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { RiMessage3Line, RiMessage3Fill } from 'react-icons/ri';
import { HiUsers, HiOutlineUsers } from 'react-icons/hi';
import { HiOutlineUserCircle, HiUserCircle } from 'react-icons/hi2';
import { AuthProvider, useAuth } from '../chat/AuthProvider';
import { LoginPanel } from '../chat/components/LoginPanel';
import { useE2EE } from '../chat/hooks/useE2EE';

// ═══════════════════════════════════════════════════════════════
// App Context - Shared state across tabs
// ═══════════════════════════════════════════════════════════════

interface AppContextValue {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  chats: any[];
  setChats: React.Dispatch<React.SetStateAction<any[]>>;
  chatsLoading: boolean;
  setChatsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  incomingRequests: any[];
  setIncomingRequests: React.Dispatch<React.SetStateAction<any[]>>;
  outgoingRequests: any[];
  setOutgoingRequests: React.Dispatch<React.SetStateAction<any[]>>;
  userStatuses: Record<string, string>;
  setUserStatuses: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  chatUnreadCounts: Record<string, number>;
  setChatUnreadCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  totalUnreadChats: number;
  setTotalUnreadChats: React.Dispatch<React.SetStateAction<number>>;
  chatStreaks: Record<string, any>;
  setChatStreaks: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  isOnline: boolean;
  setIsOnline: React.Dispatch<React.SetStateAction<boolean>>;
  blockedUsers: Set<string>;
  setBlockedUsers: React.Dispatch<React.SetStateAction<Set<string>>>;
  // Actions
  loadChats: () => Promise<boolean>;
  loadFriendData: () => Promise<boolean>;
  loadUnreadSummary: (skipDebounce?: boolean) => Promise<boolean>;
  handleRefresh: () => Promise<void>;
  cacheUsers: (users: any[], opts?: { updateStatus?: boolean }) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// ═══════════════════════════════════════════════════════════════
// Tab Layout Component
// ═══════════════════════════════════════════════════════════════

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
    path: '/app',
    icon: <RiMessage3Line size={24} />,
    iconActive: <RiMessage3Fill size={24} />,
  },
  {
    id: 'friends',
    label: 'Friends',
    path: '/app/friends',
    icon: <HiOutlineUsers size={24} />,
    iconActive: <HiUsers size={24} />,
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/app/profile',
    icon: <HiOutlineUserCircle size={24} />,
    iconActive: <HiUserCircle size={24} />,
  },
];

function TabLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, loading: authLoading } = useAuth();
  const encryption = useE2EE(token ?? null);
  
  // State
  const [chats, setChats] = useState<any[]>([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [userStatuses, setUserStatuses] = useState<Record<string, string>>({});
  const [chatUnreadCounts, setChatUnreadCounts] = useState<Record<string, number>>({});
  const [totalUnreadChats, setTotalUnreadChats] = useState(0);
  const [chatStreaks, setChatStreaks] = useState<Record<string, any>>({});
  const [isOnline, setIsOnline] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const unreadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatsLoadingRef = useRef(false);
  const unreadLoadingRef = useRef(false);

  // Determine active tab
  const activeTab = tabs.find(tab => 
    pathname === tab.path || pathname?.startsWith(tab.path + '/')
  ) || tabs[0];

  // Cache users helper
  const cacheUsers = useCallback((users: any[], opts: { updateStatus?: boolean } = { updateStatus: true }) => {
    if (!users?.length) return;
    
    const normalized = users
      .filter(Boolean)
      .map((u) => ({
        id: u.id?.toString?.() ?? String(u.id),
        username: u.username || '',
        email: u.email || '',
        profile_picture: u.profile_picture || null,
        status: u.status || null,
      }));

    if (opts.updateStatus) {
      setUserStatuses((prev) => {
        const next = { ...prev };
        normalized.forEach((u) => {
          if (u.status) {
            next[u.id] = u.status;
          }
        });
        return next;
      });
    }
  }, []);

  // Load unread summary
  const loadUnreadSummary = useCallback(async (skipDebounce = false) => {
    if (unreadLoadingRef.current && !skipDebounce) {
      return false;
    }

    if (unreadTimeoutRef.current) {
      clearTimeout(unreadTimeoutRef.current);
    }

    if (!skipDebounce) {
      unreadTimeoutRef.current = setTimeout(() => {
        loadUnreadSummary(true);
      }, 1000);
      return false;
    }

    if (!token) {
      setChatUnreadCounts({});
      setTotalUnreadChats(0);
      return false;
    }

    unreadLoadingRef.current = true;
    let success = false;
    
    try {
      const response = await fetch('https://api.syncre.xyz/v1/chat/unread/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const mapping = data.chats || {};
        const normalized = Object.keys(mapping).reduce((acc, key) => {
          const value = Number(mapping[key]) || 0;
          if (value > 0) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, number>);
        
        setChatUnreadCounts(normalized);
        const total = Number(data.total ?? Object.values(normalized).reduce((sum, val) => sum + val, 0));
        setTotalUnreadChats(total);
        success = true;
      }
    } catch (error) {
      console.error('Failed to load unread summary:', error);
    } finally {
      unreadLoadingRef.current = false;
    }
    
    return success;
  }, [token]);

  // Load chats
  const loadChats = useCallback(async (skipLoadingCheck = false) => {
    if (!skipLoadingCheck && chatsLoadingRef.current) {
      return false;
    }

    if (!token) return false;

    chatsLoadingRef.current = true;
    setChatsLoading(true);
    let success = false;
    
    try {
      const response = await fetch('https://api.syncre.xyz/v1/chat', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const chatList = data.chats || [];
        setChats(chatList);
        
        // Cache participants
        if (Array.isArray(chatList)) {
          chatList.forEach((chat: any) => {
            if (Array.isArray(chat.participants)) {
              cacheUsers(chat.participants);
            }
          });
        }
        
        success = true;
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      chatsLoadingRef.current = false;
      setChatsLoading(false);
    }
    
    return success;
  }, [token, cacheUsers]);

  // Load friend data
  const loadFriendData = useCallback(async () => {
    if (!token) return false;

    let success = false;
    try {
      const response = await fetch('https://api.syncre.xyz/v1/user/friends', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const pending = data.pending || {};
        const incoming = Array.isArray(pending.incoming) ? pending.incoming : [];
        const outgoing = Array.isArray(pending.outgoing) ? pending.outgoing : [];

        setIncomingRequests(incoming);
        setOutgoingRequests(outgoing);
        
        if (Array.isArray(data.friends)) {
          cacheUsers(data.friends);
        }
        
        success = true;
      }
    } catch (error) {
      console.error('Failed to load friend data:', error);
    }
    
    return success;
  }, [token, cacheUsers]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch('https://api.syncre.xyz/v1/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
        cacheUsers([userData]);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
    
    await Promise.all([loadChats(), loadFriendData(), loadUnreadSummary(true)]);
  }, [token, loadChats, loadFriendData, loadUnreadSummary, cacheUsers]);

  // Initialize data
  useEffect(() => {
    if (token && user) {
      setCurrentUser(user);
      cacheUsers([user]);
      Promise.all([loadChats(), loadFriendData(), loadUnreadSummary(true)]);
    }
  }, [token, user, loadChats, loadFriendData, loadUnreadSummary, cacheUsers]);

  // Context value
  const contextValue: AppContextValue = {
    user: currentUser || user,
    setUser: setCurrentUser,
    chats,
    setChats,
    chatsLoading,
    setChatsLoading,
    incomingRequests,
    setIncomingRequests,
    outgoingRequests,
    setOutgoingRequests,
    userStatuses,
    setUserStatuses,
    chatUnreadCounts,
    setChatUnreadCounts,
    totalUnreadChats,
    setTotalUnreadChats,
    chatStreaks,
    setChatStreaks,
    isOnline,
    setIsOnline,
    blockedUsers,
    setBlockedUsers,
    loadChats,
    loadFriendData,
    loadUnreadSummary,
    handleRefresh,
    cacheUsers,
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]" />
      </div>
    );
  }

  // Show login panel if not authenticated
  if (!token || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <LoginPanel />
      </div>
    );
  }

  // Show encryption unlock if needed
  if (!encryption.ready) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Unlock Encryption</h2>
          <p className="text-[var(--text-muted)] mb-4">Enter your password to decrypt your messages</p>
          {encryption.error && (
            <p className="text-[var(--error)] mb-4">{encryption.error}</p>
          )}
          <button
            onClick={() => encryption.unlock('password')}
            className="btn-primary"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="flex flex-col min-h-screen bg-black">
        {/* Spacer for fixed navbar */}
        <div className="h-16" />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto pb-20">
          {children}
        </main>

        {/* Bottom Tab Navigation */}
        <nav 
          className="fixed bottom-0 left-0 right-0 z-50 glass-strong"
          style={{ 
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)'
          }}
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
                  onClick={() => router.push(tab.path)}
                  className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors duration-200 ${
                    isActive 
                      ? 'text-white' 
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  <div className="relative">
                    {isActive ? tab.iconActive : tab.icon}
                    {(unreadBadge || friendBadge) && (
                      <span className="absolute -top-1 -right-1 bg-[var(--error)] text-white text-[10px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
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
    </AppContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main App Layout Export
// ═══════════════════════════════════════════════════════════════

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TabLayout>{children}</TabLayout>
    </AuthProvider>
  );
}
