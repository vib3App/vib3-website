'use client';

import Image from 'next/image';
import { XMarkIcon, PlayIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { Video } from '@/types';

interface AddVideoModalProps {
  isOpen: boolean;
  searchQuery: string;
  searchResults: Video[];
  searching: boolean;
  onClose: () => void;
  onSearchChange: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onAddVideo: (video: Video) => void;
}

export function AddVideoModal({
  isOpen,
  searchQuery,
  searchResults,
  searching,
  onClose,
  onSearchChange,
  onSearch,
  onAddVideo,
}: AddVideoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Add Video</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <XMarkIcon className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={onSearch} className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search for videos..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-pink-500"
            />
          </form>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {searching ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Search for videos to add</div>
            ) : (
              searchResults.map(video => (
                <button
                  key={video.id}
                  onClick={() => onAddVideo(video)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition"
                >
                  <div className="w-20 aspect-video bg-gray-800 rounded overflow-hidden flex-shrink-0">
                    {video.thumbnailUrl ? (
                      <Image src={video.thumbnailUrl} alt="" width={160} height={90} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PlayIcon className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm text-white truncate">{video.title || video.caption}</div>
                    <div className="text-xs text-gray-400">@{video.username}</div>
                  </div>
                  <PlusIcon className="w-5 h-5 text-pink-400" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
