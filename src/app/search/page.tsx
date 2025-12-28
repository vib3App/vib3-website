'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { searchApi, SearchFilters, SearchSuggestion, SearchUser, SearchHashtag, SearchSound } from '@/services/api';
import { BottomNav } from '@/components/ui/BottomNav';
import { SideNav } from '@/components/ui/SideNav';
import type { Video } from '@/types';

type SearchTab = 'top' | 'users' | 'videos' | 'sounds' | 'hashtags' | 'transcripts';

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(query);
  const [activeTab, setActiveTab] = useState<SearchTab>('top');
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [hashtags, setHashtags] = useState<SearchHashtag[]>([]);
  const [sounds, setSounds] = useState<SearchSound[]>([]);
  const [transcriptMatches, setTranscriptMatches] = useState<Array<{ videoId: string; timestamp: number; text: string; context: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    dateRange: 'all',
    duration: 'all',
    sortBy: 'relevance',
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load recent and trending searches
  useEffect(() => {
    const saved = localStorage.getItem('vib3_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }

    searchApi.getTrendingSearches().then(setTrendingSearches).catch(() => {
      setTrendingSearches(['dance', 'music', 'comedy', 'pets', 'food', 'travel']);
    });
  }, []);

  // Get suggestions as user types
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const results = await searchApi.getSuggestions(searchQuery);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = useCallback((term: string) => {
    setRecentSearches(prev => {
      const updated = [term, ...prev.filter(s => s !== term)].slice(0, 10);
      localStorage.setItem('vib3_recent_searches', JSON.stringify(updated));
      return updated;
    });
    searchApi.saveSearch(term).catch(() => {});
  }, []);

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('vib3_recent_searches');
    searchApi.clearSearchHistory().catch(() => {});
  };

  const performSearch = useCallback(async (q: string, searchFilters: SearchFilters = filters) => {
    if (!q.trim()) return;

    setIsLoading(true);
    setShowSuggestions(false);
    saveRecentSearch(q);

    try {
      const [videosResult, usersResult, hashtagsResult, soundsResult, transcriptsResult] = await Promise.all([
        searchApi.searchVideos(q, searchFilters),
        searchApi.searchUsers(q),
        searchApi.searchHashtags(q),
        searchApi.searchSounds(q),
        searchApi.searchTranscripts(q),
      ]);

      setVideos(videosResult.items);
      setUsers(usersResult);
      setHashtags(hashtagsResult);
      setSounds(soundsResult);
      setTranscriptMatches(transcriptsResult.items);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, saveRecentSearch]);

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

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    router.push(`/search?q=${encodeURIComponent(suggestion.text)}`);
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    if (query) {
      performSearch(query, updated);
    }
  };

  const tabs: { id: SearchTab; label: string }[] = [
    { id: 'top', label: 'Top' },
    { id: 'users', label: 'Users' },
    { id: 'videos', label: 'Videos' },
    { id: 'sounds', label: 'Sounds' },
    { id: 'hashtags', label: 'Hashtags' },
    { id: 'transcripts', label: 'In Videos' },
  ];

  return (
    <>
      {/* Header with Search */}
      <header className="sticky top-0 z-40 bg-[#0A0E1A]/95 backdrop-blur-sm border-b border-white/5">
        <div className="px-4 py-4">
          <div ref={suggestionsRef} className="relative">
          <form onSubmit={handleSearch}>
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
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search videos, users, sounds..."
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

            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1F2E] rounded-xl shadow-xl overflow-hidden z-50">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                  >
                    {suggestion.type === 'user' && suggestion.avatar ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#0A0E1A]">
                        <Image src={suggestion.avatar} alt="" width={32} height={32} className="object-cover" />
                      </div>
                    ) : suggestion.type === 'hashtag' ? (
                      <div className="w-8 h-8 rounded-full bg-[#6366F1]/20 flex items-center justify-center">
                        <span className="text-[#6366F1]">#</span>
                      </div>
                    ) : suggestion.type === 'sound' ? (
                      <div className="w-8 h-8 rounded-full bg-[#14B8A6]/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#14B8A6]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                      </div>
                    ) : (
                      <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                    <div>
                      <p className="text-white">{suggestion.text}</p>
                      {suggestion.subtext && (
                        <p className="text-white/50 text-sm">{suggestion.subtext}</p>
                      )}
                    </div>
                    {suggestion.count !== undefined && (
                      <span className="ml-auto text-white/30 text-sm">{formatCount(suggestion.count)}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </form>
          </div>
        </div>

        {/* Tabs and Filters */}
        {query && (
          <div className="flex items-center border-b border-white/5">
            <div className="flex-1 flex overflow-x-auto scrollbar-hide">
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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 ${showFilters ? 'text-[#6366F1]' : 'text-white/50'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && query && (
          <div className="p-4 border-b border-white/5 bg-[#0A0E1A]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-white/50 text-xs mb-2">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange({ dateRange: e.target.value as SearchFilters['dateRange'] })}
                  className="w-full bg-[#1A1F2E] text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[#6366F1]"
                >
                  <option value="all">All time</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                  <option value="year">This year</option>
                </select>
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-2">Duration</label>
                <select
                  value={filters.duration}
                  onChange={(e) => handleFilterChange({ duration: e.target.value as SearchFilters['duration'] })}
                  className="w-full bg-[#1A1F2E] text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[#6366F1]"
                >
                  <option value="all">Any duration</option>
                  <option value="short">Under 30s</option>
                  <option value="medium">30s - 3min</option>
                  <option value="long">Over 3min</option>
                </select>
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value as SearchFilters['sortBy'] })}
                  className="w-full bg-[#1A1F2E] text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[#6366F1]"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Most recent</option>
                  <option value="views">Most viewed</option>
                  <option value="likes">Most liked</option>
                </select>
              </div>
            </div>
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
                  <button onClick={clearRecentSearches} className="text-[#6366F1] text-sm">
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
                {trendingSearches.map((term) => (
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
                    <button onClick={() => setActiveTab('users')} className="text-[#6366F1] text-sm">See all</button>
                  </div>
                )}
                <div className="space-y-3">
                  {(activeTab === 'top' ? users.slice(0, 3) : users).map((user) => (
                    <Link key={user.id} href={`/profile/${user.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1A1F2E]">
                        {user.avatar ? (
                          <Image src={user.avatar} alt={user.username} width={48} height={48} className="object-cover" />
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
                        <p className="text-white/50 text-sm">{formatCount(user.followerCount)} followers</p>
                      </div>
                      <button className="px-4 py-1.5 bg-[#6366F1] text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity">
                        {user.isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Hashtags Section */}
            {(activeTab === 'top' || activeTab === 'hashtags') && hashtags.length > 0 && (
              <section>
                {activeTab === 'top' && (
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-medium">Hashtags</h2>
                    <button onClick={() => setActiveTab('hashtags')} className="text-[#6366F1] text-sm">See all</button>
                  </div>
                )}
                <div className="space-y-3">
                  {(activeTab === 'top' ? hashtags.slice(0, 5) : hashtags).map((hashtag) => (
                    <Link key={hashtag.name} href={`/hashtag/${hashtag.name}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-[#6366F1]/20 flex items-center justify-center">
                        <span className="text-[#6366F1] text-xl font-bold">#</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">#{hashtag.name}</p>
                        <p className="text-white/50 text-sm">{formatCount(hashtag.videoCount)} videos</p>
                      </div>
                      {hashtag.trending && (
                        <span className="text-[#14B8A6] text-xs font-medium">Trending</span>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Sounds Section */}
            {(activeTab === 'top' || activeTab === 'sounds') && sounds.length > 0 && (
              <section>
                {activeTab === 'top' && (
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-medium">Sounds</h2>
                    <button onClick={() => setActiveTab('sounds')} className="text-[#6366F1] text-sm">See all</button>
                  </div>
                )}
                <div className="space-y-3">
                  {(activeTab === 'top' ? sounds.slice(0, 3) : sounds).map((sound) => (
                    <div key={sound.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#1A1F2E]">
                        {sound.coverUrl ? (
                          <Image src={sound.coverUrl} alt={sound.title} width={48} height={48} className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{sound.title}</p>
                        <p className="text-white/50 text-sm">{sound.artist} • {formatDuration(sound.duration)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/50 text-sm">{formatCount(sound.useCount)} uses</p>
                      </div>
                    </div>
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
                    <button onClick={() => setActiveTab('videos')} className="text-[#6366F1] text-sm">See all</button>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  {(activeTab === 'top' ? videos.slice(0, 6) : videos).map((video) => (
                    <Link key={video.id} href={`/feed?video=${video.id}`} className="relative aspect-[9/16] bg-[#1A1F2E] rounded-lg overflow-hidden group">
                      {video.thumbnailUrl ? (
                        <Image src={video.thumbnailUrl} alt={video.caption || 'Video'} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
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

            {/* Transcript Matches Section */}
            {(activeTab === 'top' || activeTab === 'transcripts') && transcriptMatches.length > 0 && (
              <section>
                {activeTab === 'top' && (
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-medium">Found in Videos</h2>
                    <button onClick={() => setActiveTab('transcripts')} className="text-[#6366F1] text-sm">See all</button>
                  </div>
                )}
                <div className="space-y-3">
                  {(activeTab === 'top' ? transcriptMatches.slice(0, 3) : transcriptMatches).map((match, index) => (
                    <Link key={index} href={`/feed?video=${match.videoId}&t=${match.timestamp}`} className="block p-3 rounded-xl bg-[#1A1F2E] hover:bg-[#252A3E] transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#6366F1]/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#6366F1]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm">
                            ...{match.context}...
                          </p>
                          <p className="text-white/50 text-xs mt-1">
                            at {formatDuration(match.timestamp)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* No results */}
            {users.length === 0 && videos.length === 0 && hashtags.length === 0 && sounds.length === 0 && transcriptMatches.length === 0 && (
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
