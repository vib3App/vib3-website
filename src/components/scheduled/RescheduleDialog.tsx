'use client';

import { useState } from 'react';
import type { ScheduledPost } from '@/types/upload';

interface RescheduleDialogProps {
  post: ScheduledPost;
  onClose: () => void;
  onConfirm: (when: Date) => void;
}

function toLocalInputValue(iso: string | undefined): string {
  const fallback = new Date(Date.now() + 60 * 60 * 1000);
  const d = iso ? new Date(iso) : fallback;
  if (Number.isNaN(d.getTime())) return toLocalInputValue(undefined);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function RescheduleDialog({ post, onClose, onConfirm }: RescheduleDialogProps) {
  const [value, setValue] = useState(() => toLocalInputValue(post.scheduledAt));
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    const next = new Date(value);
    if (Number.isNaN(next.getTime())) {
      setError('Pick a valid date and time');
      return;
    }
    if (next.getTime() < Date.now() + 60 * 1000) {
      setError('Pick a time at least a minute from now');
      return;
    }
    onConfirm(next);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-heavy rounded-2xl p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-1">Reschedule post</h2>
        <p className="text-sm text-white/60 mb-5">Pick a new publish time. Times are local to your device.</p>

        <input
          type="datetime-local"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null); }}
          className="w-full glass rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 mb-3 [color-scheme:dark]"
        />
        {error && <div className="text-red-400 text-sm mb-3">{error}</div>}

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-white/60 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-teal-500 text-white font-medium"
          >
            Reschedule
          </button>
        </div>
      </div>
    </div>
  );
}
