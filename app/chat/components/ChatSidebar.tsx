'use client';

import { useMemo, useState } from 'react';
import type { ChatMessage, ChatSummary, PresenceStatus, UserProfile } from '@/lib/types';

interface ChatSidebarProps {
  user: UserProfile;
  chats: ChatSummary[];
  loading: boolean;
  error?: string | null;
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onRefresh: () => void;
  unreadCounts: Record<string, number>;
  userStatuses: Record<string, PresenceStatus>;
  typingForChat: (chatId: string) => string[];
  messagesByChat: Record<string, ChatMessage[]>;
  currentUserId: string;
}

const getChatTitle = (chat: ChatSummary, currentUserId: string) => {
  if (chat.isGroup) {
    return chat.displayName || chat.name || 'Csoport chat';
  }
  const others = chat.participants.filter((participant) => participant.id !== currentUserId);
  if (others.length) {
    return others[0].username || others[0].email || 'Ismeretlen felhasználó';
  }
  return 'Ismeretlen felhasználó';
};

const getChatAvatar = (chat: ChatSummary, currentUserId: string) => {
  if (chat.avatarUrl) return chat.avatarUrl;
  if (!chat.isGroup) {
    const others = chat.participants.filter((participant) => participant.id !== currentUserId);
    const candidate = others[0];
    return candidate?.profile_picture || candidate?.profilePicture || null;
  }
  return null;
};

const getPresenceLabel = (status?: PresenceStatus) => {
  switch (status) {
    case 'online':
      return 'Online';
    case 'away':
      return 'Rögtön jön';
    case 'offline':
      return 'Offline';
    default:
      return 'Ismeretlen';
  }
};

const PresenceDot = ({ status }: { status?: PresenceStatus }) => {
  const color =
    status === 'online' ? 'bg-emerald-400' : status === 'away' ? 'bg-amber-400' : 'bg-white/30';
  return <span className={`h-2 w-2 rounded-full ${color}`} />;
};

const formatPreview = (message?: ChatMessage) => {
  if (!message) {
    return 'Nincs üzenet';
  }
  if (message.isDeleted) {
    return 'Üzenet törölve';
  }
  if (message.isEncrypted && !message.content) {
    return '🔒 Titkosított üzenet';
  }
  return message.content || '🔒 Titkosított üzenet';
};

const formatUpdatedAt = (value?: string | null) => {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('hu-HU', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return '';
  }
};

export const ChatSidebar = ({
  user,
  chats,
  loading,
  error,
  selectedChatId,
  onSelectChat,
  onRefresh,
  unreadCounts,
  userStatuses,
  typingForChat,
  messagesByChat,
  currentUserId,
}: ChatSidebarProps) => {
  const [query, setQuery] = useState('');

  const filteredChats = useMemo(() => {
    if (!query.trim()) {
      return chats;
    }
    const q = query.trim().toLowerCase();
    return chats.filter((chat) => getChatTitle(chat, currentUserId).toLowerCase().includes(q));
  }, [chats, currentUserId, query]);

  return (
    <aside className="flex h-full w-full max-w-sm flex-col border-r border-white/10 bg-black/20 p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {user.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.username}
              className="h-12 w-12 rounded-full object-cover border border-white/10"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 text-lg font-semibold text-blue-100">
              {user.username?.[0]?.toUpperCase() ?? 'S'}
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-blue-200/80">Fiók</p>
            <h2 className="text-xl font-semibold text-white">{user.username}</h2>
            <p className="text-xs text-white/60">{user.email}</p>
          </div>
        </div>
      </div>
      <div className="mb-4 flex items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Chat keresése..."
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-blue-400"
        />
        <button
          onClick={onRefresh}
          className="rounded-2xl border border-white/10 px-3 py-2 text-xs text-white/70 transition hover:border-blue-400"
        >
          Frissítés
        </button>
      </div>
      {error && <p className="mb-3 rounded-2xl bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</p>}
      <div className="flex-1 space-y-2 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 240px)' }}>
        {loading && <p className="text-sm text-white/60">Chat lista betöltése...</p>}
        {!loading && filteredChats.length === 0 && (
          <p className="text-sm text-white/60">Nem található chat.</p>
        )}
        {filteredChats.map((chat) => {
          const chatId = chat.id;
          const isSelected = selectedChatId === chatId;
          const title = getChatTitle(chat, currentUserId);
          const typingUsers = typingForChat(chatId);
          const lastMessageList = messagesByChat[chatId] ?? [];
          const lastMessage = lastMessageList[lastMessageList.length - 1];
          const avatar = getChatAvatar(chat, currentUserId);
          const subtitle = typingUsers.length
            ? `${typingUsers.join(', ')} éppen gépel...`
            : chat.isGroup
            ? `${chat.participantCount} fő`
            : getPresenceLabel(userStatuses[chat.participants.find((p) => p.id !== currentUserId)?.id || '']);

          return (
            <button
              key={chatId}
              onClick={() => onSelectChat(chatId)}
              className={`flex w-full items-center gap-4 rounded-3xl border px-4 py-3 text-left transition ${
                isSelected
                  ? 'border-blue-400/60 bg-blue-500/10'
                  : 'border-white/5 bg-white/0 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={title}
                  className="h-12 w-12 rounded-2xl object-cover border border-white/10"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/40 to-indigo-600/40 text-base font-semibold text-white">
                  {chat.isGroup ? '👥' : title[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-white">{title}</p>
                  {chat.isGroup ? (
                    <span className="text-[11px] text-white/40">{formatUpdatedAt(chat.updatedAt)}</span>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-white/50">
                      {!chat.isGroup && (
                        <PresenceDot
                          status={
                            userStatuses[
                              chat.participants.find((participant) => participant.id !== currentUserId)?.id || ''
                            ]
                          }
                        />
                      )}
                      <span>{formatUpdatedAt(chat.updatedAt)}</span>
                    </div>
                  )}
                </div>
                <p className={`truncate text-xs ${typingUsers.length ? 'text-blue-200' : 'text-white/60'}`}>
                  {subtitle}
                </p>
                <p className="truncate text-xs text-white/40">{formatPreview(lastMessage)}</p>
              </div>
              {unreadCounts[chatId] ? (
                <span className="rounded-full bg-blue-500 px-2 py-1 text-xs font-semibold text-white">
                  {unreadCounts[chatId]}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
