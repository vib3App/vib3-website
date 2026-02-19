'use client';

import { useState, useEffect, useCallback } from 'react';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import type { Video } from '@/types';

interface PlaylistAutoPlayerProps {
  videos: Video[];
  startIndex?: number;
  onVideoChange?: (index: number) => void;
}

export function PlaylistAutoPlayer({ videos, startIndex = 0, onVideoChange }: PlaylistAutoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const currentVideo = videos[currentIndex];

  const goToNext = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, videos.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    onVideoChange?.(currentIndex);
  }, [currentIndex, onVideoChange]);

  if (!currentVideo) return null;

  return (
    <div className="relative">
      <VideoPlayer
        src={currentVideo.videoUrl}
        poster={currentVideo.thumbnailUrl}
        autoPlay
        loop={false}
        showControls
        className="w-full aspect-video rounded-xl overflow-hidden"
        onEnded={goToNext}
      />

      {/* Nav controls */}
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 text-white/50 text-sm disabled:opacity-30 hover:text-white transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        <span className="text-white/30 text-sm">{currentIndex + 1} / {videos.length}</span>
        <button
          onClick={goToNext}
          disabled={currentIndex === videos.length - 1}
          className="flex items-center gap-1 text-white/50 text-sm disabled:opacity-30 hover:text-white transition"
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Current video info */}
      <div className="mt-2 p-3 glass rounded-xl">
        <p className="text-white text-sm font-medium truncate">{currentVideo.caption || currentVideo.title || 'Untitled'}</p>
        <p className="text-white/40 text-xs">@{currentVideo.username}</p>
      </div>
    </div>
  );
}
