'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { useAuthStore } from '@/stores/authStore';
import { userApi } from '@/services/api';
import { formatCount } from '@/utils/format';
import type { Video } from '@/types';
import { logger } from '@/utils/logger';

function VideoThumbnail({ video }: { video: Video }) {
  return (
    <Link
      href={`/video/${video.id}?user=${video.userId}`}
      className="relative aspect-[9/16] glass-card rounded-lg overflow-hidden group"
    >
      {video.thumbnailUrl ? (
        <Image
          src={video.thumbnailUrl}
          alt={video.title || video.caption || 'Video thumbnail'}
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
      {video.username && (
        <div className="absolute bottom-2 right-2 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">
          @{video.username}
        </div>
      )}
    </Link>
  );
}

export default function LikedVideosPage() {
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthVerified) return;

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function fetchLikedVideos() {
      try {
        setLoading(true);
        setError(null);
        // No userId needed - backend uses authenticated user from token
        const response = await userApi.getLikedVideos();
        setVideos(response.videos || []);
      } catch (err) {
        logger.error('Error fetching liked videos:', err);
        setError('Failed to load liked videos');
      } finally {
        setLoading(false);
      }
    }

    fetchLikedVideos();
  }, [isAuthenticated, isAuthVerified]);

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
            <div className="text-6xl mb-4">❤️</div>
            <h1 className="text-2xl font-bold text-white mb-4">Liked Videos</h1>
            <p className="text-white/60 mb-6">Sign in to see your liked videos</p>
            <Link
              href="/login?redirect=/liked"
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
          <div className="flex items-center gap-4 py-4">
            <Link href="/feed" className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Liked Videos</h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition"
              >
                Retry
              </button>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">❤️</div>
              <h2 className="text-xl font-semibold text-white mb-2">No liked videos yet</h2>
              <p className="text-white/60 mb-6">Videos you like will appear here</p>
              <Link
                href="/feed"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full font-medium hover:opacity-90 transition"
              >
                Explore Videos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {videos.map((video) => (
                <VideoThumbnail key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
