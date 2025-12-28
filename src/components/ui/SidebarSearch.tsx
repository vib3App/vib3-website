'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchApi } from '@/services/api/search';
import { userApi } from '@/services/api/user';

interface SearchResult {
  id: string;
  type: 'user' | 'hashtag' | 'video';
  title: string;
  subtitle?: string;
  image?: string;
  href: string;
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export function SidebarSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search - calls real API
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const isMention = searchQuery.startsWith('@');
      const isHashtag = searchQuery.startsWith('#');
      const cleanQuery = isMention || isHashtag ? searchQuery.slice(1) : searchQuery;

      const searchResults: SearchResult[] = [];

      // Search users if @mention or general search
      if (isMention || !isHashtag) {
        try {
          const users = await userApi.searchUsers(cleanQuery, 5);
          users.forEach((user) => {
            searchResults.push({
              id: user._id,
              type: 'user',
              title: `@${user.username}`,
              subtitle: `${formatCount(user.stats?.followers || 0)} followers`,
              image: user.profilePicture,
              href: `/profile/${user._id}`,
            });
          });
        } catch (err) {
          console.error('User search error:', err);
        }
      }

      // Search hashtags if #hashtag or general search
      if (isHashtag || !isMention) {
        try {
          const hashtags = await searchApi.searchHashtags(cleanQuery, 5);
          hashtags.forEach((tag) => {
            searchResults.push({
              id: tag.name,
              type: 'hashtag',
              title: `#${tag.name}`,
              subtitle: `${formatCount(tag.viewCount || tag.videoCount || 0)} views`,
              href: `/hashtag/${tag.name}`,
            });
          });
        } catch (err) {
          console.error('Hashtag search error:', err);
        }
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Enter' && query) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setIsOpen(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          router.push(results[selectedIndex].href);
          setIsOpen(false);
          setQuery('');
        } else if (query) {
          router.push(`/search?q=${encodeURIComponent(query)}`);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const getIcon = (type: 'user' | 'hashtag' | 'video') => {
    switch (type) {
      case 'user':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        );
      case 'hashtag':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5.41 21L6.12 17H2V15H6.53L7.53 10H3V8H7.95L8.66 4H10.68L9.97 8H14.95L15.66 4H17.68L16.97 8H21V10H16.55L15.55 15H20V17H15.13L14.42 21H12.4L13.12 17H8.13L7.42 21H5.41ZM9.55 10L8.55 15H13.53L14.53 10H9.55Z" />
          </svg>
        );
      case 'video':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
          </svg>
        );
    }
  };

  return (
    <div className="relative px-3 mb-4">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search"
          className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-3 right-3 mt-2 bg-neutral-900 border border-white/10 rounded-xl overflow-hidden shadow-xl z-50"
        >
          {results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              {results.map((result, index) => (
                <Link
                  key={result.id}
                  href={result.href}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${
                    index === selectedIndex ? 'bg-white/10' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      result.type === 'user'
                        ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                        : result.type === 'hashtag'
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                        : 'bg-gradient-to-br from-pink-500 to-red-600'
                    }`}
                  >
                    {result.image ? (
                      <Image
                        src={result.image}
                        alt={result.title}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white">{getIcon(result.type)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-white/50 text-sm truncate">{result.subtitle}</div>
                    )}
                  </div>
                  <div className="text-white/30">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          ) : query.length >= 2 && !isLoading ? (
            <div className="px-4 py-8 text-center text-white/50">
              <p>No results for &quot;{query}&quot;</p>
              <p className="text-sm mt-1">Try searching for users, hashtags, or videos</p>
            </div>
          ) : null}

          {query && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 border-t border-white/10 hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="text-white/70">Search for &quot;{query}&quot;</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
