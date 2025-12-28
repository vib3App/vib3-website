'use client';

import { XCircleIcon } from '@heroicons/react/24/outline';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  maxParticipants: number;
  setMaxParticipants: (max: number) => void;
  isPrivate: boolean;
  setIsPrivate: (isPrivate: boolean) => void;
  creating: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreateRoomModal({
  isOpen,
  onClose,
  title,
  setTitle,
  description,
  setDescription,
  maxParticipants,
  setMaxParticipants,
  isPrivate,
  setIsPrivate,
  creating,
  onSubmit,
}: CreateRoomModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create Collab Room</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <XCircleIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's this collab about?"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell collaborators what to expect..."
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Max Participants</label>
            <select
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
            >
              {[2, 3, 4, 5, 6, 8, 10].map(n => (
                <option key={n} value={n}>{n} participants</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium">Private Room</div>
              <div className="text-sm text-gray-400">Only people with the code can join</div>
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`w-12 h-6 rounded-full transition ${isPrivate ? 'bg-pink-500' : 'bg-white/20'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <button
            type="submit"
            disabled={!title.trim() || creating}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
          >
            {creating ? 'Creating...' : 'Create Room'}
          </button>
        </form>
      </div>
    </div>
  );
}
