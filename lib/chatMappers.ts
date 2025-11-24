import { API_BASE_URL } from './apiClient';
import type {
  ChatAttachment,
  ChatMessage,
  ChatSummary,
  EnvelopeEntry,
  PresenceStatus,
  SeenReceipt,
  UserProfile,
} from './types';

const API_ROOT = API_BASE_URL.replace(/\/v1\/?$/i, '');

type LooseRecord = Record<string, unknown>;

const toRecord = (input: unknown): LooseRecord =>
  typeof input === 'object' && input !== null ? (input as LooseRecord) : {};

const toValueString = (value: unknown): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'bigint' || typeof value === 'boolean') {
    return value.toString();
  }
  if (typeof value === 'object' && 'toString' in value && typeof value.toString === 'function') {
    return value.toString();
  }
  return '';
};

const toNumberValue = (value: unknown): number => {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const toArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const parseUserJson = (value: unknown): string[] => {
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((entry) => toValueString(entry)).filter(Boolean);
    }
  } catch {
    return [];
  }
  return [];
};

const toAbsoluteUrl = (value?: string | null) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  const normalized = value.startsWith('/') ? value : `/${value}`;
  return `${API_ROOT}${normalized}`;
};

const mapUser = (input: unknown): UserProfile => {
  const raw = toRecord(input);
  const primaryId = toValueString(raw.id);
  const fallbackId = toValueString(raw.userId);
  const avatar =
    typeof raw.profile_picture === 'string'
      ? raw.profile_picture
      : typeof raw.avatarUrl === 'string'
      ? raw.avatarUrl
      : null;

  return {
    id: primaryId || fallbackId || 'user',
    username:
      typeof raw.username === 'string'
        ? raw.username
        : typeof raw.name === 'string'
        ? raw.name
        : 'User',
    email: typeof raw.email === 'string' ? raw.email : undefined,
    profile_picture: toAbsoluteUrl(avatar),
    profilePicture: toAbsoluteUrl(avatar),
    status: typeof raw.status === 'string' ? (raw.status as PresenceStatus) : null,
  };
};

export const mapChatSummary = (input: unknown): ChatSummary => {
  const raw = toRecord(input);
  const participantEntries = toArray(raw.participants);
  const participants = participantEntries.map((participant) => mapUser(participant));
  let users: string[] = [];
  if (Array.isArray(raw.userIds)) {
    users = raw.userIds.map((id) => toValueString(id)).filter(Boolean);
  } else {
    users = parseUserJson(raw.users);
  }

  const avatar =
    typeof raw.avatarUrl === 'string'
      ? raw.avatarUrl
      : typeof raw.avatar_url === 'string'
      ? raw.avatar_url
      : null;

  const createdAt =
    typeof raw.created_at === 'string'
      ? raw.created_at
      : typeof raw.createdAt === 'string'
      ? raw.createdAt
      : null;
  const updatedAt =
    typeof raw.updated_at === 'string'
      ? raw.updated_at
      : typeof raw.updatedAt === 'string'
      ? raw.updatedAt
      : null;

  return {
    id: toValueString(raw.id) || '0',
    users,
    participants,
    participantCount: typeof raw.participantCount === 'number' ? raw.participantCount : participants.length,
    isGroup: Boolean(raw.isGroup ?? raw.is_group),
    ownerId: toValueString(raw.ownerId ?? raw.owner_id) || null,
    name: typeof raw.name === 'string' ? raw.name : null,
    displayName: typeof raw.displayName === 'string' ? raw.displayName : null,
    avatarUrl: toAbsoluteUrl(avatar),
    createdAt,
    updatedAt,
  };
};

const normalizeTimestamp = (value?: unknown) => {
  if (!value) return null;
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || value instanceof Date) {
    try {
      return new Date(value).toISOString();
    } catch {
      return null;
    }
  }
  return null;
};

