'use client';

interface TypingIndicatorProps {
  users: string[];
}

export const TypingIndicator = ({ users }: TypingIndicatorProps) => {
  if (!users.length) return null;
  const label =
    users.length === 1
      ? `${users[0]} éppen gépel...`
      : `${users.slice(0, 2).join(', ')} ${users.length > 2 ? `+${users.length - 2} fő ` : ''}éppen gépel...`;
  return (
    <div className="mt-2 text-xs text-blue-200 flex items-center gap-2">
      <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-blue-300" />
      {label}
    </div>
  );
};
