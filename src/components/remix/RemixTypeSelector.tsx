'use client';

import {
  MicrophoneIcon,
  ArrowsRightLeftIcon,
  ScissorsIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import type { RemixType } from '@/types/collaboration';

interface RemixPermissions {
  allowEcho: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  allowRemix: boolean;
}

const REMIX_TYPES: Record<RemixType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  echo: { label: 'Echo', icon: MicrophoneIcon },
  duet: { label: 'Duet', icon: ArrowsRightLeftIcon },
  stitch: { label: 'Stitch', icon: ScissorsIcon },
  remix: { label: 'Remix', icon: ArrowPathIcon },
};

interface RemixTypeSelectorProps {
  remixType: RemixType;
  permissions: RemixPermissions;
  onSelect: (type: RemixType) => void;
}

export function RemixTypeSelector({ remixType, permissions, onSelect }: RemixTypeSelectorProps) {
  return (
    <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
      {(Object.entries(REMIX_TYPES) as [RemixType, typeof REMIX_TYPES[RemixType]][]).map(([type, config]) => {
        const isAllowed = permissions[`allow${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof RemixPermissions];
        const Icon = config.icon;

        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            disabled={!isAllowed}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
              remixType === type
                ? 'bg-pink-500 text-white'
                : isAllowed
                ? 'bg-white/10 hover:bg-white/20'
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Icon className="w-4 h-4" />
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
