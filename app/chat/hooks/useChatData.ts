'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { chatApi } from '@/lib/chatApi';
import { mapServerMessage } from '@/lib/chatMappers';
import type {
  ChatMessage,
  ChatSummary,
  PresenceStatus,
  SeenReceipt,
  WebSocketPacket,
} from '@/lib/types';
import { webSocketClient } from '@/lib/websocket';

interface UseChatDataOptions {
  token: string | null;
  currentUserId: string | null;
  currentUsername?: string | null;
}

interface MessageMeta {
  cursor: string | null;
  hasMore: boolean;
  loading: boolean;
}

const getTimestamp = (value?: string | null) => {
  if (!value) return 0;
  const date = new Date(value);
  const ms = date.getTime();
  return Number.isNaN(ms) ? 0 : ms;
};

const mergeSeenReceipts = (existing: SeenReceipt[] | undefined, next: SeenReceipt): SeenReceipt[] => {
  const map = new Map<string, SeenReceipt>();
  (existing || []).forEach((entry) => {
    map.set(entry.userId, entry);
  });
  map.set(next.userId, next);
  return Array.from(map.values());
};

const normalizeStatus = (value?: string): PresenceStatus => {
  if (!value) return 'unknown';
  const normalized = value.toLowerCase();
  if (normalized === 'online' || normalized === 'offline' || normalized === 'away') {
    return normalized;
  }
  return 'unknown';
};

const reorderChats = (chats: ChatSummary[], chatId: string, updatedAt: string) => {
  const next = chats.map((chat) =>
    chat.id === chatId ? { ...chat, updatedAt } : chat
  );
  return next.sort((a, b) => getTimestamp(b.updatedAt) - getTimestamp(a.updatedAt));
};

