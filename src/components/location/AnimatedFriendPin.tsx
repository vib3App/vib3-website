'use client';

import Image from 'next/image';
import type { FriendLocation, LocationSettings } from '@/types/location';

interface AnimatedFriendPinProps {
  friend: FriendLocation;
  onClick?: () => void;
  settings?: Pick<LocationSettings, 'markerStyle' | 'markerSize' | 'showActivityOnMarker'>;
}

const SIZE_MAP = {
  small: { avatar: 32, text: '10px', pin: 6 },
  medium: { avatar: 40, text: '12px', pin: 8 },
  large: { avatar: 48, text: '13px', pin: 10 },
};

function getActivityAnimation(activity?: string): string {
  switch (activity) {
    case 'moving': return 'animate-bounce-slow';
    case 'idle': return '';
    default: return '';
  }
}

function getActivityIndicator(activity?: string): string | null {
  switch (activity) {
    case 'moving': return '🚶';
    case 'idle': return '💤';
    default: return null;
  }
}

export function AnimatedFriendPin({ friend, onClick, settings }: AnimatedFriendPinProps) {
  const style = settings?.markerStyle || 'default';
  const sizeKey = settings?.markerSize || 'medium';
  const showActivity = settings?.showActivityOnMarker !== false;
  const size = SIZE_MAP[sizeKey];
  const activityAnim = getActivityAnimation(friend.activityStatus);
  const activityIcon = showActivity ? getActivityIndicator(friend.activityStatus) : null;

  if (style === 'minimal') {
    return (
      <button onClick={onClick} className={`flex flex-col items-center group ${activityAnim}`} title={`@${friend.username}`}>
        <div
          className={`rounded-full ${friend.isOnline ? 'bg-green-400' : 'bg-white/30'} shadow-lg`}
          style={{ width: size.pin * 2, height: size.pin * 2 }}
        />
        <span className="text-white font-medium drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: size.text }}>
          @{friend.username}
        </span>
      </button>
    );
  }

  if (style === 'bubble') {
    return (
      <button onClick={onClick} className={`flex flex-col items-center group ${activityAnim}`} title={`@${friend.username}`}>
        <div className="relative">
          <div className="glass rounded-full px-3 py-1.5 flex items-center gap-2 border border-white/10 group-hover:scale-105 transition-transform">
            <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: size.avatar * 0.6, height: size.avatar * 0.6 }}>
              {friend.avatar ? (
                <Image src={friend.avatar} alt={friend.username} width={size.avatar} height={size.avatar} className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white font-bold" style={{ fontSize: size.text }}>
                  {friend.username[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-white font-medium" style={{ fontSize: size.text }}>@{friend.username}</span>
            {friend.isOnline && <div className="w-2 h-2 bg-green-400 rounded-full" />}
          </div>
          {activityIcon && (
            <span className="absolute -top-2 -right-2 text-sm">{activityIcon}</span>
          )}
        </div>
      </button>
    );
  }

  // Default and avatar styles
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-0.5 group ${activityAnim}`} title={`@${friend.username}`}>
      <div className="relative">
        {/* Pulse ring for online friends */}
        {friend.isOnline && (
          <div
            className="absolute inset-0 rounded-full animate-pulse-ring"
            style={{
              border: '2px solid rgba(74, 222, 128, 0.4)',
              margin: '-4px',
            }}
          />
        )}
        <div
          className={`rounded-full overflow-hidden border-2 ${
            friend.isFavorite ? 'border-yellow-400 shadow-yellow-400/30' :
            friend.isOnline ? 'border-green-400' : 'border-white/30'
          } shadow-lg group-hover:scale-110 transition-transform`}
          style={{ width: size.avatar, height: size.avatar }}
        >
          {friend.avatar ? (
            <Image src={friend.avatar} alt={friend.username} width={size.avatar} height={size.avatar} className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white font-bold" style={{ fontSize: size.text }}>
              {friend.username[0]?.toUpperCase()}
            </div>
          )}
        </div>
        {activityIcon && (
          <span className="absolute -top-1 -right-1 text-xs bg-black/50 rounded-full w-5 h-5 flex items-center justify-center">{activityIcon}</span>
        )}
        {friend.isFavorite && !activityIcon && (
          <span className="absolute -top-1 -right-1 text-xs text-yellow-400">★</span>
        )}
      </div>
      <span className="text-white font-medium drop-shadow-lg" style={{ fontSize: size.text }}>@{friend.username}</span>
      <div className="w-2 h-2 bg-white rounded-full -mt-0.5 shadow-lg" />
    </button>
  );
}
