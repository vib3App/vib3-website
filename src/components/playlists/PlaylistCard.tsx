'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LockClosedIcon, GlobeAltIcon, PlayIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import type { Playlist } from '@/types/playlist';
import { formatTotalDuration } from './playlistUtils';

interface PlaylistCardProps {
  playlist: Playlist;
  onDelete: () => void;
}

export function PlaylistCard({ playlist, onDelete }: PlaylistCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="glass-card rounded-xl overflow-hidden group">
      <Link href={`/playlists/${playlist.id}`}>
        <div className="relative aspect-video bg-white/5">
          {playlist.thumbnailUrl || playlist.coverImageUrl ? (
            <Image src={playlist.thumbnailUrl || playlist.coverImageUrl || ''} alt={playlist.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayIcon className="w-12 h-12 text-white/20" />
            </div>
          )}

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
              <PlayIcon className="w-6 h-6 text-black ml-1" />
            </div>
          </div>

          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-white text-xs font-medium">
            {playlist.videoCount} videos
          </div>

          <div className="absolute top-2 left-2">
            {playlist.isPrivate ? (
              <LockClosedIcon className="w-4 h-4 text-white drop-shadow" />
            ) : (
              <GlobeAltIcon className="w-4 h-4 text-white drop-shadow" />
            )}
          </div>
        </div>
      </Link>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link href={`/playlists/${playlist.id}`}>
              <h3 className="font-medium text-white truncate hover:underline">{playlist.name}</h3>
            </Link>
            {playlist.description && <p className="text-white/50 text-sm truncate mt-0.5">{playlist.description}</p>}
            <p className="text-white/40 text-xs mt-1">{formatTotalDuration(playlist.totalDuration)}</p>
          </div>

          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-1 hover:bg-white/10 rounded-full transition">
              <EllipsisVerticalIcon className="w-5 h-5 text-white/70" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-8 z-50 w-40 glass-heavy rounded-lg overflow-hidden shadow-xl">
                  <Link href={`/playlists/${playlist.id}`} className="block px-4 py-2 text-white hover:bg-white/10 transition">View playlist</Link>
                  <Link href={`/playlists/${playlist.id}/edit`} className="block px-4 py-2 text-white hover:bg-white/10 transition">Edit</Link>
                  <button onClick={() => { setShowMenu(false); onDelete(); }} className="block w-full text-left px-4 py-2 text-red-400 hover:bg-white/10 transition">Delete</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
