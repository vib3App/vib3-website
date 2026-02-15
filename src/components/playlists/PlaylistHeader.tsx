'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  PlayIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  LockClosedIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import type { Playlist } from '@/types/playlist';
import { formatTotalDuration } from './playlistUtils';

interface PlaylistHeaderProps {
  playlist: Playlist;
  isOwner: boolean;
  hasVideos: boolean;
  onPlayAll: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export function PlaylistHeader({
  playlist,
  isOwner,
  hasVideos,
  onPlayAll,
  onShare,
  onDelete,
}: PlaylistHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 mb-8">
      <div className="w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-white/10 mx-auto sm:mx-0">
        {playlist.thumbnailUrl || playlist.coverImageUrl ? (
          <Image
            src={playlist.thumbnailUrl || playlist.coverImageUrl || ''}
            alt={playlist.name}
            width={160}
            height={160}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlayIcon className="w-16 h-16 text-white/20" />
          </div>
        )}
      </div>

      <div className="flex-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
          {playlist.isPrivate ? (
            <LockClosedIcon className="w-4 h-4 text-white/50" />
          ) : (
            <GlobeAltIcon className="w-4 h-4 text-white/50" />
          )}
          <span className="text-white/50 text-sm">
            {playlist.isPrivate ? 'Private' : 'Public'} Playlist
          </span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">{playlist.name}</h1>

        {playlist.description && (
          <p className="text-white/70 mb-3">{playlist.description}</p>
        )}

        <p className="text-white/50 text-sm mb-4">
          {playlist.videoCount} videos • {formatTotalDuration(playlist.totalDuration)}
        </p>

        <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
          <button
            onClick={onPlayAll}
            disabled={!hasVideos}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            <PlayIcon className="w-5 h-5" />
            Play All
          </button>

          <button onClick={onShare} className="p-2.5 glass rounded-full hover:bg-white/10 transition" aria-label="Share playlist">
            <ShareIcon className="w-5 h-5 text-white" />
          </button>

          {isOwner && (
            <>
              <Link
                href={`/playlists/${playlist.id}/edit`}
                className="p-2.5 glass rounded-full hover:bg-white/10 transition"
              >
                <PencilIcon className="w-5 h-5 text-white" />
              </Link>
              <button onClick={onDelete} className="p-2.5 glass rounded-full hover:bg-white/10 transition" aria-label="Delete playlist">
                <TrashIcon className="w-5 h-5 text-red-400" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
