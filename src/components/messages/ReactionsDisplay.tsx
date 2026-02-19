'use client';

import type { MessageReaction } from '@/types';

interface ReactionsDisplayProps {
  reactions: MessageReaction[];
  currentUserId: string;
  onToggleReaction: (emoji: string) => void;
}

/** Groups reactions by emoji and shows counts */
export function ReactionsDisplay({ reactions, currentUserId, onToggleReaction }: ReactionsDisplayProps) {
  if (!reactions.length) return null;

  // Group by emoji
  const grouped = reactions.reduce<Record<string, { count: number; userReacted: boolean; usernames: string[] }>>((acc, r) => {
    if (!acc[r.emoji]) {
      acc[r.emoji] = { count: 0, userReacted: false, usernames: [] };
    }
    acc[r.emoji].count += 1;
    acc[r.emoji].usernames.push(r.username);
    if (r.userId === currentUserId) acc[r.emoji].userReacted = true;
    return acc;
  }, {});

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(grouped).map(([emoji, data]) => (
        <button
          key={emoji}
          onClick={() => onToggleReaction(emoji)}
          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-colors ${
            data.userReacted
              ? 'bg-purple-500/30 border border-purple-400/40'
              : 'glass border border-white/5 hover:bg-white/10'
          }`}
          title={data.usernames.join(', ')}
        >
          <span>{emoji}</span>
          <span className="text-white/60">{data.count}</span>
        </button>
      ))}
    </div>
  );
}
