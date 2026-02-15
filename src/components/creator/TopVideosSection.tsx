'use client';

import Image from 'next/image';
import { VideoCameraIcon, EyeIcon, HeartIcon } from '@heroicons/react/24/outline';
import type { CreatorVideo } from '@/types/creator';
import { formatCount } from '@/utils/format';

interface TopVideosSectionProps {
  videos: CreatorVideo[];
  onViewAll: () => void;
}

export function TopVideosSection({ videos, onViewAll }: TopVideosSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Top Performing Videos</h2>
        <button onClick={onViewAll} className="text-pink-400 text-sm hover:underline">
          View all
        </button>
      </div>

      <div className="space-y-3">
        {videos.slice(0, 5).map((video, i) => (
          <div
            key={video.id}
            className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition"
          >
            <span className="w-6 text-center font-bold text-gray-400">{i + 1}</span>
            <div className="w-16 aspect-video bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 relative">
              {video.thumbnailUrl ? (
                <Image src={video.thumbnailUrl} alt="" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoCameraIcon className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{video.title}</div>
              <div className="text-sm text-gray-400">
                {new Date(video.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <EyeIcon className="w-4 h-4" />
                {formatCount(video.views)}
              </div>
              <div className="flex items-center gap-1">
                <HeartIcon className="w-4 h-4" />
                {formatCount(video.likes)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
