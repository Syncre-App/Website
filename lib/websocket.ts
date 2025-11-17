import { TimezoneService } from './timezone';
import type { WebSocketPacket } from './types';

type MessageListener = (payload: WebSocketPacket) => void;
type StatusListener = (connected: boolean) => void;
type SocketPayload = Record<string, unknown>;

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.syncre.xyz/ws';

export class SyncreWebSocket {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private connected = false;
  private listeners = new Set<MessageListener>();
  private statusListeners = new Set<StatusListener>();
  private pendingPayloads: SocketPayload[] = [];
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private joinedChats = new Set<string>();
  private isAuthPending = false;

  connect(token: string) {
    this.token = token;
    if (typeof window === 'undefined') {
      return;
    }
    if (this.ws) {
      this.ws.close();
    }
    this.open();
  }

  disconnect() {
    this.clearReconnect();
    this.joinedChats.clear();
    this.token = null;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setConnected(false);
  }

  private open() {
    if (!this.token || typeof window === 'undefined') {
      return;
    }
    try {
      this.ws = new WebSocket(WS_URL);
    } catch (error) {
      console.error('WebSocket connect failed', error);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.setConnected(true);
      this.reconnectAttempts = 0;
      this.isAuthPending = true;
      const authPayload = this.withTimezone({
        type: 'auth',
        token: this.token,
      });
      this.safeSend(authPayload);
      this.flushPending();
      this.joinedChats.forEach((chatId) => {
        this.send({ type: 'chat_join', chatId });
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as WebSocketPacket;
        if (payload.type === 'auth_success') {
          this.handleAuthSuccess();
        }
        this.listeners.forEach((listener) => listener(payload));
      } catch (error) {
        console.warn('WebSocket message parse failed', error);
      }
    };

    this.ws.onclose = () => {
      this.setConnected(false);
      this.scheduleReconnect();
    };

    this.ws.onerror = (error) => {
      console.warn('WebSocket error', error);
      this.setConnected(false);
    };
  }

  private setConnected(state: boolean) {
    const changed = this.connected !== state;
    this.connected = state;
    if (changed) {
      this.statusListeners.forEach((listener) => listener(state));
    }
  }

  private scheduleReconnect() {
    if (!this.token) {
      return;
    }
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }
    this.reconnectAttempts += 1;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
    this.clearReconnect();
    this.reconnectTimeout = setTimeout(() => {
      this.open();
    }, delay);
  }

  private clearReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private flushPending() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || this.isAuthPending) {
      return;
    }
    while (this.pendingPayloads.length) {
      const payload = this.pendingPayloads.shift();
      if (payload) {
        this.safeSend(payload);
      }
    }
  }

  private safeSend(payload: SocketPayload) {
    try {
      this.ws?.send(JSON.stringify(payload));
    } catch (error) {
      console.warn('WebSocket send failed', error, payload);
    }
  }

  send(payload: SocketPayload) {
    const enriched = this.withTimezone(payload);
    if (this.ws && this.ws.readyState === WebSocket.OPEN && !this.isAuthPending) {
      this.safeSend(enriched);
      return;
    }
    this.pendingPayloads.push(enriched);
  }

  private withTimezone(payload: SocketPayload): SocketPayload {
    if (payload && typeof payload === 'object' && !('timezone' in payload)) {
      return { ...payload, timezone: TimezoneService.getTimezone() };
    }
    return payload;
  }

  private handleAuthSuccess() {
    this.isAuthPending = false;
    this.flushPending();
    this.joinedChats.forEach((chatId) => {
      this.send({ type: 'chat_join', chatId });
    });
  }

  joinChat(chatId: string) {
    if (!chatId) return;
    this.joinedChats.add(chatId);
    this.send({ type: 'chat_join', chatId });
  }

  leaveChat(chatId: string) {
    if (!chatId) return;
    this.joinedChats.delete(chatId);
    this.send({ type: 'chat_leave', chatId });
  }

  sendChatMessage(
    chatId: string,
    content: string,
    extras?: { messageType?: string; reply?: Record<string, unknown>; attachments?: string[] }
  ) {
    if (!chatId || !content) return;
    this.send({
      type: 'chat_message',
      chatId,
      content,
      message_type: extras?.messageType ?? 'text',
      replyMetadata: extras?.reply,
      attachments: extras?.attachments,
    });
  }

  sendTyping(chatId: string) {
    if (!chatId) return;
    this.send({ type: 'typing', chatId });
  }

  sendStopTyping(chatId: string) {
    if (!chatId) return;
    this.send({ type: 'stop-typing', chatId });
  }

  markMessageSeen(chatId: string, messageId: string) {
    if (!chatId || !messageId) return;
    this.send({ type: 'message_seen', chatId, messageId });
  }

  onMessage(listener: MessageListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  onStatus(listener: StatusListener) {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }
}

export const webSocketClient = new SyncreWebSocket();
