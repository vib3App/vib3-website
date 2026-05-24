'use client';

import type { PrivacyLevel } from '@/services/api/privacy';

interface PrivacyLevelPickerProps {
  label: string;
  description: string;
  value: PrivacyLevel;
  onChange: (level: PrivacyLevel) => void;
}

const OPTIONS: { id: PrivacyLevel; label: string }[] = [
  { id: 'public', label: 'Everyone' },
  { id: 'friends', label: 'Friends' },
  { id: 'private', label: 'Only me' },
];

export function PrivacyLevelPicker({ label, description, value, onChange }: PrivacyLevelPickerProps) {
  return (
    <div className="px-4 py-3 border-b border-white/10 last:border-b-0">
      <div className="mb-2">
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-white/50">{description}</div>
      </div>
      <div className="flex gap-2">
        {OPTIONS.map(opt => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs transition ${
              value === opt.id
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
