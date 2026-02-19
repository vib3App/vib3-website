'use client';

import { DURATION_PRESETS } from '@/hooks/camera/types';

interface DurationSelectorProps {
  maxDuration: number;
  onSelect: (duration: number) => void;
}

export function DurationSelector({ maxDuration, onSelect }: DurationSelectorProps) {
  return (
    <div className="absolute bottom-32 left-0 right-0 z-10 px-4">
      <div className="flex gap-3 justify-center">
        {DURATION_PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onSelect(preset.value)}
            className={`px-4 py-2 rounded-full ${
              maxDuration === preset.value
                ? 'bg-purple-500 text-white'
                : 'bg-black/30 text-white/70'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
