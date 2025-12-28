'use client';

import { LockClosedIcon, GlobeAltIcon, UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface CapsulePrivacySettingsProps {
  isPrivate: boolean;
  recipients: string[];
  recipientInput: string;
  onPrivateChange: (value: boolean) => void;
  onRecipientInputChange: (value: string) => void;
  onAddRecipient: () => void;
  onRemoveRecipient: (username: string) => void;
}

export function CapsulePrivacySettings({
  isPrivate,
  recipients,
  recipientInput,
  onPrivateChange,
  onRecipientInputChange,
  onAddRecipient,
  onRemoveRecipient,
}: CapsulePrivacySettingsProps) {
  return (
    <div className="bg-white/5 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isPrivate ? (
            <LockClosedIcon className="w-5 h-5 text-purple-400" />
          ) : (
            <GlobeAltIcon className="w-5 h-5 text-gray-400" />
          )}
          <div>
            <div className="font-medium text-white">Private Capsule</div>
            <div className="text-sm text-gray-400">
              {isPrivate ? 'Only specific people can view' : 'Anyone can view when unlocked'}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onPrivateChange(!isPrivate)}
          className={`w-12 h-6 rounded-full transition ${isPrivate ? 'bg-purple-500' : 'bg-white/20'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {isPrivate && (
        <div>
          <label className="block text-sm text-gray-400 mb-2">Recipients</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={recipientInput}
              onChange={(e) => onRecipientInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddRecipient())}
              placeholder="Enter username..."
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={onAddRecipient}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition"
            >
              <UserPlusIcon className="w-5 h-5 text-white" />
            </button>
          </div>
          {recipients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipients.map(username => (
                <span key={username} className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 rounded-full text-sm text-white">
                  @{username}
                  <button type="button" onClick={() => onRemoveRecipient(username)} className="hover:text-red-400">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
