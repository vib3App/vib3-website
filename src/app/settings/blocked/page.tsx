'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { userApi } from '@/services/api';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';

interface BlockedUser {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  blockedAt: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function BlockedUserCard({
  user,
  onUnblock,
  isUnblocking,
}: {
  user: BlockedUser;
  onUnblock: (userId: string) => void;
  isUnblocking: boolean;
}) {
  return (
    <div className="flex items-center gap-4 p-4 glass-card rounded-xl">
      <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
        {user.avatar ? (
          <Image src={user.avatar} alt={user.username} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg">
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">
          {user.displayName || user.username}
        </p>
        <p className="text-white/50 text-sm">@{user.username}</p>
        <p className="text-white/30 text-xs mt-1">Blocked {formatDate(user.blockedAt)}</p>
      </div>

      <button
        onClick={() => onUnblock(user.id)}
        disabled={isUnblocking}
        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full transition disabled:opacity-50"
      >
        {isUnblocking ? 'Unblocking...' : 'Unblock'}
      </button>
    </div>
  );
}

export default function BlockedUsersPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadBlockedUsers = useCallback(async (pageNum: number, append = false) => {
    try {
      const response = await userApi.getBlockedUsers(pageNum, 50);

      if (append) {
        setUsers(prev => [...prev, ...response.users]);
      } else {
        setUsers(response.users);
      }

      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load blocked users:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthVerified) return;

    if (!isAuthenticated) {
      router.push('/login?redirect=/settings/blocked');
      return;
    }

    loadBlockedUsers(1);
  }, [isAuthenticated, isAuthVerified, router, loadBlockedUsers]);

  const handleUnblock = async (userId: string) => {
    setUnblockingId(userId);
    try {
      await userApi.unblockUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Failed to unblock user:', error);
    } finally {
      setUnblockingId(null);
    }
  };

  if (!isAuthVerified || !isAuthenticated) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />

      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-heavy rounded-b-2xl border-b border-white/10 mx-4 mb-6">
          <div className="flex items-center gap-4 px-4 h-14">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-white">Blocked Users</h1>
              <p className="text-white/50 text-xs">{users.length} blocked</p>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 glass-card rounded-xl animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-white/10" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-32 mb-2" />
                    <div className="h-3 bg-white/10 rounded w-24" />
                  </div>
                  <div className="w-20 h-8 bg-white/10 rounded-full" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-20 h-20 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <h2 className="text-xl font-semibold text-white mb-2">No Blocked Users</h2>
              <p className="text-white/50 max-w-md mx-auto">
                You haven&apos;t blocked anyone yet. Blocked users won&apos;t be able to see your content or message you.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {users.map((user) => (
                  <BlockedUserCard
                    key={user.id}
                    user={user}
                    onUnblock={handleUnblock}
                    isUnblocking={unblockingId === user.id}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => loadBlockedUsers(page + 1, true)}
                    className="px-6 py-3 glass text-white rounded-full hover:bg-white/10 transition"
                  >
                    Load more
                  </button>
                </div>
              )}

              <div className="mt-8 p-4 glass-card rounded-xl">
                <h3 className="text-white font-medium mb-2">About Blocking</h3>
                <ul className="text-white/50 text-sm space-y-2">
                  <li>Blocked users can&apos;t see your profile or videos</li>
                  <li>They can&apos;t send you messages or comments</li>
                  <li>You won&apos;t see their content in your feed</li>
                  <li>Unblocking someone won&apos;t restore previous follows</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
