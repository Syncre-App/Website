// WebSocketService.ts - Real-time messaging
export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export type UserStatus = Record<string, 'online' | 'offline' | 'away'>;

class WebSocketServiceClass {
  private ws: WebSocket | null = null;
  private messageListeners: ((message: WebSocketMessage) => void)[] = [];
  private statusListeners: ((statuses: UserStatus) => void)[] = [];
  private userStatuses: UserStatus = {};

  private WS_URL = 'wss://api.syncre.xyz/ws';

  private static instance: WebSocketServiceClass;
  static getInstance(): WebSocketServiceClass {
    if (!WebSocketServiceClass.instance) {
      WebSocketServiceClass.instance = new WebSocketServiceClass();
    }
    return WebSocketServiceClass.instance;
  }

  async connect(): Promise<void> {
    const token = localStorage.getItem('syncre_auth_token');
    if (!token) return;

    this.ws = new WebSocket(this.WS_URL);

    this.ws.onopen = () => {
      this.send({ type: 'auth', token });
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    if (message.type === 'friend_status_change' && message.userId) {
      this.userStatuses[message.userId] = message.status;
      this.statusListeners.forEach(listener => listener({ ...this.userStatuses }));
    }
    this.messageListeners.forEach(listener => listener(message));
  }

  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  joinChat(chatId: string, deviceId: string): void {
    this.send({ type: 'chat_join', chatId, deviceId });
  }

  leaveChat(chatId: string): void {
    this.send({ type: 'chat_leave', chatId });
  }

  sendMessage(data: { chatId: string; content?: string; deviceId: string; tempId?: string }): void {
    this.send({ type: 'message_send', ...data });
  }

  sendEncryptedMessage(data: { 
    chatId: string; 
    content?: string; 
    deviceId: string; 
    tempId?: string;
    envelopes: any[];
  }): void {
    this.send({ 
      type: 'message_send', 
      chatId: data.chatId,
      content: data.content,
      deviceId: data.deviceId,
      tempId: data.tempId,
      envelopes: data.envelopes,
      isEncrypted: true
    });
  }

  sendTyping(chatId: string): void {
    this.send({ type: 'typing', chatId });
  }

  addMessageListener(listener: (message: WebSocketMessage) => void): () => void {
    this.messageListeners.push(listener);
    return () => {
      const index = this.messageListeners.indexOf(listener);
      if (index > -1) this.messageListeners.splice(index, 1);
    };
  }

  addStatusListener(listener: (statuses: UserStatus) => void): () => void {
    this.statusListeners.push(listener);
    return () => {
      const index = this.statusListeners.indexOf(listener);
      if (index > -1) this.statusListeners.splice(index, 1);
    };
  }

  getUserStatuses(): UserStatus {
    return { ...this.userStatuses };
  }
}

export const WebSocketService = WebSocketServiceClass.getInstance();
