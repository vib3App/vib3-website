'use client';

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
  if (!isOpen) return null;

  const upNextVideos = videos.slice(currentIndex + 1, currentIndex + 6);

  return (
    <div className="fixed top-16 right-4 w-80 max-h-96 bg-black/90 backdrop-blur-sm rounded-xl overflow-hidden z-40 hidden md:block">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Up Next</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="overflow-y-auto max-h-72">
        {upNextVideos.map((video, i) => (
          <button
            key={`${video.id}-${i}`}
            onClick={() => onScrollToVideo(currentIndex + 1 + i)}
            className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors"
          >
            <div className="w-16 h-10 bg-[#1A1F2E] rounded overflow-hidden flex-shrink-0">
              {video.thumbnailUrl && (
                <Image src={video.thumbnailUrl} alt="" width={64} height={40} className="object-cover w-full h-full" />
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-white text-sm line-clamp-1">@{video.username}</p>
              <p className="text-white/50 text-xs line-clamp-1">{video.caption || 'No caption'}</p>
            </div>
          </button>
        ))}
        {upNextVideos.length === 0 && (
          <p className="text-white/50 text-sm text-center py-4">No more videos in queue</p>
        )}
      </div>
    </div>
  );
}
