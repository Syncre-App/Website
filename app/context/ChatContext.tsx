// ChatContext.tsx - Global state management
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ApiService } from '../services/ApiService';
import { WebSocketService, WebSocketMessage, UserStatus } from '../services/WebSocketService';
import { StorageService } from '../services/StorageService';

interface ChatContextValue {
  user: any;
  chats: any[];
  chatsLoading: boolean;
  incomingRequests: any[];
  outgoingRequests: any[];
  userStatuses: UserStatus;
  chatUnreadCounts: Record<string, number>;
  totalUnreadChats: number;
  chatStreaks: Record<string, any>;
  isOnline: boolean;
  loadChats: () => Promise<void>;
  loadFriendData: () => Promise<void>;
  loadUnreadSummary: () => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChatContext must be used within ChatProvider');
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [userStatuses, setUserStatuses] = useState<UserStatus>({});
  const [chatUnreadCounts, setChatUnreadCounts] = useState<Record<string, number>>({});
  const [totalUnreadChats, setTotalUnreadChats] = useState(0);
  const [chatStreaks, setChatStreaks] = useState<Record<string, any>>({});
  const [isOnline, setIsOnline] = useState(false);

  const loadChats = useCallback(async () => {
    setChatsLoading(true);
    try {
      const response = await ApiService.get('/chat');
      if (response.success) {
        setChats(response.data?.chats || []);
        
        const chatIds = response.data?.chats?.map((c: any) => c.id).filter(Boolean) || [];
        if (chatIds.length > 0) {
          const streaksResponse = await ApiService.getStreaksForChats(chatIds);
          if (streaksResponse.success) {
            setChatStreaks(streaksResponse.data?.streaks || {});
          }
        }
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setChatsLoading(false);
    }
  }, []);

  const loadFriendData = useCallback(async () => {
    try {
      const response = await ApiService.get('/user/friends');
      if (response.success) {
        const pending = response.data?.pending || {};
        setIncomingRequests(pending.incoming || []);
        setOutgoingRequests(pending.outgoing || []);
      }
    } catch (error) {
      console.error('Failed to load friend data:', error);
    }
  }, []);

  const loadUnreadSummary = useCallback(async () => {
    try {
      const response = await ApiService.get('/chat/unread/summary');
      if (response.success) {
        setChatUnreadCounts(response.data?.chats || {});
        setTotalUnreadChats(response.data?.total || 0);
      }
    } catch (error) {
      console.error('Failed to load unread summary:', error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const userData = await StorageService.getUserData();
      if (userData) setUser(userData);

      try {
        const response = await ApiService.get('/user/me');
        if (response.success) {
          setUser(response.data);
          await StorageService.setUserData(response.data);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      }

      await Promise.all([loadChats(), loadFriendData(), loadUnreadSummary()]);
      
      try {
        await WebSocketService.connect();
        setIsOnline(true);
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
      }
    };

    init();
  }, [loadChats, loadFriendData, loadUnreadSummary]);

  useEffect(() => {
    const unsubscribeStatus = WebSocketService.addStatusListener((statuses) => {
      setUserStatuses(statuses);
    });

    const unsubscribeMessage = WebSocketService.addMessageListener((message: WebSocketMessage) => {
      switch (message.type) {
        case 'friend_request_received':
        case 'friend_request_accepted':
        case 'friend_removed':
          loadFriendData();
          break;
        case 'chat_updated':
        case 'chat_deleted':
          loadChats();
          break;
        case 'new_message':
          loadUnreadSummary();
          break;
      }
    });

    return () => {
      unsubscribeStatus();
      unsubscribeMessage();
    };
  }, [loadChats, loadFriendData, loadUnreadSummary]);

  return (
    <ChatContext.Provider value={{
      user, chats, chatsLoading, incomingRequests, outgoingRequests,
      userStatuses, chatUnreadCounts, totalUnreadChats, chatStreaks, isOnline,
      loadChats, loadFriendData, loadUnreadSummary
    }}>
      {children}
    </ChatContext.Provider>
  );
};
