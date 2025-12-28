'use client';

import { ClockIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useCapsuleCreate } from '@/hooks/useCapsuleCreate';
import {
  CapsuleHeader,
  CapsuleMediaInput,
  CapsulePrivacySettings,
  CapsuleAdvancedOptions,
} from '@/components/capsule';

export default function CreateCapsulePage() {
  const capsule = useCapsuleCreate();

  return (
    <div className="min-h-screen bg-black text-white">
      <CapsuleHeader />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={capsule.handleSubmit} className="space-y-6">
          {capsule.error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {capsule.error}
            </div>
          )}

          <CapsuleMediaInput
            type="video"
            previewUrl={capsule.videoPreviewUrl}
            inputRef={capsule.fileInputRef}
            onSelect={capsule.handleVideoSelect}
            onClear={capsule.clearVideo}
          />

          <CapsuleMediaInput
            type="cover"
            previewUrl={capsule.coverPreviewUrl}
            inputRef={capsule.coverInputRef}
            onSelect={capsule.handleCoverSelect}
            onClear={capsule.clearCover}
          />

          <div>
            <label className="block text-sm text-gray-400 mb-2">Title *</label>
            <input
              type="text"
              value={capsule.title}
              onChange={(e) => capsule.setTitle(e.target.value)}
              placeholder="Give your capsule a name..."
              maxLength={100}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea
              value={capsule.description}
              onChange={(e) => capsule.setDescription(e.target.value)}
              placeholder="What's in this time capsule?"
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Unlock Date *</label>
              <input
                type="date"
                value={capsule.unlockDate}
                onChange={(e) => capsule.setUnlockDate(e.target.value)}
                min={capsule.minDate}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Unlock Time</label>
              <input
                type="time"
                value={capsule.unlockTime}
                onChange={(e) => capsule.setUnlockTime(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <CapsulePrivacySettings
            isPrivate={capsule.isPrivate}
            recipients={capsule.recipients}
            recipientInput={capsule.recipientInput}
            onPrivateChange={capsule.setIsPrivate}
            onRecipientInputChange={capsule.setRecipientInput}
            onAddRecipient={capsule.addRecipient}
            onRemoveRecipient={capsule.removeRecipient}
          />

          <CapsuleAdvancedOptions
            previewEnabled={capsule.previewEnabled}
            previewSeconds={capsule.previewSeconds}
            notifyOnUnlock={capsule.notifyOnUnlock}
            onPreviewEnabledChange={capsule.setPreviewEnabled}
            onPreviewSecondsChange={capsule.setPreviewSeconds}
            onNotifyOnUnlockChange={capsule.setNotifyOnUnlock}
          />

          <button
            type="submit"
            disabled={capsule.uploading || !capsule.title.trim() || !capsule.unlockDate}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
          >
            {capsule.uploading ? (
              <span className="flex items-center justify-center gap-2">
                <ClockIcon className="w-5 h-5 animate-spin" />
                Sealing Capsule... {capsule.uploadProgress}%
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <LockClosedIcon className="w-5 h-5" />
                Seal Time Capsule
              </span>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
