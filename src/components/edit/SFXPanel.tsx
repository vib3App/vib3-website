'use client';

import { useState, useCallback } from 'react';
import { playSFX, isSynthSFX } from '@/services/sfxGenerator';

interface SFXPanelProps {
  appliedSFX: { id: string; name: string; time: number }[];
  onAddSFX: (sfx: { id: string; name: string; url: string }, time: number) => void;
  onRemoveSFX: (index: number) => void;
  currentTime: number;
  formatTime: (t: number) => string;
}

interface SFXItem {
  id: string;
  name: string;
  emoji: string;
  url: string;
}

const SFX_CATEGORIES: { name: string; emoji: string; items: SFXItem[] }[] = [
  {
    name: 'Transitions', emoji: '~',
    items: [
      { id: 'whoosh', name: 'Whoosh', emoji: '>', url: '/sfx/whoosh.mp3' },
      { id: 'swoosh', name: 'Swoosh', emoji: '~', url: '/sfx/swoosh.mp3' },
      { id: 'swipe', name: 'Swipe', emoji: '^', url: '/sfx/swipe.mp3' },
      { id: 'slide', name: 'Slide', emoji: '/', url: '/sfx/slide.mp3' },
    ],
  },
  {
    name: 'Comedy', emoji: ':)',
    items: [
      { id: 'boing', name: 'Boing', emoji: 'o', url: '/sfx/boing.mp3' },
      { id: 'fart', name: 'Toot', emoji: '~', url: '/sfx/toot.mp3' },
      { id: 'rimshot', name: 'Rimshot', emoji: 'x', url: '/sfx/rimshot.mp3' },
      { id: 'crickets', name: 'Crickets', emoji: '.', url: '/sfx/crickets.mp3' },
      { id: 'laugh', name: 'Laugh Track', emoji: 'D', url: '/sfx/laugh.mp3' },
    ],
  },
  {
    name: 'Impact', emoji: '!',
    items: [
      { id: 'boom', name: 'Boom', emoji: '*', url: '/sfx/boom.mp3' },
      { id: 'punch', name: 'Punch', emoji: 'x', url: '/sfx/punch.mp3' },
      { id: 'crash', name: 'Crash', emoji: '!', url: '/sfx/crash.mp3' },
      { id: 'slam', name: 'Slam', emoji: '#', url: '/sfx/slam.mp3' },
      { id: 'thud', name: 'Thud', emoji: 'v', url: '/sfx/thud.mp3' },
    ],
  },
  {
    name: 'UI / Tech', emoji: '*',
    items: [
      { id: 'ding', name: 'Ding', emoji: '*', url: '/sfx/ding.mp3' },
      { id: 'beep', name: 'Beep', emoji: '.', url: '/sfx/beep.mp3' },
      { id: 'click', name: 'Click', emoji: '-', url: '/sfx/click.mp3' },
      { id: 'error', name: 'Error', emoji: 'X', url: '/sfx/error.mp3' },
      { id: 'success', name: 'Success', emoji: '+', url: '/sfx/success.mp3' },
    ],
  },
  {
    name: 'Nature', emoji: '#',
    items: [
      { id: 'rain', name: 'Rain', emoji: '|', url: '/sfx/rain.mp3' },
      { id: 'thunder', name: 'Thunder', emoji: '!', url: '/sfx/thunder.mp3' },
      { id: 'wind', name: 'Wind', emoji: '~', url: '/sfx/wind.mp3' },
      { id: 'birds', name: 'Birds', emoji: 'v', url: '/sfx/birds.mp3' },
    ],
  },
  {
    name: 'Musical', emoji: '#',
    items: [
      { id: 'vinyl', name: 'Vinyl Scratch', emoji: 'o', url: '/sfx/vinyl.mp3' },
      { id: 'airhorn', name: 'Air Horn', emoji: '!', url: '/sfx/airhorn.mp3' },
      { id: 'harp', name: 'Harp Gliss', emoji: '~', url: '/sfx/harp.mp3' },
      { id: 'drumroll', name: 'Drum Roll', emoji: '#', url: '/sfx/drumroll.mp3' },
    ],
  },
];

export function SFXPanel({ appliedSFX, onAddSFX, onRemoveSFX, currentTime, formatTime }: SFXPanelProps) {
  const [activeCategory, setActiveCategory] = useState(0);

  const preview = useCallback((sfx: SFXItem) => {
    // Use Web Audio API synth if available, otherwise try file
    if (isSynthSFX(sfx.id)) {
      playSFX(sfx.id);
    } else {
      const audio = new Audio(sfx.url);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  }, []);

  const category = SFX_CATEGORIES[activeCategory];

  return (
    <div className="space-y-3">
      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {SFX_CATEGORIES.map((cat, i) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(i)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition ${
              i === activeCategory ? 'bg-purple-500/30 text-purple-300' : 'glass text-white/50 hover:text-white'
            }`}
          >
            <span className="font-mono">[{cat.emoji}]</span> {cat.name}
          </button>
        ))}
      </div>

      {/* SFX items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {category.items.map(sfx => (
          <div key={sfx.id} className="glass rounded-lg p-2 flex items-center gap-2">
            <button
              onClick={() => preview(sfx)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 hover:bg-white/20 transition"
              title="Preview"
            >
              <svg className="w-3.5 h-3.5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <span className="text-white text-xs flex-1 truncate">{sfx.name}</span>
            <button
              onClick={() => onAddSFX(sfx, currentTime)}
              className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs hover:bg-purple-500/30"
            >
              Add
            </button>
          </div>
        ))}
      </div>

      {/* Applied SFX */}
      {appliedSFX.length > 0 && (
        <div>
          <label className="block text-white text-sm font-medium mb-1">
            Applied ({appliedSFX.length})
          </label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {appliedSFX.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-1.5 glass rounded-lg text-xs">
                <span className="text-white">{s.name} @ {formatTime(s.time)}</span>
                <button onClick={() => onRemoveSFX(i)} className="text-red-400 hover:text-red-300 px-1">x</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
