'use client';

import { PlusIcon } from '@heroicons/react/24/outline';

interface CreatePartyModalProps {
  isOpen: boolean;
  title: string;
  isPrivate: boolean;
  isCreating: boolean;
  onTitleChange: (title: string) => void;
  onPrivateChange: (isPrivate: boolean) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreatePartyModal({
  isOpen,
  title,
  isPrivate,
  isCreating,
  onTitleChange,
  onPrivateChange,
  onClose,
  onSubmit,
}: CreatePartyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create Watch Party</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition" aria-label="Close">
            <PlusIcon className="w-5 h-5 rotate-45" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Party Name *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Give your party a name..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="font-medium">Private Party</div>
              <div className="text-sm text-gray-400">Only invited people can join</div>
            </div>
            <button
              type="button"
              onClick={() => onPrivateChange(!isPrivate)}
              className={`w-12 h-6 rounded-full transition ${isPrivate ? 'bg-pink-500' : 'bg-white/20'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <button
            type="submit"
            disabled={!title.trim() || isCreating}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
          >
            {isCreating ? 'Creating...' : 'Create Party'}
          </button>
        </form>
      </div>
    </div>
  );
}
