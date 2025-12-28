'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { feedApi } from '@/services/api';
import { BottomNav } from '@/components/ui/BottomNav';
import { SideNav } from '@/components/ui/SideNav';
import type { Video } from '@/types';

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export default function HashtagPage() {
  const params = useParams();
  const router = useRouter();
  const tag = params.tag as string;

  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);

  useEffect(() => {
    if (tag) {
      loadHashtagVideos();
    }
  }, [tag]);

  const loadHashtagVideos = async () => {
    try {
      setIsLoading(true);
      const response = await feedApi.getHashtagFeed(tag, 1, 30);
      setVideos(response.items);
      setTotalViews(response.items.reduce((sum, v) => sum + (v.viewsCount || 0), 0));
    } catch (error) {
      console.error('Failed to load hashtag videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen aurora-bg">
      <SideNav />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-heavy mx-4 mt-3 rounded-2xl border-b border-white/5">
          <div className="flex items-center gap-4 px-4 h-14">
            <button onClick={() => router.back()} className="text-white/50 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white">#{tag}</h1>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Hashtag Info */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center">
              <span className="text-4xl">#</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">#{tag}</h2>
            <div className="flex justify-center gap-6 text-white/50">
              <div>
                <span className="text-white font-semibold">{formatCount(totalViews)}</span> views
              </div>
              <div>
                <span className="text-white font-semibold">{videos.length}</span> videos
              </div>
            </div>
          </div>

          {/* Videos Grid */}
          {isLoading ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[9/16] glass rounded-lg animate-pulse" />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-white/50">No videos with #{tag} yet</p>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white font-semibold rounded-full"
              >
                Be the first to post
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {videos.map((video) => (
                <Link
                  key={video.id}
                  href={`/feed?video=${video.id}`}
                  className="relative aspect-[9/16] glass rounded-lg overflow-hidden group"
                >
                  {video.thumbnailUrl ? (
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.caption || 'Video'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                    <span>{formatCount(video.viewsCount || 0)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
