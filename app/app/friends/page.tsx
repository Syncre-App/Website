'use client';

import React, { useCallback, useState, useRef } from 'react';
import { useAppContext } from '../layout';

interface User {
  id: string;
  username: string;
  profile_picture?: string | null;
  status?: string;
  last_seen?: string;
}

export default function FriendsPage() {
  const {
    user,
    incomingRequests,
    outgoingRequests,
    userStatuses,
    loadChats,
    loadFriendData,
    loadUnreadSummary,
  } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [requestProcessingId, setRequestProcessingId] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search users
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        
        const response = await fetch(`https://api.syncre.xyz/v1/user/search?q=${encodeURIComponent(query)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data || []);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  // Send friend request
  const handleSendRequest = async (userId: string) => {
    try {
      setRequestProcessingId(userId);
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      const response = await fetch('https://api.syncre.xyz/v1/user/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (response.ok) {
        await loadFriendData();
        // Update search results to show pending status
        setSearchResults(prev => prev.filter(u => u.id !== userId));
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
    } finally {
      setRequestProcessingId(null);
    }
  };

  // Respond to friend request
  const handleRespondToRequest = async (friendId: string, action: 'accept' | 'reject') => {
    try {
      setRequestProcessingId(friendId);
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      const response = await fetch('https://api.syncre.xyz/v1/user/respond', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendId, action }),
      });
      
      if (response.ok) {
        await Promise.all([loadFriendData(), loadChats(), loadUnreadSummary(true)]);
      }
    } catch (error) {
      console.error('Failed to respond to request:', error);
    } finally {
      setRequestProcessingId(null);
    }
  };

  // Check if user is already a friend or has pending request
  const getUserStatus = (userId: string): 'friend' | 'incoming' | 'outgoing' | 'none' => {
    const isFriend = false; // Would need to check friends list
    const hasIncoming = incomingRequests.some(r => r.id === userId);
    const hasOutgoing = outgoingRequests.some(r => r.id === userId);
    
    if (hasIncoming) return 'incoming';
    if (hasOutgoing) return 'outgoing';
    return 'none';
  };

  // Format last seen
  const formatLastSeen = (lastSeen?: string): string => {
    if (!lastSeen) return 'Offline';
    const date = new Date(lastSeen);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen pt-14 pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-strong px-4 py-3">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold mb-3">Friends</h1>
          
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by username or email..."
              className="input pl-10"
            />
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-[var(--text-subtle)] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 pt-28 max-w-lg mx-auto">
        {/* Search Results */}
        {searchQuery.trim() && (
          <div className="mb-6">
            <h2 className="text-label mb-3">Search Results</h2>
            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-muted)]">
                {isSearching ? 'Searching...' : 'No users found'}
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((result) => {
                  const status = getUserStatus(result.id);
                  const isProcessing = requestProcessingId === result.id;
                  const isOnline = userStatuses[result.id] === 'online';
                  
                  return (
                    <div 
                      key={result.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white/5"
                    >
                      <div className="relative">
                        <img
                          src={result.profile_picture || '/default-avatar.png'}
                          alt={result.username}
                          className="w-12 h-12 rounded-full object-cover border border-white/10"
                        />
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[var(--success)] border-2 border-[var(--background)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{result.username}</h3>
                        <p className="text-sm text-[var(--text-muted)]">
                          {isOnline ? 'Online' : formatLastSeen(result.last_seen)}
                        </p>
                      </div>
                      {status === 'none' && (
                        <button
                          onClick={() => handleSendRequest(result.id)}
                          disabled={isProcessing}
                          className="btn-primary text-sm py-2 px-4"
                        >
                          {isProcessing ? '...' : 'Add'}
                        </button>
                      )}
                      {status === 'incoming' && (
                        <span className="text-xs text-[var(--accent)] font-medium">Wants to add you</span>
                      )}
                      {status === 'outgoing' && (
                        <span className="text-xs text-[var(--text-muted)]">Pending</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Friend Requests */}
        {(incomingRequests.length > 0 || outgoingRequests.length > 0) && !searchQuery.trim() && (
          <div className="mb-6">
            <h2 className="text-label mb-3">Friend Requests</h2>
            
            {/* Incoming */}
            {incomingRequests.map((request) => {
              const isProcessing = requestProcessingId === request.id;
              
              return (
                <div 
                  key={request.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 mb-2"
                >
                  <img
                    src={request.profile_picture || '/default-avatar.png'}
                    alt={request.username}
                    className="w-12 h-12 rounded-full object-cover border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{request.username}</h3>
                    <p className="text-sm text-[var(--text-muted)]">Wants to be your friend</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespondToRequest(request.id, 'accept')}
                      disabled={isProcessing}
                      className="btn-primary text-sm py-2 px-3"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespondToRequest(request.id, 'reject')}
                      disabled={isProcessing}
                      className="btn-muted text-sm py-2 px-3"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
            
            {/* Outgoing */}
            {outgoingRequests.map((request) => (
              <div 
                key={request.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 mb-2 opacity-70"
              >
                <img
                  src={request.profile_picture || '/default-avatar.png'}
                  alt={request.username}
                  className="w-12 h-12 rounded-full object-cover border border-white/10"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{request.username}</h3>
                  <p className="text-sm text-[var(--text-muted)]">Request sent</p>
                </div>
                <span className="text-xs text-[var(--text-muted)] px-3">Pending</span>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!searchQuery.trim() && incomingRequests.length === 0 && outgoingRequests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Find new friends</h3>
            <p className="text-[var(--text-muted)] text-sm max-w-xs">
              Search for users by username or email to send friend requests and start chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
