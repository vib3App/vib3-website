'use client';

import Image from 'next/image';
import Link from 'next/link';
import { GlassPill } from '@/components/ui/Glass';
import type { Video } from '@/types';

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

interface TrendingHeroCardProps {
  video: Video | undefined;
}

export function TrendingHeroCard({ video }: TrendingHeroCardProps) {
  return (
    <div className="bento-xl glass-card p-0 overflow-hidden group cursor-pointer">
      <Link href={video ? `/feed?video=${video.id}` : '/trending'}>
        <div className="relative w-full h-full">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{
              backgroundImage: video?.thumbnailUrl
                ? `url(${video.thumbnailUrl})`
                : 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          <div className="absolute top-4 left-4">
            <GlassPill color="orange">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z" />
              </svg>
              TRENDING
            </GlassPill>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-2xl font-bold mb-2 line-clamp-2">
              {video?.caption || 'Discover trending content'}
            </h2>
            <div className="flex items-center gap-3">
              {video?.userAvatar ? (
                <Image src={video.userAvatar} alt={(video.username || "Creator") + "'s avatar"} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-teal-500" />
              )}
              <div>
                <p className="font-medium">{video?.username || 'VIB3 Creator'}</p>
                <p className="text-sm text-white/60">{video ? formatCount(video.viewsCount || 0) : '0'} views</p>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-20 h-20 rounded-full glass-heavy flex items-center justify-center glow-pulse">
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
