'use client';

import { useState } from 'react';

interface StoryReactionBarProps {
  onReact: (emoji: string) => void;
  onReply: (message: string) => void;
  onDMReply?: () => void;
}

const quickEmojis = ['❤️', '😂', '😮', '😢', '🔥', '👏'];

export function StoryReactionBar({ onReact, onReply, onDMReply }: StoryReactionBarProps) {
  const [reply, setReply] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmitReply = () => {
    if (reply.trim()) {
      onReply(reply.trim());
      setReply('');
      setSent(true);
      setTimeout(() => setSent(false), 2000);
    }
  };

  return (
    <div className="px-4 pb-4 space-y-3">
      {sent && (
        <div className="text-center text-xs text-green-400 animate-pulse">Reply sent!</div>
      )}
      <div className="flex justify-center gap-4">
        {quickEmojis.map(emoji => (
          <button
            key={emoji}
            onClick={() => onReact(emoji)}
            className="text-2xl hover:scale-125 transition-transform active:scale-90"
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={reply}
          onChange={e => setReply(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmitReply()}
          placeholder="Reply to story..."
          className="flex-1 bg-white/10 text-white placeholder:text-white/40 rounded-full px-4 py-2 text-sm outline-none border border-white/10 focus:border-white/30"
        />
        {reply.trim() ? (
          <button
            onClick={handleSubmitReply}
            className="w-9 h-9 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center shrink-0"
          >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        ) : onDMReply ? (
          <button
            onClick={onDMReply}
            title="Open DM with creator"
            className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center shrink-0 transition-colors"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}
