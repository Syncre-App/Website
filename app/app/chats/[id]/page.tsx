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
  is_encrypted?: boolean;
  isEncrypted?: boolean;
  envelopes?: any[];
  sender_identity_key?: string;
  senderName?: string;
  senderAvatar?: string;
  senderBadges?: string[];
  attachments?: any[];
  isDeleted?: boolean;
  reply?: any;
}

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  const { user, chats, userStatuses } = useChatContext();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const tempIdCounter = useRef(0);

  const chat = chats.find(c => c.id?.toString() === chatId);

  // Get other participant for 1-on-1 chat
  const otherParticipant = chat?.participants?.find(
    (p: any) => p.id?.toString() !== user?.id?.toString()
  );

  const getChatName = () => {
    if (!chat) return 'Chat';
    if (chat.name) return chat.name;
    return otherParticipant?.username || 'Unknown';
  };

  // Load messages from API
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await ApiService.get(`/chat/${chatId}/messages?limit=50`);
        if (response.success && response.data?.messages) {
          const msgs = response.data.messages;
          setMessages(msgs);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
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

  // Listen for new messages via WebSocket
  useEffect(() => {
    const unsubscribe = WebSocketService.addMessageListener((wsMsg: any) => {
      if (wsMsg.type === 'new_message' && wsMsg.chatId?.toString() === chatId) {
        const newMsg: Message = {
          id: wsMsg.messageId || wsMsg.id,
          senderId: wsMsg.senderId,
          senderName: wsMsg.senderName,
          senderAvatar: wsMsg.senderAvatar,
          content: wsMsg.content,
          createdAt: wsMsg.createdAt || new Date().toISOString(),
          isEncrypted: wsMsg.isEncrypted,
          envelopes: wsMsg.envelopes,
          attachments: wsMsg.attachments || [],
        };
        
        setMessages(prev => {
          // Check if we already have this message (by temp ID or real ID)
          const exists = prev.some(m => 
            m.id.toString() === newMsg.id.toString() || 
            (wsMsg.tempId && m.id.toString() === wsMsg.tempId.toString())
          );
          if (exists) {
            // Replace temp message with real one
            return prev.map(m => 
              (wsMsg.tempId && m.id.toString() === wsMsg.tempId.toString()) ||
              m.id.toString() === newMsg.id.toString()
                ? newMsg 
                : m
            );
          }
          return [...prev, newMsg];
        });
      } else if (wsMsg.type === 'message_ack' && wsMsg.tempId) {
        // Update temp message with real ID
        setMessages(prev => prev.map(m => 
          m.id.toString() === wsMsg.tempId.toString()
            ? { ...m, id: wsMsg.messageId || m.id }
            : m
        ));
      }
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage('');

    // Create temp message
    tempIdCounter.current += 1;
    const tempId = `temp-${tempIdCounter.current}-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      senderId: user?.id,
      senderName: user?.username,
      senderAvatar: user?.profile_picture,
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    // Send via WebSocket only (no API endpoint for sending)
    const deviceId = await StorageService.getDeviceId();
    WebSocketService.sendMessage({ chatId, content, deviceId, tempId });
  };

  const isOwn = (msg: Message) => {
    const senderId = msg.sender_id || msg.senderId;
    return senderId?.toString() === user?.id?.toString();
  };

  const getSenderId = (msg: Message) => {
    return (msg.sender_id || msg.senderId)?.toString() || '';
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

  const getMessageContent = (msg: Message) => {
    // If message has content, show it
    if (msg.content && msg.content.trim()) {
      return msg.content;
    }
    
    // If encrypted and has envelopes, show encrypted indicator
    if ((msg.is_encrypted || msg.isEncrypted) && msg.envelopes?.length > 0) {
      return '🔒 Encrypted message';
    }
    
    // Check other possible content fields
    const possibleContent = msg.text || msg.message;
    if (possibleContent && possibleContent.trim()) {
      return possibleContent;
    }
    
    // If has attachments, show attachment indicator
    if (msg.attachments && msg.attachments.length > 0) {
      const attachmentCount = msg.attachments.length;
      return `📎 ${attachmentCount} attachment${attachmentCount > 1 ? 's' : ''}`;
    }
    
    return null;
  };

  // Get online status of other participant
  const getOtherUserStatus = () => {
    if (!otherParticipant) return null;
    return userStatuses[otherParticipant.id?.toString()];
  };

  const otherUserStatus = getOtherUserStatus();

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header */}
      <header className="fixed top-16 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => router.push('/app/chats')} className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="relative">
            <img 
              src={chat?.avatar_url || otherParticipant?.profile_picture || '/default-avatar.svg'} 
              alt={getChatName()} 
              className="w-10 h-10 rounded-full object-cover border border-white/10" 
            />
            {!chat?.is_group && otherUserStatus && (
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${
                otherUserStatus === 'online' ? 'bg-green-500' : 
                otherUserStatus === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
              }`} />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-white truncate">{getChatName()}</h1>
            <p className="text-xs text-white/60">
              {chat?.is_group 
                ? `${chat.participants?.length || 0} members`
                : otherUserStatus === 'online' 
                  ? 'Online'
                  : otherUserStatus === 'away'
                    ? 'Away'
                    : 'Offline'
              }
            </p>
          </div>
        </div>
      </header>

      {/* Messages */}
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
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-white/60">No messages yet</p>
              <p className="text-sm text-white/40 mt-1">Send a message to start the conversation</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const own = isOwn(msg);
              const prevMsg = i > 0 ? messages[i-1] : null;
              const showAvatar = !own && prevMsg && !isOwn(prevMsg);
              const content = getMessageContent(msg);
              const isDeleted = msg.isDeleted;
              
              return (
                <div key={msg.id} className={`flex ${own ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                  {!own && (
                    <div className="w-8">
                      {showAvatar && (
                        <img 
                          src={otherParticipant?.profile_picture || '/default-avatar.svg'} 
                          alt="" 
                          className="w-8 h-8 rounded-full" 
                        />
                      )}
                    </div>
                  )}
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                    own ? 'bg-blue-500 text-white rounded-br-md' : 'bg-white/10 text-white rounded-bl-md'
                  } ${isDeleted ? 'opacity-50' : ''}`}>
                    <p className="text-[15px] break-words">
                      {isDeleted ? (
                        <span className="italic text-white/50">Message deleted</span>
                      ) : content ? (
                        content
                      ) : (
                        <span className="italic text-white/50">(No content)</span>
                      )}
                    </p>
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

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-t border-white/10 px-4 py-3">
        <form onSubmit={handleSend} className="max-w-lg mx-auto flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()} 
            className={`p-3 rounded-full ${newMessage.trim() ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/40'}`}
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
