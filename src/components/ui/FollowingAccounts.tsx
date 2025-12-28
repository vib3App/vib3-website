'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';

interface FollowingUser {
  id: string;
  username: string;
  displayName: string;
  profilePicture?: string;
  isLive?: boolean;
}

export function FollowingAccounts() {
  const { isAuthenticated } = useAuthStore();
  const [following, setFollowing] = useState<FollowingUser[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadFollowing();
    }
  }, [isAuthenticated]);

  const loadFollowing = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockFollowing: FollowingUser[] = [
        { id: '1', username: 'creator1', displayName: 'Top Creator', isLive: true },
        { id: '2', username: 'musicpro', displayName: 'Music Pro' },
        { id: '3', username: 'dancer99', displayName: 'Dance Queen', isLive: true },
        { id: '4', username: 'comedian', displayName: 'Funny Guy' },
        { id: '5', username: 'artist_x', displayName: 'Artist X' },
        { id: '6', username: 'gamer_z', displayName: 'Gamer Z' },
        { id: '7', username: 'chef_master', displayName: 'Chef Master' },
        { id: '8', username: 'fitness_guru', displayName: 'Fitness Guru' },
      ];
      setFollowing(mockFollowing);
    } catch (error) {
      console.error('Failed to load following:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayedUsers = isExpanded ? following : following.slice(0, 5);
  const hasMore = following.length > 5;

  if (!isAuthenticated) {
    return (
      <div className="px-3 py-4">
        <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-3">
          Following
        </p>
        <p className="text-white/50 text-sm">
          <Link href="/login" className="text-amber-500 hover:text-amber-400">
            Log in
          </Link>{' '}
          to see accounts you follow
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-3 py-4">
        <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-3">
          Following
        </p>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-white/10" />
              <div className="flex-1">
                <div className="h-3 bg-white/10 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (following.length === 0) {
    return (
      <div className="px-3 py-4">
        <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-3">
          Following
        </p>
        <p className="text-white/50 text-sm">
          You&apos;re not following anyone yet.{' '}
          <Link href="/discover" className="text-amber-500 hover:text-amber-400">
            Discover creators
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="px-3 py-4">
      <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-3">
        Following
      </p>
      <div className="space-y-1">
        {displayedUsers.map((user) => (
          <Link
            key={user.id}
            href={`/profile/${user.username}`}
            className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <div className="relative">
              <div className={`w-8 h-8 rounded-full overflow-hidden ${
                user.isLive ? 'ring-2 ring-red-500 ring-offset-1 ring-offset-neutral-900' : ''
              }`}>
                {user.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt={user.username}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              {user.isLive && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-bold px-1 rounded">
                  LIVE
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-sm truncate group-hover:text-white transition-colors">
                {user.username}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-2 py-2 text-sm text-amber-500 hover:text-amber-400 transition-colors flex items-center justify-center gap-1"
        >
          {isExpanded ? (
            <>
              Show less
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </>
          ) : (
            <>
              See {following.length - 5} more
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
}
