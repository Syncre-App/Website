'use client';

import { FormEvent, useState } from 'react';

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
      className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl"
    >
      <textarea
        value={value}
        disabled={disabled}
        onChange={(event) => {
          setValue(event.target.value);
          onTyping?.();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Írj egy üzenetet..."
        rows={3}
        className="w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/50"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-800/50"
        >
          Küldés
        </button>
      </div>
    </form>
  );
};
