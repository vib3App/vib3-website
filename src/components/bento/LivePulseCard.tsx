'use client';

import { useState, useEffect } from 'react';
import { GlassPill } from '@/components/ui/Glass';
import { BentoItem } from './BentoItem';

interface LivePulseCardProps {
  streams: Array<{
    id: string;
    thumbnailUrl: string;
    streamerName: string;
    viewers: number;
  }>;
}

export function LivePulseCard({ streams }: LivePulseCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % streams.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [streams.length]);

  const activeStream = streams[activeIndex];

  return (
    <BentoItem size="md" href={`/live/${activeStream?.id}`}>
      <div className="relative w-full h-full p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <GlassPill color="pink" pulse>
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            LIVE NOW
          </GlassPill>
          <span className="text-sm text-white/60">{streams.length} streams</span>
        </div>

        <div className="flex-1 relative rounded-xl overflow-hidden mb-3">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${activeStream?.thumbnailUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <p className="font-medium text-sm truncate">{activeStream?.streamerName}</p>
            <p className="text-xs text-white/60">{activeStream?.viewers.toLocaleString()} watching</p>
          </div>
        </div>

        <div className="flex justify-center gap-1.5">
          {streams.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === activeIndex ? 'bg-pink-500 w-6' : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </BentoItem>
  );
}
