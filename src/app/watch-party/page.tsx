'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PlusIcon,
  TvIcon,
  UserGroupIcon,
  LockClosedIcon,
  PlayIcon,
  PauseIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { collaborationApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import type { WatchParty, WatchPartyStatus } from '@/types/collaboration';

const STATUS_CONFIG: Record<WatchPartyStatus, { label: string; color: string }> = {
  waiting: { label: 'Waiting', color: 'bg-yellow-500' },
  playing: { label: 'Playing', color: 'bg-green-500' },
  paused: { label: 'Paused', color: 'bg-blue-500' },
  ended: { label: 'Ended', color: 'bg-gray-500' },
};

export default function WatchPartiesPage() {
  const router = useRouter();

  // Use Zustand selectors to avoid re-render loops
  const isAuthVerified = useAuthStore((s) => s.isAuthVerified);

  // State
  const [parties, setParties] = useState<WatchParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createIsPrivate, setCreateIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Refs to prevent duplicate fetches
  const hasFetchedRef = useRef(false);
  const isMountedRef = useRef(true);

  // Fetch parties
  const fetchParties = useCallback(async (pageNum: number = 1) => {
    try {
      const data = await collaborationApi.getWatchParties(pageNum);
      if (!isMountedRef.current) return;

      if (pageNum === 1) {
        setParties(data.parties);
      } else {
        setParties(prev => [...prev, ...data.parties]);
      }
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to fetch watch parties:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Initial fetch - wait for auth verification
  useEffect(() => {
    isMountedRef.current = true;

    // Wait for auth to be verified before fetching
    if (!isAuthVerified) return;

    // Only fetch once
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetchParties(1);

    return () => {
      isMountedRef.current = false;
    };
  }, [isAuthVerified, fetchParties]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchParties(nextPage);
  }, [page, fetchParties]);

  const handleCreateParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim() || creating) return;

    setCreating(true);
    try {
      const party = await collaborationApi.createWatchParty({
        title: createTitle.trim(),
        isPrivate: createIsPrivate,
      });
      setShowCreateModal(false);
      setCreateTitle('');
      setCreateIsPrivate(false);
      router.push(`/watch-party/${party.id}`);
    } catch (error) {
      console.error('Failed to create watch party:', error);
      alert('Failed to create watch party. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/feed" className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">Watch Parties</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-medium text-sm hover:opacity-90 transition"
          >
            <PlusIcon className="w-4 h-4" />
            Create Party
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Explainer Section */}
        <div className="mb-8 p-6 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <TvIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Watch Videos Together in Real-Time</h2>
              <p className="text-gray-400 mb-3">
                Sync up with friends and watch the same videos at the same time. Chat, react with emojis,
                and share the experience - no matter where everyone is located.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm">Live sync</span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">Group chat</span>
                <span className="px-3 py-1 bg-fuchsia-500/20 text-fuchsia-400 rounded-full text-sm">React together</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : parties.length === 0 ? (
          <div className="text-center py-20">
            <TvIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold mb-2">No watch parties</h2>
            <p className="text-gray-400 mb-6">
              Be the first to create a watch party!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-medium hover:opacity-90 transition"
            >
              Create Watch Party
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {parties.map(party => {
              const statusConfig = STATUS_CONFIG[party.status];

              return (
                <Link
                  key={party.id}
                  href={`/watch-party/${party.id}`}
                  className="bg-white/5 hover:bg-white/10 rounded-2xl overflow-hidden transition group"
                >
                  {/* Preview Thumbnails */}
                  <div className="aspect-video bg-gray-800 relative">
                    {party.playlist.length > 0 && party.playlist[0].videoThumbnail ? (
                      <img
                        src={party.playlist[0].videoThumbnail}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <TvIcon className="w-12 h-12 text-gray-600" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <div className={`flex items-center gap-1.5 px-2 py-1 ${statusConfig.color} rounded-full text-xs font-medium`}>
                        {party.status === 'playing' && <PlayIcon className="w-3 h-3" />}
                        {party.status === 'paused' && <PauseIcon className="w-3 h-3" />}
                        {party.status === 'waiting' && <ClockIcon className="w-3 h-3" />}
                        {statusConfig.label}
                      </div>
                    </div>

                    {party.isPrivate && (
                      <div className="absolute top-3 right-3">
                        <LockClosedIcon className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}

                    {/* Participant Count */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-black/60 rounded-full text-xs">
                      <UserGroupIcon className="w-3 h-3" />
                      {party.participants.length}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold mb-2 group-hover:text-pink-400 transition line-clamp-1">
                      {party.title}
                    </h3>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden">
                        {party.hostAvatar ? (
                          <img src={party.hostAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                            {party.hostUsername[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{party.hostUsername}</div>
                        <div className="text-xs text-gray-400">Host</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{party.playlist.length} videos</span>
                      <span>{new Date(party.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Participant avatars */}
                    {party.participants.length > 0 && (
                      <div className="flex -space-x-2 mt-3">
                        {party.participants.slice(0, 5).map((p, i) => (
                          <div
                            key={p.userId}
                            className="w-6 h-6 rounded-full border-2 border-black bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden"
                            style={{ zIndex: 5 - i }}
                          >
                            {p.avatar ? (
                              <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                                {p.username[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                        ))}
                        {party.participants.length > 5 && (
                          <div className="w-6 h-6 rounded-full border-2 border-black bg-gray-700 flex items-center justify-center text-[10px]">
                            +{party.participants.length - 5}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-medium transition"
            >
              Load More
            </button>
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create Watch Party</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <PlusIcon className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreateParty} className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Party Name *</label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="Give your party a name..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">Private Party</div>
                  <div className="text-sm text-gray-400">Only invited people can join</div>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateIsPrivate(!createIsPrivate)}
                  className={`w-12 h-6 rounded-full transition ${
                    createIsPrivate ? 'bg-pink-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      createIsPrivate ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <button
                type="submit"
                disabled={!createTitle.trim() || creating}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
              >
                {creating ? 'Creating...' : 'Create Party'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
