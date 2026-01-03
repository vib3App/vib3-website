'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon, ClockIcon } from '@heroicons/react/24/outline';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { useAuthStore } from '@/stores/authStore';
import { formatCount } from '@/utils/format';
import type { Video } from '@/types';

// Watch history stored in localStorage
const HISTORY_KEY = 'vib3_watch_history';
const MAX_HISTORY_ITEMS = 100;

interface WatchHistoryItem {
  video: Video;
  watchedAt: string;
}

function getWatchHistory(): WatchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

export function addToWatchHistory(video: Video): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getWatchHistory();
    // Remove if already exists (will re-add at top)
    const filtered = history.filter(item => item.video.id !== video.id);
    // Add to beginning
    filtered.unshift({ video, watchedAt: new Date().toISOString() });
    // Limit size
    const trimmed = filtered.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore localStorage errors
  }
}

export function clearWatchHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

function VideoThumbnail({ video, watchedAt }: { video: Video; watchedAt: string }) {
  const timeAgo = getTimeAgo(watchedAt);

  return (
    <Link
      href={`/video/${video.id}?user=${video.userId}`}
      className="relative aspect-[9/16] glass-card rounded-lg overflow-hidden group"
    >
      {video.thumbnailUrl ? (
        <Image
          src={video.thumbnailUrl}
          alt={video.caption || 'Video thumbnail'}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5">
          <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      )}
      <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        </svg>
        <span>{formatCount(video.viewsCount || 0)}</span>
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-1 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">
        <ClockIcon className="w-3 h-3" />
        <span>{timeAgo}</span>
      </div>
      {video.username && (
        <div className="absolute bottom-2 right-2 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">
          @{video.username}
        </div>
      )}
    </Link>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function WatchHistoryPage() {
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load history from localStorage
    const watchHistory = getWatchHistory();
    setHistory(watchHistory);
    setLoading(false);
  }, []);

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your watch history?')) {
      clearWatchHistory();
      setHistory([]);
    }
  };

  if (!isAuthVerified) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative">
        <AuroraBackground intensity={20} />
        <TopNav />
        <main className="pt-20 md:pt-16 pb-8 relative z-10">
          <div className="max-w-3xl mx-auto px-4 text-center py-20">
            <ClockIcon className="w-16 h-16 mx-auto mb-4 text-white/40" />
            <h1 className="text-2xl font-bold text-white mb-4">Watch History</h1>
            <p className="text-white/60 mb-6">Sign in to track your watch history</p>
            <Link
              href="/login?redirect=/history"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full font-medium hover:opacity-90 transition"
            >
              Sign In
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />

      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/feed" className="p-2 hover:bg-white/10 rounded-full transition">
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </Link>
              <h1 className="text-2xl font-bold text-white">Watch History</h1>
            </div>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-sm text-white/60 hover:text-white transition"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-20">
              <ClockIcon className="w-16 h-16 mx-auto mb-4 text-white/40" />
              <h2 className="text-xl font-semibold text-white mb-2">No watch history yet</h2>
              <p className="text-white/60 mb-6">Videos you watch will appear here</p>
              <Link
                href="/feed"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full font-medium hover:opacity-90 transition"
              >
                Explore Videos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {history.map((item) => (
                <VideoThumbnail
                  key={`${item.video.id}-${item.watchedAt}`}
                  video={item.video}
                  watchedAt={item.watchedAt}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
