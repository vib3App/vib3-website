'use client';

import { forwardRef } from 'react';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  QueueListIcon,
} from '@heroicons/react/24/outline';
import type { WatchPartyVideo } from '@/types/collaboration';

interface WatchPartyPlayerProps {
  currentVideo: WatchPartyVideo | undefined;
  isPlaying: boolean;
  isHost: boolean;
  currentVideoIndex: number;
  playlistLength: number;
  onPlayPause: () => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
  onAddVideo: () => void;
}

export const WatchPartyPlayer = forwardRef<HTMLVideoElement, WatchPartyPlayerProps>(
  function WatchPartyPlayer(
    {
      currentVideo,
      isPlaying,
      isHost,
      currentVideoIndex,
      playlistLength,
      onPlayPause,
      onSkipNext,
      onSkipPrevious,
      onAddVideo,
    },
    ref
  ) {
    return (
      <div className="relative bg-black flex-1 flex items-center justify-center">
        {currentVideo ? (
          <video
            ref={ref}
            className="max-w-full max-h-full"
            playsInline
          />
        ) : (
          <div className="text-center">
            <QueueListIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No videos in playlist</p>
            <button
              onClick={onAddVideo}
              className="mt-4 px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-full text-sm font-medium transition"
            >
              Add Videos
            </button>
          </div>
        )}

        {isHost && currentVideo && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-black/80 rounded-full">
            <button
              onClick={onSkipPrevious}
              disabled={currentVideoIndex === 0}
              className="p-2 hover:bg-white/20 disabled:opacity-50 rounded-full transition"
            >
              <BackwardIcon className="w-5 h-5" />
            </button>

            <button
              onClick={onPlayPause}
              className="p-3 bg-white text-black rounded-full hover:opacity-90 transition"
            >
              {isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={onSkipNext}
              disabled={currentVideoIndex >= playlistLength - 1}
              className="p-2 hover:bg-white/20 disabled:opacity-50 rounded-full transition"
            >
              <ForwardIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    );
  }
);
