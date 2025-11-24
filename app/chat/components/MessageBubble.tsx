'use client';

import type { ChatAttachment, ChatMessage } from '@/lib/types';
import { FiCheck, FiLock } from 'react-icons/fi';
import { BsCheck2All } from 'react-icons/bs';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showSender: boolean;
  canViewEncrypted: boolean;
}

const formatTime = (value?: string | null) => {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('hu-HU', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return '';
  }
};

const renderAttachment = (attachment: ChatAttachment) => {
  const href = attachment.publicDownloadUrl || attachment.downloadUrl || attachment.publicViewUrl;
  if (!href) return null;
  const mediaSrc = attachment.previewUrl || attachment.publicViewUrl || attachment.downloadUrl;
  if (attachment.isImage && mediaSrc) {
    return (
      <a
        key={attachment.id}
        href={href}
        target="_blank"
        rel="noreferrer"
        className="block overflow-hidden rounded-2xl border border-white/10 bg-black/20"
      >
        <img
          src={mediaSrc}
          alt={attachment.name}
          className="max-h-72 w-full object-cover transition hover:scale-[1.01]"
        />
      </a>
    );
  }
  if (attachment.isVideo && mediaSrc) {
    return (
      <div key={attachment.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
        <video src={mediaSrc} controls className="max-h-72 w-full rounded-2xl" />
      </div>
    );
  }
  return (
    <a
      key={attachment.id}
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:border-blue-400 hover:text-white"
    >
      <span className="text-blue-200">{attachment.isImage ? '🖼️' : attachment.isVideo ? '🎬' : '📎'}</span>
      <span className="truncate">{attachment.name}</span>
    </a>
  );
};

const StatusIcon = ({ status }: { status?: ChatMessage['status'] }) => {
  if (status === 'seen') {
    return <BsCheck2All className="text-emerald-300" />;
  }
  if (status === 'delivered') {
    return <BsCheck2All className="text-white/60" />;
  }
  if (status === 'sent') {
    return <FiCheck className="text-white/60" />;
  }
  if (status === 'sending') {
    return <span className="text-xs text-white/60">...</span>;
  }
  return null;
};

export const MessageBubble = ({ message, isOwn, showSender, canViewEncrypted }: MessageBubbleProps) => {
  const timestamp = formatTime(message.createdAtLocal || message.createdAt);
  const attachments = message.attachments || [];
  const isEncrypted = Boolean(message.isEncrypted);
  const canShowSecret = !isEncrypted || canViewEncrypted;
  let displayContent: string | null = canShowSecret ? message.content : null;
  if (!displayContent && isEncrypted) {
    displayContent = message.preview || 'Titkosított üzenet';
  }
  if (message.isDeleted) {
    displayContent = message.deletedByName
      ? `${message.deletedByName} eltávolította ezt az üzenetet.`
      : 'Az üzenet törlésre került.';
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[78%] space-y-2 rounded-3xl px-5 py-3 shadow-lg ${
          isOwn
            ? 'rounded-br-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
            : 'rounded-bl-md border border-white/10 bg-white/5 text-white/90'
        }`}
      >
        {showSender && !isOwn && (
          <div className="flex items-center gap-2">
            {message.senderAvatar ? (
              <img
                src={message.senderAvatar}
                alt={message.senderName || 'Feladó'}
                className="h-6 w-6 rounded-full object-cover border border-white/20"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/40 text-[11px] font-semibold text-white">
                {(message.senderName || 'N')[0]}
              </div>
            )}
            {message.senderName && <p className="text-xs font-semibold text-blue-200">{message.senderName}</p>}
          </div>
        )}
        {message.reply && canShowSecret && (
          <div className="rounded-2xl bg-black/10 px-3 py-2 text-xs text-white/70">
            <p className="font-semibold">{message.reply.senderLabel || 'Válasz'}</p>
            <p className="line-clamp-2 text-white/60">{message.reply.preview || 'Üzenet megnyitása a mobil appban'}</p>
          </div>
        )}
        {isEncrypted && !canShowSecret && (
          <div className="flex items-center gap-2 text-xs text-blue-100">
            <FiLock /> Titkosított üzenet
          </div>
        )}
        {isEncrypted && canShowSecret && (
          <div className="flex items-center gap-2 text-xs text-blue-100">
            <FiLock /> Titkosított üzenet
          </div>
        )}
        {displayContent && (
          <p className={`whitespace-pre-line text-sm ${message.isDeleted ? 'italic text-white/60' : ''}`}>
            {displayContent}
          </p>
        )}
        {attachments.length > 0 && (
          <div className="flex flex-col gap-2">
            {attachments.map((attachment) => renderAttachment(attachment))}
          </div>
        )}
        <div className="flex items-center justify-end gap-2 text-[11px] text-white/60">
          {timestamp}
          {isOwn && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
};
