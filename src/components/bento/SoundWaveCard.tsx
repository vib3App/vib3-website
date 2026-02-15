'use client';

import { useState } from 'react';
import Image from 'next/image';
import { SoundVisualizer } from '@/components/ui/Glass';
import { BentoItem } from './BentoItem';

interface SoundWaveCardProps {
  sounds: Array<{
    id: string;
    name: string;
    artist: string;
    uses: number;
    coverUrl: string;
  }>;
}

export function SoundWaveCard({ sounds }: SoundWaveCardProps) {
  const [activeSound, setActiveSound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <BentoItem size="md">
      <div className="w-full h-full p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Trending Sounds</h3>
          <SoundVisualizer isPlaying={isPlaying} />
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
          {sounds.map((sound, i) => (
            <button
              key={sound.id}
              onClick={() => {
                setActiveSound(i);
                setIsPlaying(true);
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${
                activeSound === i ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <Image src={sound.coverUrl} alt={sound.name} width={40} height={40} className="w-10 h-10 rounded-lg object-cover" />
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-sm truncate">{sound.name}</p>
                <p className="text-xs text-white/60 truncate">{sound.artist}</p>
              </div>
              <span className="text-xs text-white/40">{(sound.uses / 1000).toFixed(1)}K</span>
            </button>
          ))}
        </div>
      </div>
    </BentoItem>
  );
}
