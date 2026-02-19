'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { useAuthStore } from '@/stores/authStore';
import { useSocialStore } from '@/stores/socialStore';
import { userApi } from '@/services/api';
import type { UserProfile } from '@/services/api/user';
import { logger } from '@/utils/logger';

export default function FollowingPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const { isAuthenticated } = useAuthStore();
  const { isFollowing, followUser, unfollowUser } = useSocialStore();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [followLoading, setFollowLoading] = useState<string | null>(null);

  const loadFollowing = useCallback(async (pageNum: number, append = false) => {
    try {
      setLoading(true);
      const result = await userApi.getFollowing(userId, pageNum, 20);
      if (append) {
        setUsers(prev => [...prev, ...result.users]);
      } else {
        setUsers(result.users);
      }
      setHasMore(result.hasMore);
    } catch (err) {
      logger.error('Failed to load following:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadFollowing(1);
  }, [loadFollowing]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadFollowing(next, true);
  };

  const handleFollow = async (targetId: string) => {
    if (!isAuthenticated) { router.push('/login'); return; }
    setFollowLoading(targetId);
    try {
      if (isFollowing(targetId)) {
        await unfollowUser(targetId);
      } else {
        await followUser(targetId);
      }
    } catch (err) {
      logger.error('Follow action failed:', err);
    } finally {
      setFollowLoading(null);
    }
  };

  const filtered = searchQuery
    ? users.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.displayName || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        <header className="sticky top-0 z-40 glass-heavy mx-4 rounded-2xl mb-4">
          <div className="flex items-center gap-3 px-4 h-14">
            <button onClick={() => router.back()} className="text-white/50 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white">Following</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search following..."
            className="w-full bg-white/10 text-white placeholder:text-white/40 rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-purple-500/50 mb-4 transition"
          />

          {loading && users.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-white/50">Not following anyone yet</div>
          ) : (
            <div className="space-y-2">
              {filtered.map((u) => (
                <UserRow
                  key={u._id}
                  user={u}
                  following={isFollowing(u._id)}
                  followLoading={followLoading === u._id}
                  onFollow={() => handleFollow(u._id)}
                  onProfile={() => router.push(`/profile/${u._id}`)}
                />
              ))}
              {hasMore && !searchQuery && (
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="w-full py-3 text-purple-400 text-sm font-medium hover:text-purple-300 transition disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function UserRow({ user, following, followLoading, onFollow, onProfile }: {
  user: UserProfile;
  following: boolean;
  followLoading: boolean;
  onFollow: () => void;
  onProfile: () => void;
}) {
  return (
    <div className="glass-card rounded-xl p-3 flex items-center gap-3">
      <button onClick={onProfile} className="shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-teal-400 p-0.5">
          <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900">
            {user.profilePicture ? (
              <Image src={user.profilePicture} alt={user.username} width={40} height={40} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                {user.username[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </button>
      <button onClick={onProfile} className="flex-1 text-left min-w-0">
        <span className="text-white text-sm font-medium truncate block">{user.displayName || user.username}</span>
        <span className="text-white/50 text-xs">@{user.username}</span>
      </button>
      <button
        onClick={onFollow}
        disabled={followLoading}
        className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
          following ? 'bg-white/10 text-white/70' : 'bg-gradient-to-r from-purple-500 to-teal-400 text-white'
        } disabled:opacity-50`}
      >
        {followLoading ? '...' : following ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}
