'use client';

interface ConnectionBadgeProps {
  connected: boolean;
}

export const ConnectionBadge = ({ connected }: ConnectionBadgeProps) => {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
        connected ? 'bg-emerald-500/10 text-emerald-200' : 'bg-red-500/10 text-red-200'
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-300' : 'bg-red-300'} shadow-sm`}
      />
      {connected ? 'Online kapcsolat' : 'Nincs kapcsolat'}
    </span>
  );
};
