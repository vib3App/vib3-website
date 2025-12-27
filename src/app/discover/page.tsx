'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { feedApi, userApi } from '@/services/api';
import { BottomNav } from '@/components/ui/BottomNav';
import { SideNav } from '@/components/ui/SideNav';
import type { Video } from '@/types';

const vibes = [
  { name: 'Energetic', emoji: '⚡', color: 'from-yellow-500 to-orange-500' },
  { name: 'Chill', emoji: '😌', color: 'from-blue-500 to-cyan-500' },
  { name: 'Creative', emoji: '🎨', color: 'from-purple-500 to-pink-500' },
  { name: 'Social', emoji: '🎉', color: 'from-pink-500 to-red-500' },
  { name: 'Romantic', emoji: '💕', color: 'from-red-400 to-pink-400' },
  { name: 'Funny', emoji: '😂', color: 'from-green-500 to-emerald-500' },
  { name: 'Inspirational', emoji: '✨', color: 'from-indigo-500 to-purple-500' },
];

const categories = [
  { name: 'Music', icon: '🎵' },
  { name: 'Dance', icon: '💃' },
  { name: 'Comedy', icon: '😄' },
  { name: 'Sports', icon: '⚽' },
  { name: 'Food', icon: '🍕' },
  { name: 'Gaming', icon: '🎮' },
  { name: 'Fashion', icon: '👗' },
  { name: 'Art', icon: '🎨' },
  { name: 'Pets', icon: '🐾' },
  { name: 'Travel', icon: '✈️' },
  { name: 'Fitness', icon: '💪' },
  { name: 'Education', icon: '📚' },
];

interface UserProfile {
  _id: string;
  username: string;
  displayName?: string;
  profilePicture?: string;
  isVerified?: boolean;
  stats: {
    followers: number;
  };
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export default function DiscoverPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDiscoverContent();
  }, []);

  const loadDiscoverContent = async () => {
    try {
      setIsLoading(true);
      const [videosResponse] = await Promise.all([
        feedApi.getTrendingFeed(1, 12),
      ]);
      setTrendingVideos(videosResponse.items);
    } catch (error) {
      console.error('Failed to load discover content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0A0E1A]">
      <SideNav />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Header with Search */}
        <header className="sticky top-0 z-40 bg-[#0A0E1A]/95 backdrop-blur-sm border-b border-white/5">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos, creators, sounds..."
                className="w-full bg-[#1A1F2E] text-white px-12 py-3 rounded-full outline-none placeholder:text-white/30 focus:ring-2 focus:ring-[#6366F1]"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </form>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
          {/* Vibes Section */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="text-2xl">🎭</span>
              Browse by Vibe
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {vibes.map((vibe) => (
                <Link
                  key={vibe.name}
                  href={`/vibes/${vibe.name.toLowerCase()}`}
                  className={`flex-shrink-0 px-5 py-3 rounded-2xl bg-gradient-to-r ${vibe.color} text-white font-medium flex items-center gap-2 hover:scale-105 transition-transform`}
                >
                  <span className="text-xl">{vibe.emoji}</span>
                  <span>{vibe.name}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Categories Grid */}
          <section>
            <h2 className="text-white font-semibold text-lg mb-4">Categories</h2>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={`/category/${category.name.toLowerCase()}`}
                  className="flex flex-col items-center gap-2 p-4 bg-[#1A1F2E] rounded-xl hover:bg-[#252A3E] transition-colors"
                >
                  <span className="text-3xl">{category.icon}</span>
                  <span className="text-white/70 text-xs">{category.name}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Trending Videos */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                Trending Now
              </h2>
              <Link href="/trending" className="text-[#6366F1] text-sm font-medium">
                See all
              </Link>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[9/16] bg-[#1A1F2E] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {trendingVideos.map((video) => (
                  <Link
                    key={video.id}
                    href={`/feed?video=${video.id}`}
                    className="relative aspect-[9/16] bg-[#1A1F2E] rounded-lg overflow-hidden group"
                  >
                    {video.thumbnailUrl ? (
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.caption || 'Video thumbnail'}
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

          {/* Live Now Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                Live Now
              </h2>
              <Link href="/live" className="text-[#6366F1] text-sm font-medium">
                See all
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {/* Placeholder for live streams */}
              <div className="flex-shrink-0 w-48 text-center py-8 bg-[#1A1F2E] rounded-xl">
                <p className="text-white/50 text-sm">No live streams right now</p>
                <Link href="/upload" className="text-[#6366F1] text-sm font-medium mt-2 inline-block">
                  Go Live
                </Link>
              </div>
            </div>
          </section>

          {/* Time Capsules */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                <span className="text-2xl">⏳</span>
                Time Capsules
              </h2>
              <Link href="/capsules" className="text-[#6366F1] text-sm font-medium">
                Create one
              </Link>
            </div>
            <div className="bg-gradient-to-r from-[#6366F1]/20 to-[#14B8A6]/20 border border-white/10 rounded-2xl p-6 text-center">
              <h3 className="text-white font-semibold mb-2">Save Moments for Later</h3>
              <p className="text-white/50 text-sm mb-4">
                Create a time capsule that unlocks on a special date
              </p>
              <Link
                href="/capsules/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white font-semibold rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Time Capsule
              </Link>
            </div>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
