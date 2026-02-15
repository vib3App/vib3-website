'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ProfileButtonProps {
  username: string;
  userAvatar?: string;
  isFollowing: boolean;
  isOwnVideo: boolean;
  onFollow: () => void;
  onProfile: () => void;
}

export function ProfileButton({
  username,
  userAvatar,
  isFollowing,
  isOwnVideo,
  onFollow,
  onProfile,
}: ProfileButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  if (isOwnVideo) return null;

  return (
    <div className="relative mb-4">
      {/* Profile pill button */}
      <button
        onClick={onProfile}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        className="block transition-transform duration-150"
        style={{ transform: isPressed ? 'scale(1.05)' : 'scale(1)' }}
      >
        <div
          className="w-[54px] h-[78px] rounded-[27px] flex items-center justify-center overflow-hidden relative"
          style={{
            background: userAvatar ? undefined : 'linear-gradient(135deg, #a855f7, #2dd4bf)',
            boxShadow: `
              0 0 12px rgba(168, 85, 247, 0.4),
              2px 2px 16px rgba(45, 212, 191, 0.3)
            `,
          }}
        >
          {userAvatar ? (
            <Image
              src={userAvatar}
              alt={username}
              fill
              className="object-cover"
            />
          ) : (
            <span className="text-white text-2xl font-bold drop-shadow-md">
              {username?.[0]?.toUpperCase() || 'U'}
            </span>
          )}
        </div>
      </button>

      {/* Follow/Unfollow button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onFollow();
        }}
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white transition-colors"
        style={{
          backgroundColor: isFollowing ? '#EF4444' : '#a855f7',
          boxShadow: `0 0 6px ${isFollowing ? 'rgba(239, 68, 68, 0.4)' : 'rgba(168, 85, 247, 0.4)'}`,
        }}
      >
        {isFollowing ? (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </svg>
        ) : (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        )}
      </button>
    </div>
  );
}
