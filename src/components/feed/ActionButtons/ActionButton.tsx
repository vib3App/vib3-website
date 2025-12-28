'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ButtonId, ButtonSize } from '@/types/actionButtons';
import { SIZE_INFO } from '@/types/actionButtons';

interface ActionButtonProps {
  id: ButtonId;
  size: ButtonSize;
  isActive?: boolean; // For like/save states
  count?: number;
  thumbnailUrl?: string; // For sound button
  videoId?: string; // For remix link
  onClick?: () => void;
  className?: string;
  showLabel?: boolean;
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

const BUTTON_CONFIG: Record<ButtonId, {
  label: string;
  activeColor?: string;
  inactiveIcon: React.ReactNode;
  activeIcon?: React.ReactNode;
}> = {
  like: {
    label: 'Like',
    activeColor: 'text-red-500',
    inactiveIcon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    activeIcon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  },
  comment: {
    label: 'Comment',
    inactiveIcon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  save: {
    label: 'Save',
    activeColor: 'text-amber-400',
    inactiveIcon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
    activeIcon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
      </svg>
    ),
  },
  share: {
    label: 'Share',
    inactiveIcon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  },
  remix: {
    label: 'Remix',
    inactiveIcon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  sound: {
    label: 'Sound',
    inactiveIcon: null, // Uses thumbnail
  },
};

export function ActionButton({
  id,
  size,
  isActive = false,
  count,
  thumbnailUrl,
  videoId,
  onClick,
  className = '',
  showLabel = false,
}: ActionButtonProps) {
  const config = BUTTON_CONFIG[id];
  const sizeInfo = SIZE_INFO[size];
  const scale = sizeInfo.scale;

  // Compute icon size based on scale
  const iconSize = Math.round(24 * scale);
  const padding = size === 'small' ? 'p-1.5' : size === 'large' ? 'p-3' : 'p-2';

  // Sound button is special - shows spinning thumbnail
  if (id === 'sound') {
    const discSize = Math.round(32 * scale);
    return (
      <div
        className={`rounded-lg overflow-hidden ring-1 ring-white/20 animate-spin flex-shrink-0 ${className}`}
        style={{ width: discSize, height: discSize, animationDuration: '3s' }}
      >
        {thumbnailUrl ? (
          <Image src={thumbnailUrl} alt="Sound" width={discSize} height={discSize} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600" />
        )}
      </div>
    );
  }

  // Remix button is a link
  if (id === 'remix' && videoId) {
    return (
      <Link
        href={`/remix/${videoId}`}
        onClick={(e) => e.stopPropagation()}
        className={`flex items-center gap-2 ${padding} rounded-xl hover:bg-white/10 transition text-white ${className}`}
      >
        <div style={{ width: iconSize, height: iconSize }}>
          {config.inactiveIcon}
        </div>
        {showLabel && <span className="text-sm font-medium">{config.label}</span>}
      </Link>
    );
  }

  // Regular button
  const icon = isActive && config.activeIcon ? config.activeIcon : config.inactiveIcon;
  const colorClass = isActive && config.activeColor ? config.activeColor : 'text-white';

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className={`flex items-center gap-2 ${padding} rounded-xl hover:bg-white/10 transition ${className}`}
    >
      <div className={`${colorClass} transition-transform ${isActive ? 'scale-110' : ''}`} style={{ width: iconSize, height: iconSize }}>
        {icon}
      </div>
      {count !== undefined && (
        <span className="text-white text-sm font-medium">{formatCount(count)}</span>
      )}
      {showLabel && !count && <span className="text-white text-sm font-medium">{config.label}</span>}
    </button>
  );
}

// Settings gear button
export function SettingsButton({
  size,
  onClick,
  className = '',
}: {
  size: ButtonSize;
  onClick: () => void;
  className?: string;
}) {
  const sizeInfo = SIZE_INFO[size];
  const iconSize = Math.round(20 * sizeInfo.scale);
  const padding = size === 'small' ? 'p-1' : size === 'large' ? 'p-2.5' : 'p-1.5';

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`${padding} rounded-full hover:bg-white/20 transition text-white/60 hover:text-white ${className}`}
      title="Customize buttons"
    >
      <svg style={{ width: iconSize, height: iconSize }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>
  );
}
