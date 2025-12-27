'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { feedApi, userApi } from '@/services/api';
import { BottomNav } from '@/components/ui/BottomNav';
import { SideNav } from '@/components/ui/SideNav';
import type { Video } from '@/types';

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

type SearchTab = 'top' | 'users' | 'videos' | 'sounds' | 'hashtags';

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(query);
  const [activeTab, setActiveTab] = useState<SearchTab>('top');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vib3_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const saveRecentSearch = useCallback((term: string) => {
    setRecentSearches(prev => {
      const updated = [term, ...prev.filter(s => s !== term)].slice(0, 10);
      localStorage.setItem('vib3_recent_searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('vib3_recent_searches');
  };

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;

    setIsLoading(true);
    saveRecentSearch(q);

    try {
      const [usersResult, videosResult] = await Promise.all([
        userApi.searchUsers(q, 20),
        feedApi.searchVideos(q, 1, 20),
      ]);

      setUsers(usersResult);
      setVideos(videosResult.items);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [saveRecentSearch]);

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [query, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const tabs: { id: SearchTab; label: string }[] = [
    { id: 'top', label: 'Top' },
    { id: 'users', label: 'Users' },
    { id: 'videos', label: 'Videos' },
    { id: 'sounds', label: 'Sounds' },
    { id: 'hashtags', label: 'Hashtags' },
  ];

  return (
    <>
      {/* Header with Search */}
      <header className="sticky top-0 z-40 bg-[#0A0E1A]/95 backdrop-blur-sm border-b border-white/5">
        <div className="px-4 py-4">
          <form onSubmit={handleSearch} className="relative">
            <button
              type="button"
              onClick={() => router.back()}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white md:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              autoFocus
              className="w-full bg-[#1A1F2E] text-white px-12 py-3 rounded-full outline-none placeholder:text-white/30 focus:ring-2 focus:ring-[#6366F1]"
            />
            <svg
              className="absolute left-4 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 hidden md:block"
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

        {/* Tabs - Only show when there are results */}
        {query && (
          <div className="flex overflow-x-auto scrollbar-hide border-b border-white/5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-6 py-3 text-sm font-medium relative ${
                  activeTab === tab.id ? 'text-white' : 'text-white/50'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#14B8A6]" />
                )}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="px-4 py-6">
        {/* No query - show recent searches and suggestions */}
        {!query && (
          <div className="space-y-6">
            {recentSearches.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-medium">Recent Searches</h2>
                  <button
                    onClick={clearRecentSearches}
                    className="text-[#6366F1] text-sm"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
                      className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-white/70">{term}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-white font-medium mb-4">Trending Searches</h2>
              <div className="flex flex-wrap gap-2">
                {['dance', 'music', 'comedy', 'pets', 'food', 'travel'].map((term) => (
                  <button
                    key={term}
                    onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
                    className="px-4 py-2 bg-[#1A1F2E] text-white/70 rounded-full hover:bg-[#252A3E] transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Results */}
        {query && !isLoading && (
          <div className="space-y-6">
            {/* Users Section */}
            {(activeTab === 'top' || activeTab === 'users') && users.length > 0 && (
              <section>
                {activeTab === 'top' && (
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-medium">Users</h2>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="text-[#6366F1] text-sm"
                    >
                      See all
                    </button>
                  </div>
                )}
                <div className="space-y-3">
                  {(activeTab === 'top' ? users.slice(0, 3) : users).map((user) => (
                    <Link
                      key={user._id}
                      href={`/profile/${user._id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1A1F2E]">
                        {user.profilePicture ? (
                          <Image
                            src={user.profilePicture}
                            alt={user.username}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/50 font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-white font-medium">{user.username}</span>
                          {user.isVerified && (
                            <svg className="w-4 h-4 text-[#6366F1]" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <p className="text-white/50 text-sm">
                          {formatCount(user.stats.followers)} followers
                        </p>
                      </div>
                      <button className="px-4 py-1.5 bg-[#6366F1] text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity">
                        Follow
                      </button>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Videos Section */}
            {(activeTab === 'top' || activeTab === 'videos') && videos.length > 0 && (
              <section>
                {activeTab === 'top' && (
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-medium">Videos</h2>
                    <button
                      onClick={() => setActiveTab('videos')}
                      className="text-[#6366F1] text-sm"
                    >
                      See all
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  {(activeTab === 'top' ? videos.slice(0, 6) : videos).map((video) => (
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
              </section>
            )}

            {/* No results */}
            {users.length === 0 && videos.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-white/50">No results for &quot;{query}&quot;</p>
                <p className="text-white/30 text-sm mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function SearchLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="flex min-h-screen bg-[#0A0E1A]">
      <SideNav />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <Suspense fallback={<SearchLoading />}>
          <SearchContent />
        </Suspense>
      </main>

      <BottomNav />
    </div>
  );
}
