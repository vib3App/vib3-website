'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { feedApi } from '@/services/api';
import { watchHistoryService } from '@/services/watchHistory';
import { useFeedCategoryStore } from '@/stores/feedCategoryStore';
import { useAuthStore } from '@/stores/authStore';
import type { Video } from '@/types';
import type { FeedTab, VibeType } from '@/components/feed/FeedHeader';
import { logger } from '@/utils/logger';

// Stable empty array to prevent re-renders when no videos
const EMPTY_VIDEOS: Video[] = [];

export function useFeed() {
  const searchParams = useSearchParams();
  // Store is pre-initialized with defaults - always ready to use
  const { selectedCategory } = useFeedCategoryStore();
  const { user, isAuthVerified } = useAuthStore();

  const [activeTab, setActiveTab] = useState<FeedTab>('forYou');
  const [selectedVibe, setSelectedVibe] = useState<VibeType>(null);
  const [showVibes, setShowVibes] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const preloadedVideos = useRef<Set<string>>(new Set());
  const watchStartTime = useRef<number>(0);
  const hasInitialLoadRef = useRef(false);
  const isLoadingRef = useRef(false);
  const lastLoadedCategoryRef = useRef<string | null>(null);
  const erroredCategoriesRef = useRef<Set<string>>(new Set()); // Track categories that errored to prevent retries
  const hasRecycledRef = useRef(false);

  // Preload video function - uses fetch instead of link preload for better compatibility
  const preloadVideo = useCallback((url: string) => {
    if (preloadedVideos.current.has(url)) return;
    preloadedVideos.current.add(url);

    // Use fetch with range request to preload just the start of the video
    fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-100000' },
    }).catch(() => {
      // Silently ignore preload failures
    });
  }, []);

  // Load videos based on selected category
  const loadVideos = useCallback(async (reset = false) => {
    // Prevent concurrent loads
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    if (reset) {
      setIsLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const currentPage = reset ? 1 : page;

      let response;

      // If a vibe is selected, use vibe feed
      if (selectedVibe) {
        response = await feedApi.getVibesFeed(selectedVibe, currentPage);
      }
      // Use category-based loading if a category is selected
      else if (selectedCategory) {
        response = await feedApi.getFeedByCategory(
          selectedCategory.id,
          currentPage,
          20,
          user?.id,
          selectedCategory.settings?.feedOrder || 'chronological'
        );
      }
      // Fallback to legacy tab-based loading
      else if (activeTab === 'following') {
        response = await feedApi.getFollowingFeed(currentPage);
      } else {
        response = await feedApi.getForYouFeed(currentPage);
      }

      if (reset) {
        // Use stable empty array reference when no videos to prevent re-render loops
        setVideos(response.items.length > 0 ? response.items : EMPTY_VIDEOS);
        setCurrentIndex(0);
        setPage(1);
        preloadedVideos.current.clear();
      } else if (response.items.length > 0) {
        // Only update if there are new items to add
        setVideos(prev => [...prev, ...response.items]);
      }
      setHasMore(response.hasMore);
      // Reset recycle flag when new content is available
      if (response.hasMore || response.items.length > 0) {
        hasRecycledRef.current = false;
      }

      response.items.slice(0, 3).forEach(video => preloadVideo(video.videoUrl));
    } catch (err) {
      logger.error('Failed to load videos:', err);
      // Track this category as errored to prevent retry loops
      const errorKey = `${activeTab}-${selectedVibe}-${selectedCategory?.id}`;
      erroredCategoriesRef.current.add(errorKey);
      // On error, set empty videos to prevent re-render loops
      if (reset) {
        setVideos(EMPTY_VIDEOS);
        setHasMore(false);
      }
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [activeTab, page, selectedVibe, selectedCategory, user?.id, preloadVideo]);

  // Reload when category, tab, or vibe changes
  useEffect(() => {
    // For "self" category, wait for auth to be verified since it needs authentication
    if (selectedCategory?.id === 'self' && !isAuthVerified) {
      return;
    }

    // Create a unique key for the current feed state
    const currentKey = `${activeTab}-${selectedVibe}-${selectedCategory?.id}`;

    // Skip if we're already loading or just loaded this same combination
    if (isLoadingRef.current) {
      return;
    }

    // Skip if this is the same category we just loaded (prevents duplicate loads)
    if (lastLoadedCategoryRef.current === currentKey && hasInitialLoadRef.current) {
      return;
    }

    // Skip if this category previously errored (prevents retry loops)
    if (erroredCategoriesRef.current.has(currentKey)) {
      return;
    }

    // Store is pre-initialized - safe to load immediately
    hasInitialLoadRef.current = true;
    lastLoadedCategoryRef.current = currentKey;
    hasRecycledRef.current = false;
    loadVideos(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedVibe, selectedCategory?.id, isAuthVerified]);

  // Preload next videos when current index changes
  useEffect(() => {
    const nextVideos = videos.slice(currentIndex + 1, currentIndex + 4);
    nextVideos.forEach(video => preloadVideo(video.videoUrl));
  }, [currentIndex, videos, preloadVideo]);

  // Track watch time for current video
  useEffect(() => {
    const currentVideo = videos[currentIndex];
    if (!currentVideo) return;

    watchStartTime.current = Date.now();

    return () => {
      const watchDuration = (Date.now() - watchStartTime.current) / 1000;
      if (watchDuration > 1) {
        const progress = Math.min((watchDuration / currentVideo.duration) * 100, 100);
        watchHistoryService.trackWatch(currentVideo.id, progress, currentVideo.duration);
      }
    };
  }, [currentIndex, videos]);

  // Infinite scroll - load more when near end, or recycle if no more
  useEffect(() => {
    // Only trigger when we have videos and are approaching the end
    if (currentIndex >= videos.length - 3 && videos.length > 0 && !loadingMore && !isLoading) {
      if (hasMore) {
        setPage(prev => prev + 1);
      } else if (videos.length >= 3 && !hasRecycledRef.current) {
        // Only recycle once to prevent unbounded array growth
        hasRecycledRef.current = true;
        setVideos(prev => [...prev, ...prev.slice(0, Math.min(10, prev.length))]);
      }
    }
  }, [currentIndex, videos.length, hasMore, loadingMore, isLoading]);

  // Trigger load when page changes
  useEffect(() => {
    if (page > 1 && hasMore) {
      loadVideos(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, hasMore]);

  // Handle URL parameters (video and vibe)
  useEffect(() => {
    const videoId = searchParams.get('video');
    if (videoId && videos.length > 0) {
      const index = videos.findIndex(v => v.id === videoId);
      if (index !== -1) {
        setCurrentIndex(index);
        const container = scrollContainerRef.current;
        if (container) {
          const videoHeight = container.clientHeight;
          container.scrollTo({ top: index * videoHeight, behavior: 'smooth' });
        }
      }
    }

    // Read ?vibe= param and set selectedVibe (title-case match)
    const vibeParam = searchParams.get('vibe');
    if (vibeParam) {
      const VALID_VIBES = ['Energetic', 'Chill', 'Creative', 'Social', 'Romantic', 'Funny', 'Inspirational'] as const;
      const matched = VALID_VIBES.find(v => v.toLowerCase() === vibeParam.toLowerCase()) as VibeType | undefined;
      if (matched && matched !== selectedVibe) {
        setSelectedVibe(matched);
      }
    }
  }, [searchParams, videos, selectedVibe]);

  // Intersection observer for detecting current video
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setCurrentIndex(index);
            }
          }
        });
      },
      { root: container, threshold: 0.5 }
    );

    return () => observerRef.current?.disconnect();
  }, []);

  // Observe video elements
  useEffect(() => {
    const container = scrollContainerRef.current;
    const observer = observerRef.current;
    if (!container || !observer) return;

    const videoElements = container.querySelectorAll('[data-index]');
    videoElements.forEach((el) => observer.observe(el));

    return () => videoElements.forEach((el) => observer.unobserve(el));
  }, [videos]);

  // Scroll to specific video
  const scrollToVideo = useCallback((index: number) => {
    if (index < 0 || index >= videos.length) return;
    const container = scrollContainerRef.current;
    if (container) {
      const videoHeight = container.clientHeight;
      container.scrollTo({ top: index * videoHeight, behavior: 'smooth' });
    }
  }, [videos.length]);

  return {
    // State
    activeTab,
    setActiveTab,
    selectedVibe,
    setSelectedVibe,
    showVibes,
    setShowVibes,
    videos,
    setVideos,
    currentIndex,
    isLoading,
    loadingMore,
    hasMore,
    scrollContainerRef,
    // Actions
    scrollToVideo,
    loadVideos,
  };
}
