'use client';

import Image from 'next/image';
import type { RemixType } from '@/types/collaboration';
import type { Video } from '@/types';

const REMIX_LABELS: Record<RemixType, string> = {
  echo: 'Echo',
  duet: 'Duet',
  stitch: 'Stitch',
  remix: 'Remix',
};

interface RemixSidebarProps {
  originalVideo: Video;
  remixType: RemixType;
  recordedBlob: Blob | null;
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
}

export function RemixSidebar({
  originalVideo,
  remixType,
  recordedBlob,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: RemixSidebarProps) {
  return (
    <div className="space-y-6">
      <OriginalVideoInfo video={originalVideo} />
      {recordedBlob && (
        <RemixDetailsForm
          remixType={remixType}
          title={title}
          description={description}
          onTitleChange={onTitleChange}
          onDescriptionChange={onDescriptionChange}
        />
      )}
      <RemixTips />
    </div>
  );
}

function OriginalVideoInfo({ video }: { video: Video }) {
  return (
    <div className="bg-white/5 rounded-2xl p-4">
      <h2 className="font-semibold mb-3">Original Video</h2>
      <div className="flex gap-3">
        <div className="w-20 aspect-[9/16] rounded-lg overflow-hidden bg-gray-800 relative">
          {video.thumbnailUrl && (
            <Image src={video.thumbnailUrl} alt={(video.title || "Original video") + " thumbnail"} fill className="object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium line-clamp-2">{video.title}</div>
          <div className="text-sm text-gray-400 mt-1">@{video.username}</div>
        </div>
      </div>
    </div>
  );
}

function RemixDetailsForm({
  remixType,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: {
  remixType: RemixType;
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
}) {
  return (
    <div className="bg-white/5 rounded-2xl p-4 space-y-4">
      <h2 className="font-semibold">{REMIX_LABELS[remixType]} Details</h2>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Title (optional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Add a title..."
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Add a description..."
          rows={3}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500 resize-none"
        />
      </div>
    </div>
  );
}

function RemixTips() {
  return (
    <div className="bg-white/5 rounded-2xl p-4">
      <h2 className="font-semibold mb-3">Tips</h2>
      <ul className="text-sm text-gray-400 space-y-2">
        <li>• Recording starts when you click &quot;Start Recording&quot;</li>
        <li>• The original video plays alongside your recording</li>
        <li>• You can retry as many times as you want</li>
        <li>• Make sure you have good lighting</li>
      </ul>
    </div>
  );
}
