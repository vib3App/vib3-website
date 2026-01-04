'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlayIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import type { Video } from '@/types';
import { formatDuration } from './playlistUtils';

interface VideoRowProps {
  video: Video;
  index: number;
  onRemove: () => void;
  onPlay: () => void;
}

export function VideoRow({ video, index, onRemove, onPlay }: VideoRowProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition group">
      <span className="text-white/40 text-sm w-6 text-center">{index + 1}</span>

      <button onClick={onPlay} className="relative flex-shrink-0">
        <div className="w-24 h-14 rounded-lg overflow-hidden bg-white/10">
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.caption || ''}
              width={96}
              height={56}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayIcon className="w-6 h-6 text-white/30" />
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
          <PlayIcon className="w-6 h-6 text-white" />
        </div>
        {video.duration && (
          <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 rounded text-white text-[10px]">
            {formatDuration(video.duration)}
          </span>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <Link href={`/video/${video.id}`} className="block">
          <h4 className="text-white font-medium truncate hover:underline">
            {video.caption || 'Untitled'}
          </h4>
        </Link>
        <Link href={`/profile/${video.userId}`} className="text-white/50 text-sm hover:underline">
          @{video.username}
        </Link>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-white/10 rounded-full transition opacity-0 group-hover:opacity-100"
        >
          <EllipsisVerticalIcon className="w-5 h-5 text-white/70" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-10 z-50 w-40 glass-heavy rounded-lg overflow-hidden shadow-xl">
              <Link href={`/video/${video.id}`} className="block px-4 py-2 text-white hover:bg-white/10 transition">
                Watch video
              </Link>
              <Link href={`/profile/${video.userId}`} className="block px-4 py-2 text-white hover:bg-white/10 transition">
                View creator
              </Link>
              <button
                onClick={() => { setShowMenu(false); onRemove(); }}
                className="block w-full text-left px-4 py-2 text-red-400 hover:bg-white/10 transition"
              >
                Remove from playlist
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
