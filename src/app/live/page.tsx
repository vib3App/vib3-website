'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { liveApi } from '@/services/api';
import type { LiveStream } from '@/types';
import { BottomNav } from '@/components/ui/BottomNav';
import { SideNav } from '@/components/ui/SideNav';

function formatViewers(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function LiveStreamCard({ stream }: { stream: LiveStream }) {
  return (
    <Link href={`/live/${stream.id}`} className="block group">
      <div className="relative aspect-video bg-[#1A1F2E] rounded-xl overflow-hidden mb-3">
        {stream.thumbnailUrl ? (
          <Image
            src={stream.thumbnailUrl}
            alt={stream.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/20 to-[#14B8A6]/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </span>
          <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded">
            {formatViewers(stream.viewerCount)} watching
          </span>
        </div>

        {stream.guests.length > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span className="text-white text-xs">{stream.guests.length + 1}</span>
          </div>
        )}
      </div>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1A1F2E] flex-shrink-0 ring-2 ring-red-500">
          {stream.hostAvatar ? (
            <Image src={stream.hostAvatar} alt={stream.hostUsername} width={40} height={40} className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50 font-medium">
              {stream.hostUsername.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium truncate">{stream.title}</h3>
          <p className="text-white/50 text-sm">@{stream.hostUsername}</p>
        </div>
      </div>
    </Link>
  );
}

export default function LivePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'discover' | 'following'>('discover');
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [followingStreams, setFollowingStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadStreams = useCallback(async (pageNum: number, append = false) => {
    try {
      const response = await liveApi.getLiveStreams(pageNum);
      if (append) {
        setStreams(prev => [...prev, ...response.streams]);
      } else {
        setStreams(response.streams);
      }
      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load streams:', error);
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
    loadStreams(1);
    if (isAuthenticated) {
      loadFollowingStreams();
    }
  }, [loadStreams, loadFollowingStreams, isAuthenticated]);

  const handleGoLive = () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/live/start');
      return;
    }
    router.push('/live/start');
  };

  const displayedStreams = activeTab === 'following' ? followingStreams : streams;

  return (
    <div className="flex min-h-screen bg-[#0A0E1A]">
      <SideNav />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <header className="sticky top-0 z-40 bg-[#0A0E1A]/95 backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <h1 className="text-xl font-bold text-white">LIVE</h1>
            </div>
            <button
              onClick={handleGoLive}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Go Live
            </button>
          </div>

          {isAuthenticated && (
            <div className="flex border-b border-white/5">
              <button
                onClick={() => setActiveTab('discover')}
                className={`flex-1 py-3 text-sm font-medium relative ${activeTab === 'discover' ? 'text-white' : 'text-white/50'}`}
              >
                Discover
                {activeTab === 'discover' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#14B8A6]" />}
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`flex-1 py-3 text-sm font-medium relative ${activeTab === 'following' ? 'text-white' : 'text-white/50'}`}
              >
                Following
                {followingStreams.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {followingStreams.length}
                  </span>
                )}
                {activeTab === 'following' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#14B8A6]" />}
              </button>
            </div>
          )}
        </header>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-[#1A1F2E] rounded-xl mb-3" />
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1A1F2E]" />
                    <div className="flex-1">
                      <div className="h-4 bg-[#1A1F2E] rounded w-3/4 mb-2" />
                      <div className="h-3 bg-[#1A1F2E] rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayedStreams.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#6366F1]/20 to-[#14B8A6]/20 flex items-center justify-center">
                <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {activeTab === 'following' ? 'No One You Follow is Live' : 'No Live Streams'}
              </h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                {activeTab === 'following'
                  ? 'Check back later or discover new creators going live now!'
                  : 'Be the first to go live and connect with your audience!'}
              </p>
              {activeTab === 'following' ? (
                <button
                  onClick={() => setActiveTab('discover')}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#1A1F2E] text-white font-semibold rounded-full hover:bg-[#252A3E]"
                >
                  Discover Streams
                </button>
              ) : (
                <button
                  onClick={handleGoLive}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Start Streaming
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                {displayedStreams.map((stream) => (
                  <LiveStreamCard key={stream.id} stream={stream} />
                ))}
              </div>

              {hasMore && activeTab === 'discover' && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => loadStreams(page + 1, true)}
                    className="px-6 py-3 bg-[#1A1F2E] text-white rounded-full hover:bg-[#252A3E]"
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}

          {!isLoading && activeTab === 'discover' && displayedStreams.length === 0 && (
            <section className="mt-12 pt-12 border-t border-white/5">
              <h2 className="text-white font-semibold text-lg mb-6 text-center">Why Go Live on VIB3?</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-[#1A1F2E] rounded-2xl">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#6366F1]/20 flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium mb-2">Multi-Guest Support</h3>
                  <p className="text-white/50 text-sm">Invite up to 4 guests to join your live stream</p>
                </div>

                <div className="text-center p-6 bg-[#1A1F2E] rounded-2xl">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#14B8A6]/20 flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#14B8A6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium mb-2">Earn While You Stream</h3>
                  <p className="text-white/50 text-sm">Receive virtual gifts from viewers</p>
                </div>

                <div className="text-center p-6 bg-[#1A1F2E] rounded-2xl">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#EC4899]/20 flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#EC4899]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium mb-2">Live Chat & Reactions</h3>
                  <p className="text-white/50 text-sm">Engage with real-time chat and reactions</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
