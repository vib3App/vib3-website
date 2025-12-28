'use client';

import { XCircleIcon } from '@heroicons/react/24/outline';

interface JoinByCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode: string;
  setInviteCode: (code: string) => void;
  joining: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function JoinByCodeModal({
  isOpen,
  onClose,
  inviteCode,
  setInviteCode,
  joining,
  onSubmit,
}: JoinByCodeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm bg-gray-900 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Join by Invite Code</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <XCircleIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Invite Code</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter code..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500 text-center text-xl tracking-widest font-mono"
              maxLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={!inviteCode.trim() || joining}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
          >
            {joining ? 'Joining...' : 'Join Room'}
          </button>
        </form>
      </div>
    </div>
  );
}
