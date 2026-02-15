'use client';

import Image from 'next/image';
import { VideoCameraIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import type { CreatorVideo } from '@/types/creator';
import { formatCount } from '@/utils/format';

interface ContentTabProps {
  videos: CreatorVideo[];
}

function VideoStatusBadge({ status }: { status: string }) {
  const colors = {
    published: 'bg-green-500/20 text-green-400',
    draft: 'bg-gray-500/20 text-gray-400',
    processing: 'bg-yellow-500/20 text-yellow-400',
    scheduled: 'bg-blue-500/20 text-blue-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs ${colors[status as keyof typeof colors] || colors.draft}`}>
      {status}
    </span>
  );
}

export function ContentTab({ videos }: ContentTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium">
            All
          </button>
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition">
            Published
          </button>
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition">
            Drafts
          </button>
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition">
            Scheduled
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {videos.map(video => (
          <div
            key={video.id}
            className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition"
          >
            <div className="w-32 aspect-video bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 relative">
              {video.thumbnailUrl ? (
                <Image src={video.thumbnailUrl} alt={video.title + " thumbnail"} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoCameraIcon className="w-6 h-6 text-gray-600" />
                </div>
              )}
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-xs">
                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-medium mb-1">{video.title}</div>
              <div className="text-sm text-gray-400 line-clamp-1">{video.description}</div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <VideoStatusBadge status={video.status} />
                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-semibold">{formatCount(video.views)}</div>
                <div className="text-gray-400">Views</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{formatCount(video.likes)}</div>
                <div className="text-gray-400">Likes</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{formatCount(video.comments)}</div>
                <div className="text-gray-400">Comments</div>
              </div>
            </div>

            <button className="p-2 hover:bg-white/10 rounded-full transition" aria-label="Video settings">
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
