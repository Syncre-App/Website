'use client';

import type { ChatAttachment, ChatMessage } from '@/lib/types';
import { FiCheck, FiLock } from 'react-icons/fi';
import { BsCheck2All } from 'react-icons/bs';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showSender: boolean;
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

export const MessageBubble = ({ message, isOwn, showSender }: MessageBubbleProps) => {
  const timestamp = formatTime(message.createdAtLocal || message.createdAt);
  const attachments = message.attachments || [];
  const isEncrypted = message.isEncrypted && !message.content;
  let displayContent: string | null = message.content;
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
        {showSender && !isOwn && message.senderName && (
          <p className="text-xs font-semibold text-blue-200">{message.senderName}</p>
        )}
        {message.reply && (
          <div className="rounded-2xl bg-black/10 px-3 py-2 text-xs text-white/70">
            <p className="font-semibold">{message.reply.senderLabel || 'Válasz'}</p>
            <p className="line-clamp-2 text-white/60">{message.reply.preview || 'Üzenet megnyitása a mobil appban'}</p>
          </div>
        )}
        {isEncrypted && (
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
