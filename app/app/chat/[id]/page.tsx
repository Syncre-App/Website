'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '../../layout';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  message_type: string;
  attachments?: any[];
  reply_to?: any;
  reactions?: any[];
}

interface ChatData {
  id: string;
  name?: string;
  is_group?: boolean;
  participants?: any[];
}

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  
  const { user, chats, userStatuses, loadChats } = useAppContext();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get chat data
  const chat = chats.find(c => c.id?.toString() === chatId);
  
  // Get chat name
  const getChatName = (): string => {
    if (!chat) return 'Chat';
    if (chat.name) return chat.name;
    if (chat.is_group) return `Group (${chat.participants?.length || 0})`;
    
    const otherParticipant = chat.participants?.find(
      (p) => p.id?.toString() !== user?.id?.toString()
    );
    return otherParticipant?.username || 'Unknown';
  };

  // Get other participant for 1-on-1
  const getOtherParticipant = () => {
    if (!chat || chat.is_group) return null;
    return chat.participants?.find(
      (p) => p.id?.toString() !== user?.id?.toString()
    );
  };

  // Load messages
  const loadMessages = useCallback(async (before?: string) => {
    if (!chatId) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      const url = before 
        ? `https://api.syncre.xyz/v1/chat/${chatId}/messages?before=${before}&limit=50`
        : `https://api.syncre.xyz/v1/chat/${chatId}/messages?limit=50`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const newMessages = data.messages || [];
        
        if (before) {
          setMessages(prev => [...newMessages, ...prev]);
        } else {
          setMessages(newMessages);
        }
        
        setHasMore(newMessages.length === 50);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      // Optimistically add message
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: Message = {
        id: tempId,
        sender_id: user?.id,
        content,
        created_at: new Date().toISOString(),
        message_type: 'text',
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Send via API (WebSocket would be better but using REST for now)
      const response = await fetch(`https://api.syncre.xyz/v1/chat/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Replace optimistic message with real one
        setMessages(prev => 
          prev.map(m => m.id === tempId ? { ...data, id: data.id?.toString() } : m)
        );
      } else {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(m => m.id !== tempId));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    // Debounce typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Send typing indicator via WebSocket if connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        chatId,
      }));
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'stop-typing',
          chatId,
        }));
      }
    }, 3000);
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format time
  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Check if message is from current user
  const isOwnMessage = (senderId: string): boolean => {
    return senderId?.toString() === user?.id?.toString();
  };

  // Load initial messages
  useEffect(() => {
    if (chatId) {
      loadMessages();
      loadChats();
    }
  }, [chatId, loadMessages, loadChats]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket connection
  useEffect(() => {
    if (!chatId || !user) return;
    
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    
    // Connect to WebSocket
    const ws = new WebSocket('wss://api.syncre.xyz/ws');
    wsRef.current = ws;
    
    ws.onopen = () => {
      // Authenticate
      ws.send(JSON.stringify({
        type: 'auth',
        token,
      }));
      
      // Join chat room
      ws.send(JSON.stringify({
        type: 'chat_join',
        chatId,
      }));
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'new_message':
            if (message.chatId?.toString() === chatId) {
              setMessages(prev => [...prev, message]);
            }
            break;
          case 'typing':
            if (message.chatId?.toString() === chatId && message.userId !== user.id) {
              setTypingUsers(prev => new Set(prev).add(message.userId));
            }
            break;
          case 'stop-typing':
            if (message.chatId?.toString() === chatId) {
              setTypingUsers(prev => {
                const next = new Set(prev);
                next.delete(message.userId);
                return next;
              });
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };
    
    return () => {
      ws.close();
    };
  }, [chatId, user]);

  const otherParticipant = getOtherParticipant();
  const isOnline = otherParticipant && userStatuses[otherParticipant.id?.toString()] === 'online';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-strong px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            onClick={() => router.push('/app')}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="relative">
            <img
              src={chat?.avatar_url || '/default-avatar.png'}
              alt={getChatName()}
              className="w-10 h-10 rounded-full object-cover border border-white/10"
            />
            {!chat?.is_group && isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[var(--success)] border-2 border-[var(--background)]" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="font-bold truncate">{getChatName()}</h1>
            <p className="text-xs text-[var(--text-muted)]">
              {chat?.is_group 
                ? `${chat.participants?.length || 0} members`
                : isOnline ? 'Online' : 'Offline'
              }
            </p>
          </div>
          
          <button
            onClick={() => router.push(`/app/chat/${chatId}/info`)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pt-20 pb-24 px-4">
        <div className="max-w-lg mx-auto space-y-4">
          {loading ? (
            // Loading skeleton
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`h-10 rounded-2xl bg-white/10 animate-pulse ${i % 2 === 0 ? 'w-48' : 'w-32'}`} />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-[var(--text-muted)]">No messages yet</p>
              <p className="text-sm text-[var(--text-subtle)] mt-1">Send a message to start the conversation</p>
            </div>
          ) : (
            // Messages list
            messages.map((message, index) => {
              const isOwn = isOwnMessage(message.sender_id);
              const showAvatar = !isOwn && (!messages[index - 1] || messages[index - 1].sender_id !== message.sender_id);
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end gap-2`}
                >
                  {!isOwn && (
                    <div className="w-8">
                      {showAvatar && (
                        <img
                          src={chat?.participants?.find(p => p.id?.toString() === message.sender_id)?.profile_picture || '/default-avatar.png'}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                        />
                      )}
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                      isOwn
                        ? 'bg-[var(--accent)] text-white rounded-br-md'
                        : 'bg-white/10 text-[var(--text)] rounded-bl-md'
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed">{message.content}</p>
                    <span className={`text-[10px] mt-1 block ${isOwn ? 'text-white/70' : 'text-[var(--text-subtle)]'}`}>
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          
          {/* Typing indicator */}
          {typingUsers.size > 0 && (
            <div className="flex justify-start items-end gap-2">
              <div className="w-8" />
              <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="fixed bottom-16 left-0 right-0 z-40 glass-strong px-4 py-3">
        <form onSubmit={handleSendMessage} className="max-w-lg mx-auto flex items-end gap-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors shrink-0"
          >
            <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleTyping}
              placeholder="Message..."
              className="input pr-10"
              disabled={sending}
            />
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`p-3 rounded-full transition-colors shrink-0 ${
              newMessage.trim() && !sending
                ? 'bg-[var(--accent)] text-white'
                : 'bg-white/10 text-[var(--text-muted)]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
