'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GlassPill } from '@/components/ui/Glass';
import { BentoItem } from './BentoItem';

interface TrendingHeroProps {
  video: {
    id: string;
    thumbnailUrl: string;
    title: string;
    creator: string;
    creatorAvatar: string;
    views: string;
    isLive?: boolean;
  };
}

export function TrendingHero({ video }: TrendingHeroProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <BentoItem size="xl" href={`/watch/${video.id}`}>
      <div
        className="relative w-full h-full overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
          style={{
            backgroundImage: `url(${video.thumbnailUrl})`,
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {video.isLive && (
          <div className="absolute top-4 left-4">
            <GlassPill color="pink" pulse>
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              LIVE
            </GlassPill>
          </div>
        )}

        <div className="absolute top-4 right-4">
          <GlassPill color="orange">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z" />
            </svg>
            TRENDING
          </GlassPill>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2 className="text-2xl font-bold mb-2 line-clamp-2">{video.title}</h2>
          <div className="flex items-center gap-3">
            <Image src={video.creatorAvatar} alt={video.creator} width={40} height={40} className="w-10 h-10 rounded-full border-2 border-white/20" />
            <div>
              <p className="font-medium">{video.creator}</p>
              <p className="text-sm text-white/60">{video.views} views</p>
            </div>
          </div>
        </div>

        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-20 h-20 rounded-full glass-heavy flex items-center justify-center glow-pulse">
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    </BentoItem>
  );
}
