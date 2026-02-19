'use client';

import Image from 'next/image';

interface StoryAvatarProps {
  username: string;
  avatar?: string;
  hasUnviewed: boolean;
  isOwn?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function StoryAvatar({ username, avatar, hasUnviewed, isOwn, size = 'md', onClick }: StoryAvatarProps) {
  const sizes = { sm: 'w-12 h-12', md: 'w-16 h-16', lg: 'w-20 h-20' };
  const ringSize = { sm: 'p-0.5', md: 'p-[2px]', lg: 'p-[3px]' };
  const textSize = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' };

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 w-[72px] shrink-0">
      <div className={`rounded-full ${ringSize[size]} ${
        hasUnviewed
          ? 'bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400'
          : 'bg-white/20'
      }`}>
        <div className={`${sizes[size]} rounded-full overflow-hidden bg-black ring-2 ring-black relative`}>
          {avatar ? (
            <Image src={avatar} alt={username} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white font-bold">
              {username[0]?.toUpperCase()}
            </div>
          )}
          {isOwn && (
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-purple-500 rounded-full border-2 border-black flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          )}
        </div>
      </div>
      <span className={`${textSize[size]} text-white/70 truncate w-full text-center`}>
        {isOwn ? 'Your story' : username}
      </span>
    </button>
  );
}
