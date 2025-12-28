'use client';

import { EyeIcon, BellIcon } from '@heroicons/react/24/outline';

interface CapsuleAdvancedOptionsProps {
  previewEnabled: boolean;
  previewSeconds: number;
  notifyOnUnlock: boolean;
  onPreviewEnabledChange: (value: boolean) => void;
  onPreviewSecondsChange: (value: number) => void;
  onNotifyOnUnlockChange: (value: boolean) => void;
}

export function CapsuleAdvancedOptions({
  previewEnabled,
  previewSeconds,
  notifyOnUnlock,
  onPreviewEnabledChange,
  onPreviewSecondsChange,
  onNotifyOnUnlockChange,
}: CapsuleAdvancedOptionsProps) {
  return (
    <div className="bg-white/5 rounded-xl p-4 space-y-4">
      <h3 className="font-medium text-white">Advanced Options</h3>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <EyeIcon className="w-5 h-5 text-gray-400" />
          <div>
            <div className="font-medium text-white">Enable Preview</div>
            <div className="text-sm text-gray-400">Show first few seconds before unlock</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onPreviewEnabledChange(!previewEnabled)}
          className={`w-12 h-6 rounded-full transition ${previewEnabled ? 'bg-purple-500' : 'bg-white/20'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${previewEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {previewEnabled && (
        <div className="ml-8">
          <label className="block text-sm text-gray-400 mb-2">Preview length (seconds)</label>
          <input
            type="range"
            min={1}
            max={10}
            value={previewSeconds}
            onChange={(e) => onPreviewSecondsChange(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
          <div className="text-center text-sm text-gray-400">{previewSeconds} seconds</div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BellIcon className="w-5 h-5 text-gray-400" />
          <div>
            <div className="font-medium text-white">Notify on Unlock</div>
            <div className="text-sm text-gray-400">Send notification when capsule unlocks</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNotifyOnUnlockChange(!notifyOnUnlock)}
          className={`w-12 h-6 rounded-full transition ${notifyOnUnlock ? 'bg-purple-500' : 'bg-white/20'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${notifyOnUnlock ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>
    </div>
  );
}
