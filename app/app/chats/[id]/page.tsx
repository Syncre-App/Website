'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChatContext } from '../../../context/ChatContext';
import { ApiService } from '../../../services/ApiService';
import { WebSocketService } from '../../../services/WebSocketService';
import { StorageService } from '../../../services/StorageService';

interface Message {
  id: string | number;
  sender_id?: string | number;
  senderId?: string | number;
  content?: string;
  text?: string;
  message?: string;
  created_at?: string;
  createdAt?: string;
  timestamp?: string;
}

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  const { user, chats } = useChatContext();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chat = chats.find(c => c.id?.toString() === chatId);

  const getChatName = () => {
    if (!chat) return 'Chat';
    if (chat.name) return chat.name;
    const other = chat.participants?.find((p: any) => p.id?.toString() !== user?.id?.toString());
    return other?.username || 'Unknown';
  };

  useEffect(() => {
    const loadMessages = async () => {
      const response = await ApiService.get(`/chat/${chatId}/messages?limit=50`);
      console.log('Messages API response:', response);
      if (response.success) {
        const msgs = response.data?.messages || [];
        console.log('First message:', msgs[0]);
        setMessages(msgs);
      }
      setLoading(false);
    };
    
    if (chatId) {
      loadMessages();
      StorageService.getDeviceId().then(deviceId => {
        WebSocketService.joinChat(chatId, deviceId);
      });
    }

    return () => {
      WebSocketService.leaveChat(chatId);
    };
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage('');

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, { 
      id: tempId, 
      sender_id: user?.id, 
      content, 
      created_at: new Date().toISOString() 
    }]);

    // Send via API
    const response = await ApiService.post(`/chat/${chatId}/messages`, { content });
    if (response.success) {
      setMessages(prev => prev.map(m => m.id === tempId ? { ...response.data, id: response.data.id?.toString() } : m));
      
      // Also send via WebSocket
      const deviceId = await StorageService.getDeviceId();
      WebSocketService.sendMessage({ chatId, content, deviceId });
    } else {
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const isOwn = (msg: Message) => {
    const senderId = msg.sender_id || msg.senderId;
    return senderId?.toString() === user?.id?.toString();
  };

  const getMessageContent = (msg: Message) => {
    const content = msg.content || msg.text || msg.message;
    if (!content) {
      // Debug: show available fields
      console.log('Message without content:', msg);
      return JSON.stringify(msg).slice(0, 50) + '...';
    }
    return content;
  };

  const getMessageDate = (msg: Message) => {
    const dateStr = msg.created_at || msg.createdAt || msg.timestamp;
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getSenderId = (msg: Message) => {
    return (msg.sender_id || msg.senderId)?.toString() || '';
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <header className="fixed top-16 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => router.push('/app/chats')} className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <img src={chat?.avatar_url || '/default-avatar.svg'} alt={getChatName()} className="w-10 h-10 rounded-full object-cover border border-white/10" />
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-white truncate">{getChatName()}</h1>
            <p className="text-xs text-white/60">{chat?.is_group ? `${chat.participants?.length || 0} members` : 'End-to-end encrypted'}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pt-32 pb-24 px-4">
        <div className="max-w-lg mx-auto space-y-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`flex ${i % 2 ? 'justify-end' : 'justify-start'}`}>
                  <div className={`h-10 rounded-2xl bg-white/10 animate-pulse ${i % 2 ? 'w-32' : 'w-48'}`} />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/60">No messages yet</p>
              <p className="text-sm text-white/40">Send a message to start</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const own = isOwn(msg);
              const prevMsg = i > 0 ? messages[i-1] : null;
              const showAvatar = !own && prevMsg && !isOwn(prevMsg);
              const content = getMessageContent(msg);
              
              return (
                <div key={msg.id} className={`flex ${own ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                  {!own && (
                    <div className="w-8">
                      {showAvatar && (
                        <img 
                          src={chat?.participants?.find((p: any) => p.id?.toString() === getSenderId(msg))?.profile_picture || '/default-avatar.svg'} 
                          alt="" 
                          className="w-8 h-8 rounded-full" 
                        />
                      )}
                    </div>
                  )}
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${own ? 'bg-blue-500 text-white rounded-br-md' : 'bg-white/10 text-white rounded-bl-md'}`}>
                    <p className="text-[15px] break-words">{content || <span className="italic text-white/50">(No content)</span>}</p>
                    <span className={`text-[10px] mt-1 block ${own ? 'text-white/70' : 'text-white/50'}`}>
                      {getMessageDate(msg)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-t border-white/10 px-4 py-3">
        <form onSubmit={handleSend} className="max-w-lg mx-auto flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
          />
          <button type="submit" disabled={!newMessage.trim()} className={`p-3 rounded-full ${newMessage.trim() ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/40'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
