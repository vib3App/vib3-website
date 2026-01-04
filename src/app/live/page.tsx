'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { liveApi } from '@/services/api';
import type { LiveStream } from '@/types';
import { TopNav } from '@/components/ui/TopNav';
import { LiveStreamCard, WhyGoLiveSection } from '@/components/live';

export default function LivePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'discover' | 'following'>('discover');
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [followingStreams, setFollowingStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const hasLoadedRef = useRef(false);
  const hasErroredRef = useRef(false);

  const loadStreams = useCallback(async (pageNum: number, append = false) => {
    if (hasErroredRef.current && !append) return;
    try {
      const response = await liveApi.getLiveStreams(pageNum);
      if (append) setStreams(prev => [...prev, ...response.streams]);
      else setStreams(response.streams);
      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load streams:', error);
      hasErroredRef.current = true;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFollowingStreams = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await liveApi.getFollowingLive();
      setFollowingStreams(data);
    } catch (error) {
      console.error('Failed to load following streams:', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadStreams(1);
    if (isAuthenticated) loadFollowingStreams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoLive = () => {
    if (!isAuthenticated) { router.push('/login?redirect=/live/start'); return; }
    router.push('/live/start');
  };

  const displayedStreams = activeTab === 'following' ? followingStreams : streams;

  return (
    <div className="min-h-screen aurora-bg">
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8">
        <LiveHeader
          isAuthenticated={isAuthenticated}
          activeTab={activeTab}
          followingCount={followingStreams.length}
          onTabChange={setActiveTab}
          onGoLive={handleGoLive}
        />
        <div className="max-w-4xl mx-auto px-4 py-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : displayedStreams.length === 0 ? (
            <EmptyState activeTab={activeTab} onDiscover={() => setActiveTab('discover')} onGoLive={handleGoLive} />
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                {displayedStreams.map((stream) => <LiveStreamCard key={stream.id} stream={stream} />)}
              </div>
              {hasMore && activeTab === 'discover' && (
                <div className="text-center mt-8">
                  <button onClick={() => loadStreams(page + 1, true)} className="px-6 py-3 glass text-white rounded-full hover:bg-white/10">Load more</button>
                </div>
              )}
            </>
          )}
          {!isLoading && activeTab === 'discover' && displayedStreams.length === 0 && <WhyGoLiveSection />}
        </div>
      </main>
    </div>
  );
}

function LiveHeader({ isAuthenticated, activeTab, followingCount, onTabChange, onGoLive }: { isAuthenticated: boolean; activeTab: string; followingCount: number; onTabChange: (t: 'discover' | 'following') => void; onGoLive: () => void }) {
  return (
    <header className="sticky top-0 z-40">
      <div className="glass-heavy mx-4 mt-3 rounded-2xl">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Link href="/feed" className="p-2 hover:bg-white/10 rounded-full transition"><ArrowLeftIcon className="w-5 h-5" /></Link>
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-50 animate-pulse" />
              <span className="relative w-3 h-3 bg-red-500 rounded-full block" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">LIVE</h1>
          </div>
          <button onClick={onGoLive} className="relative flex items-center gap-2 px-5 py-2 text-white text-sm font-semibold rounded-xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 group-hover:opacity-90 transition-opacity" />
            <svg className="relative w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            <span className="relative">Go Live</span>
          </button>
        </div>
        {isAuthenticated && (
          <div className="flex px-2 pb-2">
            <button onClick={() => onTabChange('discover')} className={`flex-1 py-2 text-sm font-medium relative rounded-xl transition-all ${activeTab === 'discover' ? 'text-white bg-white/10' : 'text-white/50 hover:text-white/80'}`}>Discover</button>
            <button onClick={() => onTabChange('following')} className={`flex-1 py-2 text-sm font-medium relative rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'following' ? 'text-white bg-white/10' : 'text-white/50 hover:text-white/80'}`}>
              Following {followingCount > 0 && <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">{followingCount}</span>}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-video glass rounded-xl mb-3" />
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full glass" />
            <div className="flex-1"><div className="h-4 glass rounded w-3/4 mb-2" /><div className="h-3 glass rounded w-1/2" /></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ activeTab, onDiscover, onGoLive }: { activeTab: string; onDiscover: () => void; onGoLive: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-teal-400/20 flex items-center justify-center">
        <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">{activeTab === 'following' ? 'No One You Follow is Live' : 'No Live Streams'}</h2>
      <p className="text-white/50 mb-8 max-w-md mx-auto">{activeTab === 'following' ? 'Check back later or discover new creators going live now!' : 'Be the first to go live and connect with your audience!'}</p>
      {activeTab === 'following' ? (
        <button onClick={onDiscover} className="inline-flex items-center gap-2 px-8 py-4 glass text-white font-semibold rounded-full hover:bg-white/10">Discover Streams</button>
      ) : (
        <button onClick={onGoLive} className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-teal-400 text-white font-semibold rounded-full hover:opacity-90 transition-opacity">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          Start Streaming
        </button>
      )}
    </div>
  );
}
