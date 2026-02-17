'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from './layout';

interface Chat {
  id: string | number;
  name?: string;
  is_group?: boolean;
  participants?: any[];
  participantCount?: number;
  avatar_url?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  streak?: number;
}

export default function ChatsPage() {
  const router = useRouter();
  const {
    user,
    chats,
    chatsLoading,
    userStatuses,
    chatUnreadCounts,
    chatStreaks,
    blockedUsers,
    isOnline,
    loadChats,
    loadFriendData,
    loadUnreadSummary,
    handleRefresh,
  } = useAppContext();

  const [removingFriendId, setRemovingFriendId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Handle refresh
  const handleChatRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadChats(), loadFriendData(), loadUnreadSummary(true)]);
    setRefreshing(false);
  }, [loadChats, loadFriendData, loadUnreadSummary]);

  // Handle chat click
  const handleChatClick = (chatId: string | number) => {
    router.push(`/app/chat/${chatId}`);
  };

  // Get chat display name
  const getChatName = (chat: Chat): string => {
    if (chat.name) return chat.name;
    if (chat.is_group) return `Group (${chat.participantCount || 0})`;
    
    const otherParticipant = chat.participants?.find(
      (p) => p.id?.toString() !== user?.id?.toString()
    );
    return otherParticipant?.username || 'Unknown';
  };

  // Get chat avatar
  const getChatAvatar = (chat: Chat): string | null => {
    if (chat.avatar_url) return chat.avatar_url;
    
    const otherParticipant = chat.participants?.find(
      (p) => p.id?.toString() !== user?.id?.toString()
    );
    return otherParticipant?.profile_picture || null;
  };

  // Get other participant for 1-on-1 chats
  const getOtherParticipant = (chat: Chat) => {
    if (chat.is_group) return null;
    return chat.participants?.find(
      (p) => p.id?.toString() !== user?.id?.toString()
    );
  };

  // Format timestamp
  const formatTime = (timestamp?: string): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get online status for user
  const getUserStatus = (userId: string): string => {
    return userStatuses[userId] || 'offline';
  };

  return (
    <div className="min-h-screen pt-14 pb-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-strong px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <h1 className="text-xl font-bold">Chats</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleChatRefresh}
              disabled={refreshing}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg 
                className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            {user && (
              <div className="relative">
                <img
                  src={user.profile_picture || '/default-avatar.png'}
                  alt={user.username}
                  className="w-9 h-9 rounded-full object-cover border-2 border-white/20"
                />
                <span 
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--background)] ${
                    isOnline ? 'bg-[var(--success)]' : 'bg-[var(--text-muted)]'
                  }`}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Chat List */}
      <div className="px-4 pt-20 max-w-lg mx-auto">
        {chatsLoading && chats.length === 0 ? (
          // Loading skeleton
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded bg-white/10" />
                  <div className="h-3 w-32 rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : chats.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No chats yet</h3>
            <p className="text-[var(--text-muted)] text-sm max-w-xs">
              Add friends from the Friends tab to start messaging
            </p>
            <button
              onClick={() => router.push('/app/friends')}
              className="mt-6 btn-primary"
            >
              Find Friends
            </button>
          </div>
        ) : (
          // Chat list
          <div className="space-y-1">
            {chats.map((chat) => {
              const chatId = chat.id?.toString();
              const unreadCount = chatUnreadCounts[chatId] || 0;
              const streak = chatStreaks[chatId];
              const otherParticipant = getOtherParticipant(chat);
              const isOnline = otherParticipant && getUserStatus(otherParticipant.id?.toString()) === 'online';
              const isBlocked = otherParticipant && blockedUsers.has(otherParticipant.id?.toString());
              
              return (
                <button
                  key={chatId}
                  onClick={() => handleChatClick(chat.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors text-left group"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={getChatAvatar(chat) || '/default-avatar.png'}
                      alt={getChatName(chat)}
                      className="w-12 h-12 rounded-full object-cover border border-white/10"
                    />
                    {!chat.is_group && isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[var(--success)] border-2 border-[var(--background)]" />
                    )}
                    {isBlocked && (
                      <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`font-semibold truncate ${unreadCount > 0 ? 'text-white' : 'text-[var(--text)]'}`}>
                        {getChatName(chat)}
                      </h3>
                      <span className="text-xs text-[var(--text-subtle)] shrink-0">
                        {formatTime(chat.lastMessageTime || chat.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${unreadCount > 0 ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                      {unreadCount > 0 && (
                        <span className="shrink-0 bg-[var(--accent)] text-white text-xs font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Streak indicator */}
                  {streak && streak.currentStreak > 0 && (
                    <div className="shrink-0 flex items-center gap-1 text-[var(--warning)]">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-bold">{streak.currentStreak}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