export const useChatData = ({ token, currentUserId, currentUsername }: UseChatDataOptions) => {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [chatsError, setChatsError] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messagesByChat, setMessagesByChat] = useState<Record<string, ChatMessage[]>>({});
  const [messageMeta, setMessageMeta] = useState<Record<string, MessageMeta>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [typingByChat, setTypingByChat] = useState<
    Record<string, Record<string, { username?: string | null; expiresAt: number }>>
  >({});
  const [userStatuses, setUserStatuses] = useState<Record<string, PresenceStatus>>({});
  const [wsConnected, setWsConnected] = useState(false);

  const selectedChatRef = useRef<string | null>(null);
  const messagesRef = useRef<Record<string, ChatMessage[]>>({});
  const pendingQueueRef = useRef<Record<string, string[]>>({});
  const currentUserRef = useRef<string | null>(currentUserId);

  useEffect(() => {
    selectedChatRef.current = selectedChatId;
  }, [selectedChatId]);

  useEffect(() => {
    messagesRef.current = messagesByChat;
  }, [messagesByChat]);

  useEffect(() => {
    currentUserRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    if (!token) {
      setChats([]);
      setSelectedChatId(null);
      setMessagesByChat({});
      setMessageMeta({});
      setUnreadCounts({});
      setUserStatuses({});
      pendingQueueRef.current = {};
    }
  }, [token]);

  const refreshChats = useCallback(async () => {
    if (!token) return;
    setChatsLoading(true);
    setChatsError(null);

    try {
      const [chatResponse, unreadResponse] = await Promise.all([
        chatApi.listChats(token),
        chatApi.unreadSummary(token),
      ]);

      if (chatResponse.success && chatResponse.data) {
        const list = chatResponse.data.chats;
        setChats(list);
        if (!selectedChatRef.current && list.length) {
          setSelectedChatId(list[0].id);
        }
      } else if (!chatResponse.success) {
        setChatsError(chatResponse.error || 'Hiba történt a chat lista betöltésekor.');
      }

      if (unreadResponse.success && unreadResponse.data) {
        setUnreadCounts(unreadResponse.data.chats || {});
      }
    } catch (error) {
      const fallback = error instanceof Error ? error.message : 'Hálózati hiba történt.';
      setChatsError(fallback);
    } finally {
      setChatsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      refreshChats();
    }
  }, [token, refreshChats]);

  const updateMessageMeta = useCallback((chatId: string, updates: Partial<MessageMeta>) => {
    setMessageMeta((prev) => ({
      ...prev,
      [chatId]: {
        cursor: updates.cursor ?? prev[chatId]?.cursor ?? null,
        hasMore: updates.hasMore ?? prev[chatId]?.hasMore ?? false,
        loading: updates.loading ?? prev[chatId]?.loading ?? false,
      },
    }));
  }, []);

  const loadMessages = useCallback(
    async (chatId: string, options: { before?: string } = {}) => {
      if (!token) return;
      updateMessageMeta(chatId, { loading: true });
      try {
        const response = await chatApi.getMessages(
          chatId,
          options.before ? { before: options.before } : {},
          token
        );

        if (response.success && response.data) {
          setMessagesByChat((prev) => {
            const existing = prev[chatId] ?? [];
            const nextMessages = response.data!.messages;
            if (options.before) {
              const existingIds = new Set(existing.map((msg) => msg.id));
              const prepended = nextMessages.filter((msg) => !existingIds.has(msg.id));
              return {
                ...prev,
                [chatId]: [...prepended, ...existing],
              };
            }

            const mergedMap = new Map<string, ChatMessage>();
            [...existing, ...nextMessages].forEach((msg) => {
              mergedMap.set(msg.id, msg);
            });
            const merged = Array.from(mergedMap.values()).sort(
              (a, b) => getTimestamp(a.createdAt) - getTimestamp(b.createdAt)
            );
            return { ...prev, [chatId]: merged };
          });

          updateMessageMeta(chatId, {
            cursor: response.data.nextCursor ?? null,
            hasMore: Boolean(response.data.hasMore),
            loading: false,
          });
        } else {
          updateMessageMeta(chatId, { loading: false });
        }
      } catch {
        updateMessageMeta(chatId, { loading: false });
      }
    },
    [token, updateMessageMeta]
  );

  const loadOlderMessages = useCallback(
    async (chatId?: string) => {
      const targetChatId = chatId || selectedChatRef.current;
      if (!targetChatId) return;
      const meta = messageMeta[targetChatId];
      if (meta?.loading || !meta?.hasMore) {
        return;
      }
      const messages = messagesRef.current[targetChatId] ?? [];
      const oldest = messages[0];
      await loadMessages(targetChatId, { before: oldest?.createdAt });
    },
    [loadMessages, messageMeta]
  );

  useEffect(() => {
    const activeChatId = selectedChatId;
    if (!token || !activeChatId) return;
    if (!messagesRef.current[activeChatId]?.length) {
      loadMessages(activeChatId);
    }
    webSocketClient.joinChat(activeChatId);
    return () => {
      webSocketClient.leaveChat(activeChatId);
    };
  }, [selectedChatId, token, loadMessages]);

  const markChatAsSeen = useCallback(
    async (chatId: string) => {
      if (!token) return;
      const messages = messagesRef.current[chatId] ?? [];
      const latest = messages[messages.length - 1];
      if (latest?.id) {
        webSocketClient.markMessageSeen(chatId, latest.id);
      }
      setUnreadCounts((prev) => ({ ...prev, [chatId]: 0 }));
      try {
        await chatApi.markSeen(chatId, token);
      } catch {
        // ignore
      }
    },
    [token]
  );

  useEffect(() => {
    if (selectedChatId) {
      markChatAsSeen(selectedChatId);
    }
  }, [selectedChatId, markChatAsSeen]);

  const registerPendingMessage = useCallback((chatId: string, pendingId: string) => {
    if (!pendingQueueRef.current[chatId]) {
      pendingQueueRef.current[chatId] = [];
    }
    pendingQueueRef.current[chatId].push(pendingId);
  }, []);

  const resolvePendingMessage = useCallback((chatId: string) => {
    const queue = pendingQueueRef.current[chatId];
    if (!queue || !queue.length) {
      return null;
    }
    return queue.shift() ?? null;
  }, []);

  const handleIncomingMessage = useCallback(
    (payload: WebSocketPacket) => {
      const chatId = payload.chatId?.toString?.();
      if (!chatId) return;
      const mapped = mapServerMessage(payload);
      const senderId = mapped.senderId;
      const isSelf = currentUserRef.current && senderId === currentUserRef.current;
      if (isSelf) {
        mapped.status = 'sent';
      }
      setMessagesByChat((prev) => {
        const existing = prev[chatId] ?? [];
        let next = existing;
        if (isSelf) {
          const pendingId = resolvePendingMessage(chatId);
          if (pendingId) {
            const index = existing.findIndex((msg) => msg.id === pendingId);
            if (index >= 0) {
              next = [...existing];
              next[index] = { ...mapped, status: 'sent' };
            } else {
              next = [...existing, { ...mapped, status: 'sent' }];
            }
          } else {
            next = [...existing, { ...mapped, status: 'sent' }];
          }
        } else {
          const exists = existing.some((msg) => msg.id === mapped.id);
          next = exists ? existing : [...existing, mapped];
        }
        next = next.sort((a, b) => getTimestamp(a.createdAt) - getTimestamp(b.createdAt));
        return { ...prev, [chatId]: next };
      });
      setChats((prev) => reorderChats(prev, chatId, mapped.createdAt));
      if (!isSelf && selectedChatRef.current !== chatId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [chatId]: (prev[chatId] ?? 0) + 1,
        }));
      } else if (selectedChatRef.current === chatId) {
        setUnreadCounts((prev) => ({ ...prev, [chatId]: 0 }));
        if (mapped.id) {
          webSocketClient.markMessageSeen(chatId, mapped.id);
        }
      }
    },
    [resolvePendingMessage]
  );

  const handleMessageStatus = useCallback((payload: WebSocketPacket) => {
    const chatId = payload.chatId?.toString?.();
    const messageId = payload.messageId?.toString?.();
    if (!chatId || !messageId) return;
    setMessagesByChat((prev) => {
      const list = prev[chatId];
      if (!list) return prev;
      const index = list.findIndex((message) => message.id === messageId);
      if (index === -1) return prev;
      const next = [...list];
      const current = next[index];
      let status = current.status;
      if (payload.status === 'delivered') {
        status = 'delivered';
      }
      if (payload.status === 'seen') {
        status = 'seen';
      }
      const seenBy =
        payload.status === 'seen' && payload.viewerId
          ? mergeSeenReceipts(current.seenBy, {
              userId: payload.viewerId.toString(),
              username: payload.viewerUsername,
              avatarUrl: payload.viewerAvatar,
              seenAt: payload.seenAt,
            })
          : current.seenBy;
      next[index] = {
        ...current,
        status,
        deliveredAt: payload.deliveredAt ?? current.deliveredAt,
        seenAt: payload.seenAt ?? current.seenAt,
        seenBy,
      };
      return { ...prev, [chatId]: next };
    });
  }, []);

  const handleTypingEvent = useCallback((payload: WebSocketPacket) => {
    const chatId = payload.chatId?.toString?.();
    const userId = payload.userId?.toString?.();
    if (!chatId || !userId || userId === currentUserRef.current) return;
    setTypingByChat((prev) => {
      const grid = { ...(prev[chatId] || {}) };
      grid[userId] = {
        username: payload.username,
        expiresAt: Date.now() + 4000,
      };
      return { ...prev, [chatId]: grid };
    });
  }, []);

  const handleStopTyping = useCallback((payload: WebSocketPacket) => {
    const chatId = payload.chatId?.toString?.();
    const userId = payload.userId?.toString?.();
    if (!chatId || !userId) return;
    setTypingByChat((prev) => {
      const map = prev[chatId];
      if (!map || !map[userId]) {
        return prev;
      }
      const nextMap = { ...map };
      delete nextMap[userId];
      return { ...prev, [chatId]: nextMap };
    });
  }, []);

  const applyStatusUpdates = useCallback((updates: Record<string, PresenceStatus>) => {
    setUserStatuses((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const handleRealtimeMessage = useCallback(
    (payload: WebSocketPacket) => {
      switch (payload.type) {
        case 'new_message':
        case 'message_envelope':
        case 'message_envelope_sent':
          handleIncomingMessage(payload);
          break;
        case 'message_status':
          handleMessageStatus(payload);
          break;
        case 'typing':
          handleTypingEvent(payload);
          break;
        case 'stop-typing':
          handleStopTyping(payload);
          break;
        case 'friend_status_change': {
          const userId = payload.userId?.toString?.();
          if (userId) {
            applyStatusUpdates({ [userId]: normalizeStatus(payload.status) });
          }
          break;
        }
        case 'user_status_update': {
          const userId = payload.userId?.toString?.();
          if (userId && payload.data?.status) {
            applyStatusUpdates({ [userId]: normalizeStatus(payload.data.status) });
          }
          break;
        }
        case 'bulk_status_update':
          if (payload.data?.statuses) {
            const updates: Record<string, PresenceStatus> = {};
            Object.entries(payload.data.statuses).forEach(([id, status]) => {
              updates[id] = normalizeStatus(status as string);
            });
            applyStatusUpdates(updates);
          }
          break;
        case 'chat_group_created':
        case 'chat_updated':
        case 'chat_members_added':
        case 'chat_members_removed':
        case 'chat_deleted':
        case 'chat_removed':
          refreshChats();
          break;
        default:
          break;
      }
    },
    [
      applyStatusUpdates,
      handleIncomingMessage,
      handleMessageStatus,
      handleStopTyping,
      handleTypingEvent,
      refreshChats,
    ]
  );

  useEffect(() => {
    if (!token) {
      webSocketClient.disconnect();
      return;
    }
    webSocketClient.connect(token);
    const unsub = webSocketClient.onMessage(handleRealtimeMessage);
    const unsubStatus = webSocketClient.onStatus((state) => setWsConnected(state));
    return () => {
      unsub();
      unsubStatus();
      webSocketClient.disconnect();
    };
  }, [token, handleRealtimeMessage]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTypingByChat((prev) => {
        const now = Date.now();
        let changed = false;
        const next: typeof prev = {};
        Object.entries(prev).forEach(([chatId, map]) => {
          const filteredEntries = Object.entries(map).filter(([, meta]) => meta.expiresAt > now);
          if (filteredEntries.length) {
            next[chatId] = Object.fromEntries(filteredEntries);
          }
          if (filteredEntries.length !== Object.entries(map).length) {
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = useCallback(
    (content: string, chatId?: string) => {
      const targetChatId = chatId || selectedChatRef.current;
      if (!targetChatId || !content.trim() || !currentUserRef.current) {
        return;
      }
      const now = new Date().toISOString();
      const pendingId = `pending-${now}-${Math.random().toString(36).slice(2, 6)}`;
      const message: ChatMessage = {
        id: pendingId,
        pendingId,
        chatId: targetChatId,
        senderId: currentUserRef.current,
        senderName: currentUsername || 'You',
        content: content.trim(),
        messageType: 'text',
        createdAt: now,
        status: 'sending',
        attachments: [],
      };
      registerPendingMessage(targetChatId, pendingId);
      setMessagesByChat((prev) => {
        const existing = prev[targetChatId] ?? [];
        return {
          ...prev,
          [targetChatId]: [...existing, message],
        };
      });
      webSocketClient.sendChatMessage(targetChatId, content.trim());
      setChats((prev) => reorderChats(prev, targetChatId, now));
    },
    [currentUsername, registerPendingMessage]
  );

  const typingUsers = useMemo(() => {
    const active = typingByChat[selectedChatId ?? ''] || {};
    return Object.values(active).map((entry) => entry.username || 'Valaki');
  }, [typingByChat, selectedChatId]);

  const activeMessages = messagesByChat[selectedChatId ?? ''] || [];
  const activeMeta = messageMeta[selectedChatId ?? ''] || { cursor: null, hasMore: false, loading: false };

  const typingForChat = (chatId: string) => {
    const map = typingByChat[chatId] || {};
    return Object.values(map).map((entry) => entry.username || 'Valaki');
  };

  return {
    chats,
    chatsLoading,
    chatsError,
    selectedChatId,
    setSelectedChatId,
    refreshChats,
    messagesByChat,
    messages: activeMessages,
    activeMeta,
    loadOlderMessages,
    sendMessage,
    markChatAsSeen,
    unreadCounts,
    typingUsers,
    typingForChat,
    userStatuses,
    wsConnected,
  };
};
