'use client';

import { useState } from 'react';
import { BentoItem } from './BentoItem';

interface VideoPreviewCardProps {
  video: {
    id: string;
    thumbnailUrl: string;
    duration?: string;
    views?: string;
  };
  size?: 'sm' | 'md';
}

export function VideoPreviewCard({ video, size = 'sm' }: VideoPreviewCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <BentoItem size={size} href={`/watch/${video.id}`}>
      <div
        className="relative w-full h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
          style={{
            backgroundImage: `url(${video.thumbnailUrl})`,
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {video.duration && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-xs">
            {video.duration}
          </div>
        )}

        {video.views && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white/80">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
            {video.views}
          </div>
        )}

        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-12 h-12 rounded-full glass flex items-center justify-center">
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    </BentoItem>
  );
}
