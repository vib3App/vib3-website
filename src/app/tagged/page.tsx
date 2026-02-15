'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { userApi } from '@/services/api';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { formatCount } from '@/utils/format';
import type { Video } from '@/types';
import { logger } from '@/utils/logger';

function VideoThumbnail({ video }: { video: Video }) {
  return (
    <Link
      href={`/video/${video.id}`}
      className="relative aspect-[9/16] glass-card rounded-lg overflow-hidden group"
    >
      {video.thumbnailUrl ? (
        <Image
          src={video.thumbnailUrl}
          alt={video.caption || 'Video'}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5">
          <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}
      <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        </svg>
        <span>{formatCount(video.viewsCount || 0)}</span>
      </div>
      {video.username && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded-full text-white text-xs">
          @{video.username}
        </div>
      )}
    </Link>
  );
}

export default function TaggedVideosPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadVideos = useCallback(async (pageNum: number, append = false) => {
    try {
      const response = await userApi.getTaggedVideos(pageNum, 20);
      const newVideos = response.videos || [];

      if (append) {
        setVideos(prev => [...prev, ...newVideos]);
      } else {
        setVideos(newVideos);
      }

      setHasMore(response.pagination?.hasMore || false);
      setPage(pageNum);
    } catch (error) {
      logger.error('Failed to load tagged videos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthVerified) return;

    if (!isAuthenticated) {
      router.push('/login?redirect=/tagged');
      return;
    }

    loadVideos(1);
  }, [isAuthenticated, isAuthVerified, router, loadVideos]);

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
              <h1 className="text-lg font-semibold text-white">Tagged Videos</h1>
              <p className="text-white/50 text-xs">Videos you&apos;re tagged in</p>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[9/16] glass rounded-lg animate-pulse" />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-20 h-20 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-xl font-semibold text-white mb-2">No Tagged Videos</h2>
              <p className="text-white/50 max-w-md mx-auto">
                When someone tags you in a video, it will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {videos.map((video) => (
                  <VideoThumbnail key={video.id} video={video} />
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => loadVideos(page + 1, true)}
                    className="px-6 py-3 glass text-white rounded-full hover:bg-white/10 transition"
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