const mapAttachment = (input: unknown): ChatAttachment => {
  const raw = toRecord(input);
  return {
    id: toValueString(raw.id) || 'attachment',
    name: typeof raw.name === 'string' ? raw.name : typeof raw.fileName === 'string' ? raw.fileName : 'Attachment',
    mimeType: typeof raw.mimeType === 'string' ? raw.mimeType : 'application/octet-stream',
    fileSize: toNumberValue(raw.fileSize),
    status: (typeof raw.status === 'string' ? raw.status : 'active') as ChatAttachment['status'],
    isImage: Boolean(raw.isImage),
    isVideo: Boolean(raw.isVideo),
    previewUrl: toAbsoluteUrl(
      typeof raw.previewPath === 'string' ? raw.previewPath : (typeof raw.publicViewPath === 'string' ? raw.publicViewPath : null)
    ),
    downloadUrl: toAbsoluteUrl(typeof raw.downloadPath === 'string' ? raw.downloadPath : null),
    publicViewUrl: toAbsoluteUrl(typeof raw.publicViewPath === 'string' ? raw.publicViewPath : null),
    publicDownloadUrl: toAbsoluteUrl(typeof raw.publicDownloadPath === 'string' ? raw.publicDownloadPath : null),
  };
};

const mapAttachments = (raw?: unknown): ChatAttachment[] => {
  if (!raw) return [];
  return toArray(raw).map((entry) => mapAttachment(entry));
};

const mapSeenReceipts = (raw?: unknown): SeenReceipt[] => {
  return toArray(raw)
    .map((entry) => {
      const record = toRecord(entry);
      const identifier = record.userId ?? record.viewerId ?? record.id;
      const userId = toValueString(identifier);
      if (!userId) {
        return null;
      }
      const username =
        typeof record.username === 'string'
          ? record.username
          : typeof record.viewerUsername === 'string'
          ? record.viewerUsername
          : null;
      const avatar =
        typeof record.avatarUrl === 'string'
          ? record.avatarUrl
          : typeof record.viewerAvatar === 'string'
          ? record.viewerAvatar
          : null;
      const seenAt = normalizeTimestamp(record.seenAt ?? record.timestamp);
      return {
        userId,
        username,
        avatarUrl: avatar,
        seenAt,
      };
    })
    .filter(Boolean) as SeenReceipt[];
};

const parseEnvelopes = (raw?: unknown): EnvelopeEntry[] => {
  if (!raw) return [];
  let source: unknown = raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      source = parsed.envelopes ?? parsed;
    } catch {
      source = null;
    }
  }
  const array = toArray((source as { envelopes?: unknown[] })?.envelopes ?? source);
  return array
    .map((entry) => {
      const record = toRecord(entry);
      const recipientId = toValueString(record.recipientId ?? record.recipient_id);
      const payload = toValueString(record.payload);
      const nonce = toValueString(record.nonce);
      if (!recipientId || !payload || !nonce) return null;
      return {
        recipientId,
        recipientDevice:
          typeof record.recipientDevice === 'string'
            ? record.recipientDevice
            : typeof record.recipient_device === 'string'
            ? record.recipient_device
            : null,
        payload,
        nonce,
        keyVersion: Number(record.keyVersion ?? record.key_version) || undefined,
        alg: typeof record.alg === 'string' ? record.alg : undefined,
        senderIdentityKey:
          typeof record.senderIdentityKey === 'string'
            ? record.senderIdentityKey
            : typeof record.sender_identity_key === 'string'
            ? record.sender_identity_key
            : undefined,
        senderDeviceId:
          typeof record.senderDeviceId === 'string'
            ? record.senderDeviceId
            : typeof record.sender_device_id === 'string'
            ? record.sender_device_id
            : undefined,
        version: Number(record.version) || undefined,
      };
    })
    .filter(Boolean) as EnvelopeEntry[];
};

