'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { LiveStream } from '@/types';

interface LiveStreamCardProps {
  stream: LiveStream;
}

function formatViewers(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export function LiveStreamCard({ stream }: LiveStreamCardProps) {
  return (
    <Link href={`/live/${stream.id}`} className="block group">
      <div className="glass-card p-2 hover:border-red-500/30">
        <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
          {stream.thumbnailUrl ? (
            <Image
              src={stream.thumbnailUrl}
              alt={stream.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-red-500/20 flex items-center justify-center">
              <VideoIcon />
            </div>
          )}

          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg shadow-red-500/30">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
            <span className="px-2.5 py-1 glass text-white text-xs rounded-full">
              {formatViewers(stream.viewerCount)} watching
            </span>
          </div>

          {stream.guests?.length > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 glass rounded-full">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              <span className="text-white text-xs font-medium">{(stream.guests?.length || 0) + 1}</span>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 px-1">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-red-500 rounded-full blur-sm opacity-50 animate-pulse" />
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-red-500">
              {stream.hostAvatar ? (
                <Image src={stream.hostAvatar} alt={stream.hostUsername} width={40} height={40} className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-red-500 flex items-center justify-center text-white font-bold">
                  {stream.hostUsername.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium truncate group-hover:text-white/90">{stream.title}</h3>
            <p className="text-white/50 text-sm">@{stream.hostUsername}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function VideoIcon() {
  return (
    <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}
