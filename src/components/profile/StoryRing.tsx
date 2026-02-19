'use client';

import { useState } from 'react';
import Image from 'next/image';

interface StoryRingProps {
  avatar?: string;
  username: string;
  hasActiveStories: boolean;
  allViewed?: boolean;
  isCloseFriend?: boolean;
  size?: number;
  onClick?: () => void;
}

/**
 * Gap #62: Profile Story Ring
 * Gradient ring around profile avatar when user has active stories.
 * Purple/pink for regular, green for close friends, gray if all viewed.
 */
export function StoryRing({
  avatar,
  username,
  hasActiveStories,
  allViewed = false,
  isCloseFriend = false,
  size = 80,
  onClick,
}: StoryRingProps) {
  const ringColor = !hasActiveStories
    ? 'bg-white/20'
    : isCloseFriend
      ? 'bg-gradient-to-tr from-green-400 to-green-600'
      : allViewed
        ? 'bg-white/30'
        : 'bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400';

  const padding = size >= 80 ? 3 : 2;

  return (
    <button
      onClick={onClick}
      className={`rounded-full ${ringColor} shrink-0`}
      style={{ padding }}
      aria-label={hasActiveStories ? `View ${username}'s stories` : `${username}'s profile picture`}
    >
      <div
        className="rounded-full overflow-hidden bg-black ring-2 ring-black relative"
        style={{ width: size, height: size }}
      >
        {avatar ? (
          <Image src={avatar} alt={username} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white font-bold"
            style={{ fontSize: size * 0.35 }}>
            {username[0]?.toUpperCase()}
          </div>
        )}
      </div>
    </button>
  );
}
