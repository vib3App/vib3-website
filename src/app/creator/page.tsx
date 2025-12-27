'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { userApi } from '@/services/api';
import { BottomNav } from '@/components/ui/BottomNav';
import { SideNav } from '@/components/ui/SideNav';
import type { Video } from '@/types';

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

interface AnalyticsStat {
  label: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

export default function CreatorPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '28d' | 'all'>('7d');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/creator');
      return;
    }
    loadCreatorData();
  }, [isAuthenticated, router]);

  const loadCreatorData = async () => {
    try {
      setIsLoading(true);
      if (user?.id) {
        const result = await userApi.getUserVideos(user.id);
        setVideos(result.videos || []);
      }
    } catch (error) {
      console.error('Failed to load creator data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats: AnalyticsStat[] = [
    {
      label: 'Total Views',
      value: videos.reduce((sum, v) => sum + (v.viewsCount || 0), 0),
      change: 12.5,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      color: 'from-[#6366F1] to-[#8B5CF6]',
    },
    {
      label: 'Total Likes',
      value: videos.reduce((sum, v) => sum + (v.likesCount || 0), 0),
      change: 8.3,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
      color: 'from-red-500 to-pink-500',
    },
    {
      label: 'Total Comments',
      value: videos.reduce((sum, v) => sum + (v.commentsCount || 0), 0),
      change: -2.1,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: 'from-[#14B8A6] to-[#06B6D4]',
    },
    {
      label: 'Total Shares',
      value: videos.reduce((sum, v) => sum + (v.sharesCount || 0), 0),
      change: 15.7,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6366F1]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0A0E1A]">
      <SideNav />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#0A0E1A]/95 backdrop-blur-sm border-b border-white/5">
          <div className="flex items-center justify-between px-4 h-14">
            <h1 className="text-xl font-bold text-white">Creator Studio</h1>
            <Link
              href="/upload"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload
            </Link>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Period Selector */}
          <div className="flex gap-2">
            {[
              { id: '7d', label: 'Last 7 days' },
              { id: '28d', label: 'Last 28 days' },
              { id: 'all', label: 'All time' },
            ].map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id as typeof selectedPeriod)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedPeriod === period.id
                    ? 'bg-[#6366F1] text-white'
                    : 'bg-[#1A1F2E] text-white/70 hover:bg-[#252A3E]'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="p-4 bg-[#1A1F2E] rounded-2xl"
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatCount(stat.value)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-sm">{stat.label}</span>
                  <span className={`text-xs font-medium ${stat.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change >= 0 ? '+' : ''}{stat.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/upload"
              className="p-4 bg-[#1A1F2E] rounded-2xl hover:bg-[#252A3E] transition-colors text-center"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#6366F1]/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <span className="text-white text-sm">Upload Video</span>
            </Link>

            <Link
              href="/live/start"
              className="p-4 bg-[#1A1F2E] rounded-2xl hover:bg-[#252A3E] transition-colors text-center"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-white text-sm">Go Live</span>
            </Link>

            <Link
              href="/capsules/create"
              className="p-4 bg-[#1A1F2E] rounded-2xl hover:bg-[#252A3E] transition-colors text-center"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#14B8A6]/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#14B8A6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-white text-sm">Time Capsule</span>
            </Link>

            <button className="p-4 bg-[#1A1F2E] rounded-2xl hover:bg-[#252A3E] transition-colors text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-white text-sm">Analytics</span>
            </button>
          </div>

          {/* Recent Videos */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-lg">Your Videos</h2>
              <Link href={`/profile/${user?.id}`} className="text-[#6366F1] text-sm font-medium">
                View all
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[9/16] bg-[#1A1F2E] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-12 bg-[#1A1F2E] rounded-2xl">
                <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-white/50 mb-4">No videos yet</p>
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white font-semibold rounded-full"
                >
                  Upload your first video
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {videos.slice(0, 8).map((video) => (
                  <Link
                    key={video.id}
                    href={`/feed?video=${video.id}`}
                    className="relative aspect-[9/16] bg-[#1A1F2E] rounded-lg overflow-hidden group"
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
          </section>

          {/* Tips Section */}
          <section className="bg-gradient-to-r from-[#6366F1]/20 to-[#14B8A6]/20 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="text-xl">💡</span>
              Creator Tips
            </h2>
            <ul className="space-y-3 text-white/70 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[#14B8A6]">•</span>
                Post consistently to keep your audience engaged
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#14B8A6]">•</span>
                Use trending sounds and hashtags to increase visibility
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#14B8A6]">•</span>
                Respond to comments to build community
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#14B8A6]">•</span>
                Go live to connect with your audience in real-time
              </li>
            </ul>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
