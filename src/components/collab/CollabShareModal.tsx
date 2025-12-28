'use client';

import { XMarkIcon, ClipboardIcon } from '@heroicons/react/24/outline';

interface CollabShareModalProps {
  inviteCode?: string;
  copied: boolean;
  onCopyCode: () => void;
  onShareLink: () => void;
  onClose: () => void;
}

export function CollabShareModal({
  inviteCode,
  copied,
  onCopyCode,
  onShareLink,
  onClose,
}: CollabShareModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-sm bg-gray-900 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Share Collab</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
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
                  <ClipboardIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <button
            onClick={onShareLink}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition"
          >
            {copied ? 'Link Copied!' : 'Copy Share Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
