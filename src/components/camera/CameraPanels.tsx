'use client';

import { CAMERA_FILTERS, CAMERA_EFFECTS, CAMERA_SPEEDS } from '@/hooks/useCamera';

interface FiltersPanelProps {
  selectedFilter: number;
  onSelect: (index: number) => void;
}

export function FiltersPanel({ selectedFilter, onSelect }: FiltersPanelProps) {
  return (
    <div className="absolute bottom-32 left-0 right-0 z-10 px-4">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {CAMERA_FILTERS.map((filter, index) => (
          <button
            key={filter.name}
            onClick={() => onSelect(index)}
            className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden relative ${selectedFilter === index ? 'ring-2 ring-purple-500' : ''}`}
          >
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" style={{ filter: filter.filter }} />
            <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-0.5 text-center">
              {filter.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface EffectsPanelProps {
  selectedEffect: number;
  onSelect: (index: number) => void;
}

export function EffectsPanel({ selectedEffect, onSelect }: EffectsPanelProps) {
  return (
    <div className="absolute bottom-32 left-0 right-0 z-10 px-4">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {CAMERA_EFFECTS.map((effect, index) => (
          <button
            key={effect.name}
            onClick={() => onSelect(index)}
            className={`flex-shrink-0 w-16 h-16 rounded-xl bg-black/30 flex flex-col items-center justify-center ${selectedEffect === index ? 'ring-2 ring-purple-500' : ''}`}
          >
            <span className="text-2xl">{effect.icon}</span>
            <span className="text-white text-[10px] mt-1">{effect.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface SpeedPanelProps {
  selectedSpeed: number;
  onSelect: (index: number) => void;
}

export function SpeedPanel({ selectedSpeed, onSelect }: SpeedPanelProps) {
  return (
    <div className="absolute bottom-32 left-0 right-0 z-10 px-4">
      <div className="flex gap-3 justify-center">
        {CAMERA_SPEEDS.map((speed, index) => (
          <button
            key={speed.label}
            onClick={() => onSelect(index)}
            className={`px-4 py-2 rounded-full ${selectedSpeed === index ? 'bg-purple-500 text-white' : 'bg-black/30 text-white/70'}`}
          >
            {speed.label}
          </button>
        ))}
      </div>
    </div>
  );
}
