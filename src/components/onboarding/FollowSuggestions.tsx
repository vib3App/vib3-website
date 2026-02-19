'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { apiClient } from '@/services/api/client';
import { logger } from '@/utils/logger';

interface SuggestedCreator {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  followerCount: number;
  videoCount: number;
}

interface FollowSuggestionsProps {
  interests: string[];
  followedUsers: string[];
  onFollow: (userId: string) => void;
}

export function FollowSuggestions({ interests, followedUsers, onFollow }: FollowSuggestionsProps) {
  const [creators, setCreators] = useState<SuggestedCreator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await apiClient.get('/users/suggested', { params: { interests: interests.join(','), limit: 12 } });
        setCreators(data.users || data || []);
      } catch (err) {
        logger.error('Failed to load suggestions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [interests]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-white/10 mx-auto mb-3" />
            <div className="h-4 bg-white/10 rounded w-3/4 mx-auto mb-2" />
            <div className="h-3 bg-white/5 rounded w-1/2 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {creators.map(creator => {
        const isFollowed = followedUsers.includes(creator.id);
        return (
          <div key={creator.id} className="glass-card rounded-xl p-4 text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3">
              {creator.avatar ? (
                <Image src={creator.avatar} alt={creator.username} width={64} height={64} className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white font-bold text-xl">
                  {creator.username[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <p className="text-white font-medium text-sm truncate">
              {creator.displayName || creator.username}
            </p>
            <p className="text-white/40 text-xs mb-1">@{creator.username}</p>
            <p className="text-white/30 text-xs mb-3">
              {creator.followerCount.toLocaleString()} followers
            </p>
            <button
              onClick={() => onFollow(creator.id)}
              disabled={isFollowed}
              className={`w-full py-2 text-sm font-medium rounded-lg transition ${
                isFollowed
                  ? 'bg-white/10 text-white/40'
                  : 'bg-gradient-to-r from-purple-500 to-teal-500 text-white hover:from-purple-600 hover:to-teal-600'
              }`}
            >
              {isFollowed ? 'Following' : 'Follow'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
