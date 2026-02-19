'use client';

import type { ActivityStatus } from '@/hooks/useActivityDetection';

interface ActivityIndicatorProps {
  activity: ActivityStatus;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const ACTIVITY_CONFIG: Record<ActivityStatus, { icon: React.ReactNode; label: string; color: string }> = {
  stationary: {
    label: 'Stationary',
    color: 'text-white/50',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  walking: {
    label: 'Walking',
    color: 'text-green-400',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  driving: {
    label: 'Driving',
    color: 'text-blue-400',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
};

/**
 * Gap #55: Activity status icon for friend markers on the map.
 * Shows walking, driving, or stationary icon.
 */
export function ActivityIndicator({ activity, size = 'sm', showLabel = false }: ActivityIndicatorProps) {
  const config = ACTIVITY_CONFIG[activity];
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className={`flex items-center gap-1 ${config.color}`} title={config.label}>
      <div className={sizeClass}>
        {config.icon}
      </div>
      {showLabel && (
        <span className="text-xs font-medium">{config.label}</span>
      )}
    </div>
  );
}

/** Compact badge for friend markers on the map */
export function ActivityBadge({ activity }: { activity?: ActivityStatus | string }) {
  if (!activity || activity === 'stationary' || activity === 'idle') return null;

  const isWalking = activity === 'walking' || activity === 'moving';
  const isDriving = activity === 'driving';

  if (!isWalking && !isDriving) return null;

  return (
    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-neutral-900 ${
      isDriving ? 'bg-blue-500' : 'bg-green-500'
    }`}>
      {isDriving ? (
        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ) : (
        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )}
    </div>
  );
}
