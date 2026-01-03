'use client';

import { useState } from 'react';

export interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface StickerPanelProps {
  stickers: Sticker[];
  onAddSticker: (emoji: string) => void;
  onRemoveSticker: (id: string) => void;
}

const STICKER_CATEGORIES = [
  {
    name: 'Reactions',
    stickers: ['😀', '😂', '🥰', '😍', '🤩', '😎', '🥳', '😭', '🔥', '💀', '👀', '💯'],
  },
  {
    name: 'Hearts',
    stickers: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💕', '💖', '💗', '💝'],
  },
  {
    name: 'Gestures',
    stickers: ['👍', '👎', '👏', '🙌', '🤝', '✌️', '🤞', '🤙', '👋', '💪', '🙏', '☝️'],
  },
  {
    name: 'Objects',
    stickers: ['⭐', '🌟', '✨', '💫', '🎉', '🎊', '🎁', '🏆', '👑', '💎', '🎵', '🎶'],
  },
  {
    name: 'Animals',
    stickers: ['🐶', '🐱', '🐼', '🦊', '🦁', '🐯', '🐻', '🐨', '🐸', '🦋', '🐝', '🐳'],
  },
  {
    name: 'Food',
    stickers: ['🍕', '🍔', '🍟', '🌮', '🍦', '🍩', '🍪', '☕', '🧋', '🍿', '🎂', '🍾'],
  },
];

export function StickerPanel({ stickers, onAddSticker, onRemoveSticker }: StickerPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState(0);

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {STICKER_CATEGORIES.map((cat, idx) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(idx)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === idx
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sticker grid */}
      <div className="grid grid-cols-6 gap-2">
        {STICKER_CATEGORIES[selectedCategory].stickers.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onAddSticker(emoji)}
            className="aspect-square rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-2xl transition-colors active:scale-95"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Added stickers */}
      {stickers.length > 0 && (
        <div className="pt-4 border-t border-white/10">
          <h4 className="text-sm text-white/50 mb-2">Added Stickers ({stickers.length})</h4>
          <div className="flex flex-wrap gap-2">
            {stickers.map((sticker) => (
              <div
                key={sticker.id}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10"
              >
                <span className="text-lg">{sticker.emoji}</span>
                <button
                  onClick={() => onRemoveSticker(sticker.id)}
                  className="text-white/40 hover:text-white/80"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/30 mt-2">
            Drag stickers on the video to reposition them
          </p>
        </div>
      )}
    </div>
  );
}
