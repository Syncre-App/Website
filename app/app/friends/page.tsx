'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChatContext } from '../../context/ChatContext';
import { ApiService } from '../../services/ApiService';
import { StorageService } from '../../services/StorageService';

interface User {
  id: string;
  username: string;
  profile_picture?: string | null;
}

export default function FriendsPage() {
  const router = useRouter();
  const { incomingRequests, outgoingRequests, userStatuses, loadFriendData, loadChats } = useChatContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      const response = await ApiService.get(`/user/search?q=${encodeURIComponent(query)}`);
      if (response.success) setSearchResults(response.data || []);
      setIsSearching(false);
    }, 300);
  };

  const handleSendRequest = async (userId: string) => {
    await ApiService.post('/user/add', { userId });
    await loadFriendData();
    setSearchResults(prev => prev.filter(u => u.id !== userId));
  };

  const handleRespond = async (friendId: string, action: 'accept' | 'reject') => {
    await ApiService.post('/user/respond', { friendId, action });
    await Promise.all([loadFriendData(), loadChats()]);
  };

  const getStatus = (userId: string) => {
    if (incomingRequests.some(r => r.id === userId)) return 'incoming';
    if (outgoingRequests.some(r => r.id === userId)) return 'outgoing';
    return 'none';
  };

  return (
    <div className="min-h-screen">
      <header className="fixed top-16 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-white mb-3">Friends</h1>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </header>

      <div className="px-4 pt-36 pb-20 max-w-lg mx-auto">
        {searchQuery.trim() ? (
          <div className="space-y-2">
            {searchResults.map((user) => {
              const status = getStatus(user.id);
              const isOnline = userStatuses[user.id] === 'online';
              
              return (
                <div key={user.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
                  <div className="relative">
                    <img src={user.profile_picture || '/default-avatar.svg'} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
                    {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-black" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{user.username}</h3>
                    <p className="text-sm text-white/60">{isOnline ? 'Online' : 'Offline'}</p>
                  </div>
                  {status === 'none' && (
                    <button onClick={() => handleSendRequest(user.id)} className="bg-blue-500 text-white text-sm py-2 px-4 rounded-full font-semibold hover:bg-blue-600">
                      Add
                    </button>
                  )}
                  {status === 'incoming' && <span className="text-xs text-blue-400">Wants to add you</span>}
                  {status === 'outgoing' && <span className="text-xs text-white/40">Pending</span>}
                </div>
              );
            })}
          </div>
        ) : (
          <>
            {(incomingRequests.length > 0 || outgoingRequests.length > 0) && (
              <div className="mb-6">
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Friend Requests</h2>
                {incomingRequests.map((req) => (
                  <div key={req.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 mb-2">
                    <img src={req.profile_picture || '/default-avatar.svg'} alt={req.username} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{req.username}</h3>
                      <p className="text-sm text-white/60">Wants to be your friend</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleRespond(req.id, 'accept')} className="bg-blue-500 text-white text-sm py-2 px-3 rounded-full">Accept</button>
                      <button onClick={() => handleRespond(req.id, 'reject')} className="bg-white/10 text-white text-sm py-2 px-3 rounded-full">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Find new friends</h3>
                <p className="text-white/60 text-sm">Search for users to send friend requests</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
