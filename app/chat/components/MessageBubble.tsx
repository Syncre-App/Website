'use client';

import type { ChatAttachment, ChatMessage } from '@/lib/types';
import { FiCheck, FiLock } from 'react-icons/fi';
import { BsCheck2All } from 'react-icons/bs';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showSender: boolean;
  canViewEncrypted: boolean;
  authToken?: string;
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

const normalizeContent = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') {
        if (typeof parsed.text === 'string' && parsed.text.trim()) {
          return parsed.text;
        }
        if (typeof parsed.preview === 'string' && parsed.preview.trim()) {
          return parsed.preview;
        }
      }
    } catch {
      return null;
    }
    return null;
  }
  return trimmed;
};

const AttachmentView = ({ attachment, authToken }: { attachment: ChatAttachment; authToken?: string }) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const href = attachment.publicDownloadUrl || attachment.downloadUrl || attachment.publicViewUrl;
  const mediaSrc = attachment.previewUrl || attachment.publicViewUrl || attachment.downloadUrl;

  useEffect(() => {
    let active = true;
    let revokeUrl: string | null = null;
    setError(null);

    const needsAuth = Boolean(authToken && href && /^https?:\/\//i.test(href));
    const fetchSrc = mediaSrc || href;

    if (needsAuth && fetchSrc) {
      fetch(fetchSrc, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const blob = await res.blob();
          if (!active) return;
          revokeUrl = URL.createObjectURL(blob);
          setObjectUrl(revokeUrl);
        })
        .catch((err) => {
          if (active) setError(err.message || 'Letöltési hiba');
        });
    } else {
      setObjectUrl(null);
    }

    return () => {
      active = false;
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [authToken, href, mediaSrc]);

  const viewHref = objectUrl || href;
  const viewSrc = objectUrl || mediaSrc;

  if (!viewHref) return null;

  if (attachment.isImage && viewSrc) {
    return (
      <a
        key={attachment.id}
        href={viewHref}
        target="_blank"
        rel="noreferrer"
        className="block overflow-hidden rounded-2xl border border-white/10 bg-black/20"
      >
        <div className="relative h-48 w-full">
          <Image
            src={viewSrc}
            alt={attachment.name}
            fill
            sizes="100vw"
            objectFit="cover"
            className="rounded-2xl transition hover:scale-[1.01]"
          />
        </div>
      </a>
    );
  }

  if (attachment.isVideo && viewSrc) {
    return (
      <div key={attachment.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
        <video src={viewSrc} controls className="max-h-72 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <a
      key={attachment.id}
      href={viewHref}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:border-blue-400 hover:text-white"
    >
      <span className="text-blue-200">{attachment.isImage ? '🖼️' : attachment.isVideo ? '🎬' : '📎'}</span>
      <span className="truncate">{attachment.name}</span>
      {error && <span className="text-[10px] text-red-200">({error})</span>}
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

export const MessageBubble = ({ message, isOwn, showSender, canViewEncrypted, authToken }: MessageBubbleProps) => {
  const timestamp = formatTime(message.createdAtLocal || message.createdAt);
  const attachments = message.attachments || [];
  const isEncrypted = Boolean(message.isEncrypted);
  const canShowSecret = !isEncrypted || canViewEncrypted;
  let displayContent: string | null = canShowSecret ? normalizeContent(message.content) : null;
  if (!displayContent && isEncrypted) {
    displayContent = normalizeContent(message.preview) || 'Titkosított üzenet';
  }
  if (message.isDeleted) {
    displayContent = message.deletedByName
      ? `${message.deletedByName} eltávolította ezt az üzenetet.`
      : 'Az üzenet törlésre került.';
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[78%] space-y-2 rounded-3xl px-5 py-3 shadow-[0_12px_36px_rgba(0,0,0,0.35)] ${
          isOwn
            ? 'rounded-br-xl bg-[#162442]/90 text-white border border-blue-400/30'
            : 'rounded-bl-xl bg-[#0f172a]/85 text-white/90 border border-white/5'
        }`}
      >
        {showSender && !isOwn && (
          <div className="flex items-center gap-2">
            {message.senderAvatar ? (
              <Image
                src={message.senderAvatar}
                alt={message.senderName || 'Feladó'}
                width={24}
                height={24}
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
        {!canShowSecret && isEncrypted && (
          <div className="flex items-center gap-2 text-xs text-blue-100/80">
            <FiLock /> Privát üzenet
          </div>
        )}
        {displayContent && (
          <p className={`whitespace-pre-line text-sm ${message.isDeleted ? 'italic text-white/60' : ''}`}>
            {displayContent}
          </p>
        )}
        {attachments.length > 0 && (
          <div className="flex flex-col gap-2">
            {attachments.map((attachment) => (
              <AttachmentView key={attachment.id} attachment={attachment} authToken={authToken} />
            ))}
          </div>
        )}
        <div className="mt-1 flex items-center justify-between text-[11px] text-white/60">
          <div className="flex items-center gap-2">
            {isOwn && message.seenBy && message.seenBy.length > 0 && (
              <div className="flex -space-x-2">
                {message.seenBy
                  .filter((viewer) => viewer.userId !== message.senderId)
                  .slice(0, 4)
                  .map((viewer) =>
                    viewer.avatarUrl ? (
                      <Image
                        key={viewer.userId}
                        src={viewer.avatarUrl}
                        alt={viewer.username || 'Látta'}
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full border border-white/20 object-cover"
                      />
                    ) : (
                      <span
                        key={viewer.userId}
                        className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[9px] uppercase"
                      >
                        {(viewer.username || 'L')[0]}
                      </span>
                    )
                  )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {timestamp}
            {isOwn && <StatusIcon status={message.status} />}
          </div>
        </div>
      </div>
    </div>
  );
};
