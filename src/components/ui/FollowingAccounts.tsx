'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';
import { useSocialStore } from '@/stores/socialStore';
import { userApi } from '@/services/api/user';
import { liveApi } from '@/services/api/live';

interface FollowingUser {
  id: string;
  username: string;
  displayName: string;
  profilePicture?: string;
  isLive?: boolean;
}

export function FollowingAccounts() {
  const { isAuthenticated, user } = useAuthStore();
  const { loadFollowedUsers, isLoaded: socialLoaded } = useSocialStore();
  const [following, setFollowing] = useState<FollowingUser[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadFollowing = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get real following list and live status in parallel
      const [response, liveStreams] = await Promise.all([
        userApi.getFollowing(user.id, 1, 20),
        liveApi.getFollowingLive().catch(() => []),
      ]);
      const liveUserIds = new Set(
        (liveStreams || []).map((s: { hostId?: string }) => s.hostId).filter(Boolean)
      );
      const followingUsers: FollowingUser[] = (response.users || []).map((u) => ({
        id: u._id,
        username: u.username,
        displayName: u.displayName || u.username,
        profilePicture: u.profilePicture,
        isLive: liveUserIds.has(u._id),
      }));
      // Sort live users to the top
      followingUsers.sort((a, b) => (b.isLive ? 1 : 0) - (a.isLive ? 1 : 0));
      setFollowing(followingUsers);

      // Also ensure social store is loaded
      if (!socialLoaded) {
        loadFollowedUsers();
      }
    } catch (error) {
      console.error('Failed to load following:', error);
      setFollowing([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, socialLoaded, loadFollowedUsers]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadFollowing();
    }
  }, [isAuthenticated, user, loadFollowing]);

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
        {displayedUsers.map((followedUser) => (
          <Link
            key={followedUser.id}
            href={`/profile/${followedUser.id}`}
            className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <div className="relative">
              <div className={`w-8 h-8 rounded-full overflow-hidden ${
                followedUser.isLive ? 'ring-2 ring-red-500 ring-offset-1 ring-offset-neutral-900' : ''
              }`}>
                {followedUser.profilePicture ? (
                  <Image
                    src={followedUser.profilePicture}
                    alt={followedUser.username}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                    {followedUser.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              {followedUser.isLive && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-bold px-1 rounded">
                  LIVE
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-sm truncate group-hover:text-white transition-colors">
                {followedUser.username}
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
