'use client';

import { BentoItem } from './BentoItem';

interface CreatorSpotlightProps {
  creator: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
    followers: string;
    isVerified?: boolean;
  };
}

export function CreatorSpotlight({ creator }: CreatorSpotlightProps) {
  return (
    <BentoItem size="sm" href={`/profile/${creator.id}`}>
      <div className="w-full h-full p-3 flex flex-col items-center justify-center text-center">
        <div className="relative mb-2">
          <img
            src={creator.avatarUrl}
            alt={creator.name}
            className="w-14 h-14 rounded-full border-2 border-purple-500/50"
          />
          {creator.isVerified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
          )}
        </div>
        <p className="font-medium text-sm truncate w-full">{creator.name}</p>
        <p className="text-xs text-white/60">{creator.followers} followers</p>
      </div>
    </BentoItem>
  );
}
