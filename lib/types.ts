export type PresenceStatus = 'online' | 'offline' | 'away' | 'unknown';

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  profile_picture?: string | null;
  profilePicture?: string | null;
  status?: PresenceStatus | null;
}

export interface SeenReceipt {
  userId: string;
  username?: string | null;
  avatarUrl?: string | null;
  seenAt?: string | null;
}

export interface ChatAttachment {
  id: string;
  name: string;
  mimeType: string;
  fileSize: number;
  status: 'pending' | 'active' | 'expired';
  isImage: boolean;
  isVideo: boolean;
  previewUrl?: string | null;
  downloadUrl?: string | null;
  publicViewUrl?: string | null;
  publicDownloadUrl?: string | null;
}

export interface EnvelopeEntry {
  recipientId: string;
  recipientDevice?: string | null;
  payload: string;
  nonce: string;
  keyVersion?: number;
  alg?: string;
  senderIdentityKey?: string | null;
  senderDeviceId?: string | null;
  version?: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName?: string | null;
  senderAvatar?: string | null;
  senderDeviceId?: string | null;
  content: string | null;
  messageType: string;
  createdAt: string;
  createdAtLocal?: string | null;
  deliveredAt?: string | null;
  seenAt?: string | null;
  status?: 'sending' | 'sent' | 'delivered' | 'seen';
  isEncrypted?: boolean;
  preview?: string | null;
  reply?: {
    messageId?: string | null;
    senderId?: string | null;
    preview?: string | null;
    senderLabel?: string | null;
  } | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedByName?: string | null;
  editedAt?: string | null;
  attachments?: ChatAttachment[];
  seenBy?: SeenReceipt[];
  timezone?: string | null;
  pendingId?: string;
  envelopes?: EnvelopeEntry[];
}

export interface ChatSummary {
  id: string;
  users: string[];
  participants: UserProfile[];
  participantCount: number;
  isGroup: boolean;
  ownerId?: string | null;
  name?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  data?: T;
  error?: string;
}

export interface WebSocketPacket {
  type: string;
  chatId?: string | number;
  messageId?: string | number;
  status?: string;
  userId?: string | number;
  username?: string;
  [key: string]: unknown;
}