export const mapServerMessage = (input: unknown): ChatMessage => {
  const raw = toRecord(input);
  const chatId = raw.chatId ?? raw.chat_id;
  const senderId = raw.senderId ?? raw.sender_id;
  const hasEnvelopes =
    Array.isArray(raw.envelopes) ||
    Boolean((typeof raw.envelope === 'string' && raw.envelope.includes('recipientId')) || raw.envelope);
  const isEncrypted =
    Boolean(raw.isEncrypted ?? raw.is_encrypted) ||
    hasEnvelopes ||
    raw.message_type === 'e2ee' ||
    raw.messageType === 'e2ee' ||
    raw.type === 'message_envelope' ||
    raw.type === 'message_envelope_sent';
  const content = !isEncrypted
    ? (typeof raw.content === 'string' ? raw.content : '')
    : typeof raw.preview === 'string'
    ? raw.preview
    : null;

  const replySource = raw.reply ?? raw.replyMetadata;
  const replyRecord = toRecord(replySource);
  const hasReply = Object.keys(replyRecord).length > 0;
  const reply = hasReply
    ? {
        messageId: toValueString(replyRecord.messageId ?? replyRecord.reply_to_message_id) || undefined,
        senderId: toValueString(replyRecord.senderId ?? replyRecord.reply_to_sender_id) || undefined,
        preview: typeof replyRecord.preview === 'string' ? replyRecord.preview : undefined,
        senderLabel:
          typeof replyRecord.senderLabel === 'string'
            ? replyRecord.senderLabel
            : typeof replyRecord.reply_sender_label === 'string'
            ? replyRecord.reply_sender_label
            : undefined,
      }
    : null;

  const createdAtValue =
    typeof raw.createdAt === 'string'
      ? raw.createdAt
      : typeof raw.created_at === 'string'
      ? raw.created_at
      : new Date().toISOString();
  const createdAtLocal =
    typeof raw.createdAtLocal === 'string'
      ? raw.createdAtLocal
      : typeof raw.created_at_local === 'string'
      ? raw.created_at_local
      : null;

  const senderName =
    typeof raw.senderName === 'string'
      ? raw.senderName
      : typeof raw.sender_username === 'string'
      ? raw.sender_username
      : typeof raw.senderUsername === 'string'
      ? raw.senderUsername
      : null;

  const senderAvatar =
    typeof raw.senderAvatar === 'string'
      ? raw.senderAvatar
      : typeof raw.sender_avatar === 'string'
      ? raw.sender_avatar
      : typeof raw.senderAvatarUrl === 'string'
      ? raw.senderAvatarUrl
      : null;

  return {
    id:
      toValueString(raw.id) ||
      toValueString(raw.messageId) ||
      `${toValueString(chatId)}-${createdAtValue}`,
    chatId: toValueString(chatId) || '0',
    senderId: toValueString(senderId) || '',
    senderName,
    senderAvatar: toAbsoluteUrl(senderAvatar),
    senderDeviceId:
      typeof raw.senderDeviceId === 'string'
        ? raw.senderDeviceId
        : typeof raw.sender_device_id === 'string'
        ? raw.sender_device_id
        : null,
    content,
    preview: typeof raw.preview === 'string' ? raw.preview : null,
    messageType:
      typeof raw.messageType === 'string'
        ? raw.messageType
        : toValueString(raw.message_type) || 'text',
    createdAt: createdAtValue,
    createdAtLocal,
    deliveredAt: normalizeTimestamp(raw.deliveredAt ?? raw.delivered_at),
    seenAt: normalizeTimestamp(raw.seenAt ?? raw.seen_at),
    isEncrypted,
    reply,
    attachments: mapAttachments(raw.attachments),
    isDeleted: Boolean(raw.isDeleted ?? raw.is_deleted),
    deletedAt: normalizeTimestamp(raw.deletedAt ?? raw.deleted_at),
    deletedByName:
      typeof raw.deletedByName === 'string'
        ? raw.deletedByName
        : typeof raw.deleted_by_name === 'string'
        ? raw.deleted_by_name
        : null,
    editedAt: normalizeTimestamp(raw.editedAt ?? raw.edited_at),
    seenBy: mapSeenReceipts(raw.seenBy),
    timezone: typeof raw.timezone === 'string' ? raw.timezone : null,
    envelopes: parseEnvelopes(raw.envelopes ?? raw.envelope),
  };
};
