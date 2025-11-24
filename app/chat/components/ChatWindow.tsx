'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMessage, ChatSummary } from '@/lib/types';
import { ConnectionBadge } from './ConnectionBadge';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { TypingIndicator } from './TypingIndicator';
import { webSocketClient } from '@/lib/websocket';

interface ChatWindowProps {
  chat: ChatSummary | null;
  messages: ChatMessage[];
  typingUsers: string[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadOlder: () => void;
  onSend: (message: string) => void;
  wsConnected: boolean;
  currentUserId: string;
  canViewEncrypted: boolean;
}

const describeChat = (chat: ChatSummary | null, currentUserId: string) => {
  if (!chat) return '';
  if (chat.isGroup) {
    return `${chat.participantCount} résztvevő`;
  }
  const participant = chat.participants.find((item) => item.id !== currentUserId);
  return participant?.email || participant?.username || '';
};

export const ChatWindow = ({
  chat,
  messages,
  typingUsers,
  hasMore,
  isLoading,
  onLoadOlder,
  onSend,
  wsConnected,
  currentUserId,
  canViewEncrypted,
}: ChatWindowProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (!scrollRef.current) return;
    if (autoScroll) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollTop <= 0 && hasMore && !isLoading) {
      onLoadOlder();
    }
    const nearBottom = scrollTop + clientHeight >= scrollHeight - 80;
    setAutoScroll(nearBottom);
  };

  const handleTyping = () => {
    if (!chat) return;
    webSocketClient.sendTyping(chat.id);
  };

  const handleStopTyping = () => {
    if (!chat) return;
    webSocketClient.sendStopTyping(chat.id);
  };

  const title = useMemo(() => {
    if (!chat) return 'Válassz egy chatet';
    if (chat.isGroup) {
      return chat.displayName || chat.name || 'Csoport chat';
    }
    const participant = chat.participants.find((user) => user.id !== currentUserId);
    return participant?.username || participant?.email || 'Ismeretlen felhasználó';
  }, [chat, currentUserId]);

  if (!chat) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center gap-4 bg-white/0 text-white/70">
        <h2 className="text-2xl font-semibold text-white">Válassz egy beszélgetést</h2>
        <p className="max-w-md text-center text-sm text-white/60">
          A bal oldali listából kiválasztva jelenítjük meg a teljes üzenet előzményt, gépelési
          indikátorokat és azonnal küldheted a válaszod.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col">
      <header className="flex items-start justify-between border-b border-white/10 px-8 py-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-blue-200/80">Aktív chat</p>
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <p className="text-xs text-white/60">{describeChat(chat, currentUserId)}</p>
        </div>
        <ConnectionBadge connected={wsConnected} />
      </header>
      <div className="flex-1 overflow-hidden px-6 py-4">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto space-y-4 pr-4"
        >
          {hasMore && (
            <button
              disabled={isLoading}
              onClick={onLoadOlder}
              className="mx-auto block rounded-full border border-white/10 px-4 py-1 text-xs text-white/70 transition hover:border-blue-400"
            >
              {isLoading ? 'Töltés...' : 'Korábbi üzenetek betöltése'}
            </button>
          )}
          {messages.map((message, index) => {
            const previous = messages[index - 1];
            const showSender = chat.isGroup && (!previous || previous.senderId !== message.senderId);
            const isOwn = message.senderId === currentUserId;
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={isOwn}
                showSender={showSender}
                canViewEncrypted={canViewEncrypted}
              />
            );
          })}
          <TypingIndicator users={typingUsers} />
        </div>
      </div>
      <div className="px-8 pb-8">
        <MessageComposer onSend={onSend} disabled={!wsConnected} onTyping={handleTyping} onStopTyping={handleStopTyping} />
      </div>
    </section>
  );
};
