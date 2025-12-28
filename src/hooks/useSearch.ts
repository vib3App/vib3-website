'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchApi, SearchFilters, SearchSuggestion, SearchUser, SearchHashtag, SearchSound } from '@/services/api';
import type { Video } from '@/types';

export type SearchTab = 'top' | 'users' | 'videos' | 'sounds' | 'hashtags' | 'transcripts';

export interface TranscriptMatch {
  videoId: string;
  timestamp: number;
  text: string;
  context: string;
}

interface UseSearchReturn {
  query: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: SearchTab;
  setActiveTab: (tab: SearchTab) => void;
  users: SearchUser[];
  videos: Video[];
  hashtags: SearchHashtag[];
  sounds: SearchSound[];
  transcriptMatches: TranscriptMatch[];
  isLoading: boolean;
  suggestions: SearchSuggestion[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  recentSearches: string[];
  trendingSearches: string[];
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filters: SearchFilters;
  inputRef: React.RefObject<HTMLInputElement | null>;
  suggestionsRef: React.RefObject<HTMLDivElement | null>;
  handleSearch: (e: React.FormEvent) => void;
  handleSuggestionClick: (suggestion: SearchSuggestion) => void;
  handleFilterChange: (newFilters: Partial<SearchFilters>) => void;
  clearRecentSearches: () => void;
}

export function useSearch(): UseSearchReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(query);
  const [activeTab, setActiveTab] = useState<SearchTab>('top');
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [hashtags, setHashtags] = useState<SearchHashtag[]>([]);
  const [sounds, setSounds] = useState<SearchSound[]>([]);
  const [transcriptMatches, setTranscriptMatches] = useState<TranscriptMatch[]>([]);
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

  useEffect(() => {
    const saved = localStorage.getItem('vib3_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    searchApi.getTrendingSearches().then(setTrendingSearches).catch(() => {
      setTrendingSearches(['dance', 'music', 'comedy', 'pets', 'food', 'travel']);
    });
  }, []);

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

  return {
    query,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    users,
    videos,
    hashtags,
    sounds,
    transcriptMatches,
    isLoading,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    recentSearches,
    trendingSearches,
    showFilters,
    setShowFilters,
    filters,
    inputRef,
    suggestionsRef,
    handleSearch,
    handleSuggestionClick,
    handleFilterChange,
    clearRecentSearches,
  };
}
