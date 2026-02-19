'use client';

import { useState, useCallback } from 'react';

interface MapEmojiReactionsProps {
  onReact: (reaction: string, targetUserId: string) => void;
  targetUserId: string;
  targetUsername: string;
}

const REACTIONS = [
  { id: 'wave', emoji: '👋', label: 'Wave' },
  { id: 'heart', emoji: '❤️', label: 'Love' },
  { id: 'on_my_way', emoji: '🏃', label: 'On my way' },
  { id: 'check_in', emoji: '📍', label: 'Check in' },
  { id: 'thumbs_up', emoji: '👍', label: 'Thumbs up' },
  { id: 'fire', emoji: '🔥', label: 'Fire' },
];

export function MapEmojiReactions({ onReact, targetUserId, targetUsername }: MapEmojiReactionsProps) {
  const [sentReaction, setSentReaction] = useState<string | null>(null);

  const handleReact = useCallback((reactionId: string) => {
    onReact(reactionId, targetUserId);
    setSentReaction(reactionId);
    setTimeout(() => setSentReaction(null), 2000);
  }, [onReact, targetUserId]);

  return (
    <div className="glass-card rounded-xl p-3 max-w-xs">
      <p className="text-white/60 text-xs mb-2">React to {targetUsername}</p>
      <div className="flex gap-2">
        {REACTIONS.map(r => (
          <button
            key={r.id}
            onClick={() => handleReact(r.id)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl transition-all ${
              sentReaction === r.id
                ? 'bg-purple-500/30 scale-125'
                : 'hover:bg-white/10 active:scale-90'
            }`}
            title={r.label}
          >
            {r.emoji}
          </button>
        ))}
      </div>
      {sentReaction && (
        <p className="text-purple-400 text-xs mt-1 text-center animate-pulse">
          {REACTIONS.find(r => r.id === sentReaction)?.label} sent!
        </p>
      )}
    </div>
  );
}
