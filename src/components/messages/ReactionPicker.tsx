'use client';

import { useState } from 'react';
import { QUICK_REACTIONS, EmojiPicker } from './EmojiPicker';

interface ReactionPickerProps {
  onReact: (emoji: string) => void;
  onReply: () => void;
  onDelete?: () => void;
  position: 'left' | 'right';
  onClose: () => void;
}

/**
 * Long-press / right-click reaction picker with quick emojis
 * and a "+" button that opens the full emoji picker.
 */
export function ReactionPicker({ onReact, onReply, onDelete, position, onClose }: ReactionPickerProps) {
  const [showFullPicker, setShowFullPicker] = useState(false);

  const handleReact = (emoji: string) => {
    onReact(emoji);
    onClose();
  };

  if (showFullPicker) {
    return (
      <div className={`absolute bottom-full mb-1 z-50 ${position === 'right' ? 'right-0' : 'left-0'}`}>
        <EmojiPicker
          onSelect={(emoji) => { handleReact(emoji); }}
          onClose={() => { setShowFullPicker(false); onClose(); }}
        />
      </div>
    );
  }

  return (
    <div
      className={`absolute bottom-full mb-1 flex items-center gap-0.5 glass-heavy rounded-full px-1.5 py-1 border border-white/10 shadow-xl z-50 ${
        position === 'right' ? 'right-0' : 'left-0'
      }`}
    >
      {QUICK_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleReact(emoji)}
          className="w-7 h-7 flex items-center justify-center text-sm hover:bg-white/10 rounded-full transition-transform hover:scale-125"
        >
          {emoji}
        </button>
      ))}

      {/* Plus button for full emoji picker */}
      <button
        onClick={() => setShowFullPicker(true)}
        className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-full"
        title="More emojis"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <div className="w-px h-5 bg-white/10 mx-0.5" />

      <button
        onClick={() => { onReply(); onClose(); }}
        className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-full"
        title="Reply"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </button>

      {onDelete && (
        <button
          onClick={() => { onDelete(); onClose(); }}
          className="w-7 h-7 flex items-center justify-center text-red-400/60 hover:text-red-400 hover:bg-white/10 rounded-full"
          title="Delete"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
