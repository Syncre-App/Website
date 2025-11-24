'use client';

import { FormEvent, useState } from 'react';
import { FiPlus, FiSend, FiSmile } from 'react-icons/fi';

interface MessageComposerProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  onTyping?: () => void;
  onStopTyping?: () => void;
}

export const MessageComposer = ({ onSend, disabled, onTyping, onStopTyping }: MessageComposerProps) => {
  const [value, setValue] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
    onStopTyping?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const trimmed = value.trim();
      if (!trimmed) return;
      onSend(trimmed);
      setValue('');
      onStopTyping?.();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
    >
      <button
        type="button"
        disabled={disabled}
        className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-white/70 transition hover:bg-white/10 disabled:opacity-50"
      >
        <FiPlus />
      </button>
      <textarea
        value={value}
        disabled={disabled}
        onChange={(event) => {
          setValue(event.target.value);
          onTyping?.();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Írj egy üzenetet..."
        rows={1}
        className="flex-1 resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/50"
      />
      <button
        type="button"
        disabled={disabled}
        className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-white/70 transition hover:bg-white/10 disabled:opacity-50"
      >
        <FiSmile />
      </button>
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="flex h-10 min-w-[56px] items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 px-4 text-sm font-semibold text-white transition hover:from-blue-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiSend />
      </button>
    </form>
  );
};
