'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import type { Video } from '@/types';

interface FeedQueuePanelProps {
  videos: Video[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onScrollToVideo: (index: number) => void;
}

export function FeedQueuePanel({
  videos,
  currentIndex,
  isOpen,
  onClose,
  onScrollToVideo,
}: FeedQueuePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay listener to avoid catching the toggle click itself
    const timeout = setTimeout(() => {
      document.addEventListener('click', handleClick);
    }, 0);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('click', handleClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const upNextVideos = videos.slice(currentIndex + 1, currentIndex + 6);

  return (
    <div
      ref={panelRef}
      className="fixed top-32 right-4 w-80 max-h-[420px] glass-heavy rounded-2xl overflow-hidden z-40 hidden md:block"
      style={{ animation: 'slide-up-scale 0.3s ease-out' }}
    >
      {/* Header with gradient accent */}
      <div className="relative p-4 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-teal-500/10" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-teal-400 animate-pulse" />
            <h3 className="text-white font-semibold">Up Next</h3>
            <span className="text-white/40 text-sm">({upNextVideos.length})</span>
          </div>
        </div>
      </div>

      {/* Queue Items */}
      <div className="overflow-y-auto max-h-80 p-2 space-y-1">
        {upNextVideos.map((video, i) => (
          <button
            key={`${video.id}-${i}`}
            onClick={() => { onScrollToVideo(currentIndex + 1 + i); onClose(); }}
            className="group w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-all duration-200"
            style={{ animationDelay: `${i * 50}ms`, animation: 'slide-up-scale 0.3s ease-out forwards' }}
          >
            {/* Index indicator */}
            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-white/60">{i + 1}</span>
            </div>

            {/* Thumbnail with glass border */}
            <div className="relative w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-white/10 group-hover:ring-white/30 transition-all">
              {video.thumbnailUrl ? (
                <Image
                  src={video.thumbnailUrl}
                  alt={"@" + video.username + " video thumbnail"}
                  width={64}
                  height={40}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-teal-500/30" />
              )}
              {/* Play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* Video Info */}
            <div className="flex-1 text-left min-w-0">
              <p className="text-white text-sm line-clamp-1 font-medium group-hover:text-white transition-colors">
                @{video.username}
              </p>
              <p className="text-white/40 text-xs line-clamp-1 group-hover:text-white/60 transition-colors">
                {video.caption || 'No caption'}
              </p>
            </div>

            {/* Arrow indicator */}
            <svg
              className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}

        {upNextVideos.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-500/20 to-teal-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-white/40 text-sm">No more videos</p>
            <p className="text-white/20 text-xs mt-1">Keep scrolling for more content</p>
          </div>
        )}
      </div>
    </div>
  );
}
