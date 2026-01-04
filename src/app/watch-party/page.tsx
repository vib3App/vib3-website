'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, TvIcon } from '@heroicons/react/24/outline';
import { collaborationApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { WatchPartyCard, CreatePartyModal } from '@/components/watch-party';
import type { WatchParty } from '@/types/collaboration';

export default function WatchPartiesPage() {
  const router = useRouter();
  const isAuthVerified = useAuthStore((s) => s.isAuthVerified);

  const [parties, setParties] = useState<WatchParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createIsPrivate, setCreateIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  const hasFetchedRef = useRef(false);
  const isMountedRef = useRef(true);

  const fetchParties = useCallback(async (pageNum: number = 1) => {
    try {
      const data = await collaborationApi.getWatchParties(pageNum);
      if (!isMountedRef.current) return;
      if (pageNum === 1) setParties(data.parties);
      else setParties(prev => [...prev, ...data.parties]);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to fetch watch parties:', error);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    if (!isAuthVerified) return;
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchParties(1);
    return () => { isMountedRef.current = false; };
  }, [isAuthVerified, fetchParties]);

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
      const party = await collaborationApi.createWatchParty({ title: createTitle.trim(), isPrivate: createIsPrivate });
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
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/feed" className="p-2 hover:bg-white/10 rounded-full transition"><ArrowLeftIcon className="w-5 h-5" /></Link>
            <h1 className="text-xl font-bold">Watch Parties</h1>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-medium text-sm hover:opacity-90 transition">
            <PlusIcon className="w-4 h-4" />Create Party
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <ExplainerSection />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : parties.length === 0 ? (
          <EmptyState onCreateClick={() => setShowCreateModal(true)} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {parties.map(party => <WatchPartyCard key={party.id} party={party} />)}
          </div>
        )}

        {hasMore && (
          <div className="mt-8 text-center">
            <button onClick={handleLoadMore} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-medium transition">Load More</button>
          </div>
        )}
      </main>

      <CreatePartyModal
        isOpen={showCreateModal}
        title={createTitle}
        isPrivate={createIsPrivate}
        isCreating={creating}
        onTitleChange={setCreateTitle}
        onPrivateChange={setCreateIsPrivate}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateParty}
      />
    </div>
  );
}

function ExplainerSection() {
  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-2xl">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0">
          <TvIcon className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">Watch Videos Together in Real-Time</h2>
          <p className="text-gray-400 mb-3">
            Sync up with friends and watch the same videos at the same time. Chat, react with emojis, and share the experience - no matter where everyone is located.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm">Live sync</span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">Group chat</span>
            <span className="px-3 py-1 bg-fuchsia-500/20 text-fuchsia-400 rounded-full text-sm">React together</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="text-center py-20">
      <TvIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
      <h2 className="text-xl font-semibold mb-2">No watch parties</h2>
      <p className="text-gray-400 mb-6">Be the first to create a watch party!</p>
      <button onClick={onCreateClick} className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-medium hover:opacity-90 transition">
        Create Watch Party
      </button>
    </div>
  );
}
