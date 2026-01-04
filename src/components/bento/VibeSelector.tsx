'use client';

import { BentoItem } from './BentoItem';

const VIBES = [
  { id: 'chill', name: 'Chill', emoji: '😌', color: 'from-blue-500 to-purple-500' },
  { id: 'hype', name: 'Hype', emoji: '🔥', color: 'from-orange-500 to-pink-500' },
  { id: 'dark', name: 'Dark', emoji: '🌙', color: 'from-gray-800 to-purple-900' },
  { id: 'funny', name: 'Funny', emoji: '😂', color: 'from-yellow-400 to-orange-500' },
  { id: 'aesthetic', name: 'Aesthetic', emoji: '✨', color: 'from-pink-400 to-purple-400' },
  { id: 'learn', name: 'Learn', emoji: '🧠', color: 'from-green-400 to-teal-500' },
];

interface VibeSelectorProps {
  activeVibe: string | null;
  onSelect: (vibe: string) => void;
}

export function VibeSelector({ activeVibe, onSelect }: VibeSelectorProps) {
  return (
    <BentoItem size="wide">
      <div className="w-full h-full p-4">
        <h3 className="text-lg font-bold mb-3 gradient-text">Pick Your Vibe</h3>
        <div className="grid grid-cols-3 gap-2 h-[calc(100%-2rem)]">
          {VIBES.map((vibe) => (
            <button
              key={vibe.id}
              onClick={() => onSelect(vibe.id)}
              className={`relative rounded-xl p-2 transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                activeVibe === vibe.id
                  ? `bg-gradient-to-br ${vibe.color} scale-105 shadow-lg`
                  : 'bg-white/5 hover:bg-white/10 hover:scale-102'
              }`}
            >
              <span className="text-xl">{vibe.emoji}</span>
              <span className="text-xs font-medium">{vibe.name}</span>
            </button>
          ))}
        </div>
      </div>
    </BentoItem>
  );
}
