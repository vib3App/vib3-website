'use client';

import Image from 'next/image';
import {
  PlayIcon,
  TrashIcon,
  PlusIcon,
  QueueListIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import type { WatchPartyVideo } from '@/types/collaboration';

interface WatchPartyPlaylistProps {
  playlist: WatchPartyVideo[];
  currentVideoIndex: number;
  isHost: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onSkipToVideo: (index: number) => void;
  onRemoveVideo: (videoId: string) => void;
  onAddVideo: () => void;
}

export function WatchPartyPlaylist({
  playlist,
  currentVideoIndex,
  isHost,
  isOpen,
  onToggle,
  onSkipToVideo,
  onRemoveVideo,
  onAddVideo,
}: WatchPartyPlaylistProps) {
  return (
    <div className="border-t border-white/10">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-2">
          <QueueListIcon className="w-5 h-5" />
          <span className="font-medium">Playlist</span>
          <span className="text-sm text-gray-400">({playlist.length} videos)</span>
        </div>
        <Bars3Icon className={`w-5 h-5 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="max-h-48 overflow-y-auto border-t border-white/10">
          {playlist.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No videos yet
            </div>
          ) : (
            playlist.map((video, index) => (
              <div
                key={video.videoId}
                className={`flex items-center gap-3 p-3 hover:bg-white/5 transition ${
                  index === currentVideoIndex ? 'bg-pink-500/20' : ''
                }`}
              >
                <div className="w-16 aspect-video bg-gray-800 rounded overflow-hidden flex-shrink-0">
                  {video.videoThumbnail ? (
                    <Image src={video.videoThumbnail} alt={video.videoTitle + " thumbnail"} width={128} height={72} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PlayIcon className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{video.videoTitle}</div>
                  <div className="text-xs text-gray-400">
                    Added by {video.addedBy}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isHost && index !== currentVideoIndex && (
                    <>
                      <button
                        onClick={() => onSkipToVideo(index)}
                        className="p-2 hover:bg-white/10 rounded-full transition"
                        title="Play now"
                      >
                        <PlayIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemoveVideo(video.videoId)}
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-full transition"
                        title="Remove"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}

          <button
            onClick={onAddVideo}
            className="w-full p-3 flex items-center justify-center gap-2 hover:bg-white/5 text-pink-400 transition"
          >
            <PlusIcon className="w-4 h-4" />
            Add Video
          </button>
        </div>
      )}
    </div>
  );
}
