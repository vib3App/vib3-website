'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { useAuthStore } from '@/stores/authStore';
import { useSocialStore } from '@/stores/socialStore';
import { searchApi } from '@/services/api';
import type { SearchUser } from '@/services/api/search';
import { logger } from '@/utils/logger';

export default function AddFriendsPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const { isFollowing, followUser, unfollowUser } = useSocialStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [followLoading, setFollowLoading] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || query.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const users = await searchApi.searchUsers(query.trim());
      setResults(users || []);
    } catch (err) {
      logger.error('Search failed:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleFollow = useCallback(async (userId: string) => {
    setFollowLoading(userId);
    try {
      if (isFollowing(userId)) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
    } catch (err) {
      logger.error('Follow/unfollow failed:', err);
    } finally {
      setFollowLoading(null);
    }
  }, [isFollowing, followUser, unfollowUser]);

  if (!isAuthVerified) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login?redirect=/add-friends');
    return null;
  }

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
            <h1 className="text-xl font-bold text-white">Find Friends</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4">
          <div className="glass-card rounded-2xl p-6 mb-6">
            <p className="text-white/70 text-sm mb-4">
              Search by username, email, or phone number to find friends on VIB3.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by username, email, or phone..."
                className="flex-1 bg-white/10 text-white placeholder:text-white/40 rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-purple-500/50 transition"
              />
              <button
                onClick={handleSearch}
                disabled={loading || query.trim().length < 2}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-xl font-medium text-sm disabled:opacity-50 transition"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-white/50">No users found for &quot;{query}&quot;</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2">
              {results.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  following={isFollowing(user.id)}
                  followLoading={followLoading === user.id}
                  onFollow={() => handleFollow(user.id)}
                  onProfile={() => router.push(`/profile/${user.id}`)}
                />
              ))}
            </div>
          )}

          {!searched && (
            <SuggestedFriends
              isFollowing={isFollowing}
              followLoading={followLoading}
              onFollow={handleFollow}
            />
          )}

          <div className="mt-8 glass-card rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-3">Share your profile</h3>
            <p className="text-white/50 text-sm mb-4">Invite friends to follow you on VIB3</p>
            <Link
              href="/profile"
              className="inline-block px-6 py-2.5 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full text-sm font-medium hover:opacity-90 transition"
            >
              View My Profile
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function SuggestedFriends({ isFollowing, followLoading, onFollow }: {
  isFollowing: (id: string) => boolean;
  followLoading: string | null;
  onFollow: (id: string) => void;
}) {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<SearchUser[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const users = await searchApi.searchUsers('');
        if (!cancelled) setSuggestions(users?.slice(0, 10) || []);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoadingSuggestions(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <h3 className="text-white font-semibold mb-3">Suggested Friends</h3>
      {loadingSuggestions ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-white/50 mb-2">Find your friends on VIB3</p>
          <p className="text-white/30 text-sm">Search by username, email, or phone above</p>
        </div>
      ) : (
        <div className="space-y-2">
          {suggestions.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              following={isFollowing(user.id)}
              followLoading={followLoading === user.id}
              onFollow={() => onFollow(user.id)}
              onProfile={() => router.push(`/profile/${user.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UserCard({ user, following, followLoading, onFollow, onProfile }: {
  user: SearchUser;
  following: boolean;
  followLoading: boolean;
  onFollow: () => void;
  onProfile: () => void;
}) {
  return (
    <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
      <button onClick={onProfile} className="shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-teal-400 p-0.5">
          <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900">
            {user.avatar ? (
              <Image src={user.avatar} alt={user.username} width={48} height={48} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                {user.username[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </button>
      <button onClick={onProfile} className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-white font-medium text-sm truncate">{user.displayName || user.username}</span>
          {user.isVerified && (
            <svg className="w-4 h-4 text-purple-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <span className="text-white/50 text-xs">@{user.username}</span>
      </button>
      <button
        onClick={onFollow}
        disabled={followLoading}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
          following
            ? 'bg-white/10 text-white/70 hover:bg-white/20'
            : 'bg-gradient-to-r from-purple-500 to-teal-400 text-white hover:opacity-90'
        } disabled:opacity-50`}
      >
        {followLoading ? '...' : following ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}
