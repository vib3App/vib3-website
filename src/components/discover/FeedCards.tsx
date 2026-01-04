'use client';

import Link from 'next/link';
import { GlassPill, GlassButton } from '@/components/ui/Glass';
import type { Video } from '@/types';
import { formatCount } from './DiscoverUtils';

export function LivePulseCard() {
  return (
    <div className="bento-md glass-card p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <GlassPill color="pink" pulse>
          <span className="w-2 h-2 bg-red-500 rounded-full" />
          LIVE NOW
        </GlassPill>
      </div>
      <Link href="/live" className="flex-1 relative rounded-xl overflow-hidden mb-3 group">
        <div
          className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <p className="font-medium text-sm truncate">Live streams happening now</p>
          <p className="text-xs text-white/60">Tap to explore</p>
        </div>
      </Link>
      <GlassButton size="sm" className="w-full">Go Live</GlassButton>
    </div>
  );
}

interface ForYouSectionProps {
  videos: Video[];
  isLoading: boolean;
}

export function ForYouSection({ videos, isLoading }: ForYouSectionProps) {
  const displayVideos = isLoading ? Array(3).fill(null) : videos.slice(1, 4);

  return (
    <div className="bento-tall glass-card p-4 flex flex-col">
      <h3 className="font-bold mb-3 flex items-center gap-2">
        <span className="text-purple-400">✦</span>
        For You
      </h3>
      <div className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
        {displayVideos.map((video, i) => (
          <Link
            key={video?.id || i}
            href={video ? `/feed?video=${video.id}` : '#'}
            className="block relative aspect-[9/16] rounded-xl overflow-hidden bg-white/5 group"
          >
            {video?.thumbnailUrl ? (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundImage: `url(${video.thumbnailUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs">
                  <span>{formatCount(video.viewsCount || 0)}</span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 animate-pulse bg-white/10" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

interface VideoGridItemProps {
  video: Video;
  size: 'md' | 'sm';
}

export function VideoGridItem({ video, size }: VideoGridItemProps) {
  return (
    <div className={`${size === 'md' ? 'bento-md' : 'bento-sm'} glass-card p-0 overflow-hidden group cursor-pointer`}>
      <Link href={`/feed?video=${video.id}`}>
        <div className="relative w-full h-full">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
            style={{ backgroundImage: `url(${video.thumbnailUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z" />
              </svg>
              {formatCount(video.viewsCount || 0)}
            </span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full glass flex items-center justify-center">
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
