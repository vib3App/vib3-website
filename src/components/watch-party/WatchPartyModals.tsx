'use client';

import Image from 'next/image';
import { PlayIcon, PlusIcon, XMarkIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

interface ShareModalProps {
  isOpen: boolean;
  inviteCode?: string;
  copied: boolean;
  onClose: () => void;
  onCopyCode: () => void;
  onCopyLink: () => void;
}

export function ShareModal({
  isOpen,
  inviteCode,
  copied,
  onClose,
  onCopyCode,
  onCopyLink,
}: ShareModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm bg-gray-900 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Share Party</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {inviteCode && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Invite Code</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-3 bg-black/50 rounded-lg text-xl tracking-widest font-mono text-center">
                  {inviteCode}
                </code>
                <button
                  onClick={onCopyCode}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
                >
                  {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={onCopyLink}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition"
          >
            {copied ? 'Link Copied!' : 'Copy Share Link'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface AddVideoModalProps {
  isOpen: boolean;
  searchQuery: string;
  searchResults: Array<{ id: string; title: string; thumbnail?: string }>;
  searching: boolean;
  onClose: () => void;
  onSearchChange: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onAddVideo: (videoId: string) => void;
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
          <h2 className="text-lg font-semibold">Add Video</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={onSearch} className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search for videos..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
            />
          </form>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {searching ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Search for videos to add
              </div>
            ) : (
              searchResults.map((video) => (
                <button
                  key={video.id}
                  onClick={() => onAddVideo(video.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition"
                >
                  <div className="w-16 aspect-video bg-gray-800 rounded overflow-hidden flex-shrink-0">
                    {video.thumbnail ? (
                      <Image src={video.thumbnail} alt="" width={128} height={72} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PlayIcon className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm truncate">{video.title}</div>
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
