'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { feedApi, videoApi, userApi } from '@/services/api';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { BottomNav } from '@/components/ui/BottomNav';
import { SideNav } from '@/components/ui/SideNav';
import { CommentSheet } from '@/components/video/CommentSheet';
import { ShareSheet } from '@/components/video/ShareSheet';
import { useAuthStore } from '@/stores/authStore';
import type { Video } from '@/types';

type FeedTab = 'forYou' | 'following';

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

interface VideoItemProps {
  video: Video;
  isActive: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
  onLike: () => void;
  onSave: () => void;
  onFollow: () => void;
  onComment: () => void;
  onShare: () => void;
  userId?: string;
}

function VideoItem({
  video,
  isActive,
  isMuted,
  onMuteToggle,
  onLike,
  onSave,
  onFollow,
  onComment,
  onShare,
  userId,
}: VideoItemProps) {
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef(0);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!video.isLiked) {
        onLike();
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
    lastTapRef.current = now;
  };

  return (
    <div className="relative w-full h-full snap-start snap-always flex-shrink-0">
      {/* Video */}
      <div className="absolute inset-0" onClick={handleDoubleTap}>
        <VideoPlayer
          src={video.videoUrl}
          poster={video.thumbnailUrl}
          autoPlay={isActive}
          muted={isMuted}
          loop
          isActive={isActive}
          showControls={false}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Double tap heart animation */}
      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <svg className="w-32 h-32 text-red-500 animate-ping" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      {/* Mute button */}
      <button
        onClick={(e) => { e.stopPropagation(); onMuteToggle(); }}
        className="absolute top-16 md:top-4 right-4 z-30 p-2 bg-black/40 backdrop-blur-sm rounded-full"
      >
        {isMuted ? (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        )}
      </button>

      {/* Video Info - Bottom Left */}
      <div className="absolute bottom-24 md:bottom-6 left-4 right-20 z-20">
        <Link href={`/profile/${video.userId}`} className="flex items-center gap-2 mb-2">
          <span className="text-white font-bold text-base hover:underline">@{video.username}</span>
        </Link>
        <p className="text-white/90 text-sm line-clamp-2 mb-2">{video.caption}</p>
        {video.hashtags && video.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {video.hashtags.slice(0, 4).map(tag => (
              <Link key={tag} href={`/hashtag/${tag}`} className="text-white/80 text-sm hover:text-white">
                #{tag}
              </Link>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '3s' }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
          <span className="text-white text-sm">{video.musicInfo?.title || 'Original Sound'}</span>
        </div>
      </div>

      {/* Action Buttons - Right Side */}
      <div className="absolute right-3 bottom-28 md:bottom-16 flex flex-col items-center gap-5 z-20">
        {/* Profile */}
        <div className="relative">
          <Link href={`/profile/${video.userId}`}>
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white">
              {video.userAvatar ? (
                <Image src={video.userAvatar} alt={video.username} width={48} height={48} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#6366F1] to-[#14B8A6] flex items-center justify-center text-white font-bold text-lg">
                  {video.username[0].toUpperCase()}
                </div>
              )}
            </div>
          </Link>
          {!video.isFollowing && video.userId !== userId && (
            <button
              onClick={(e) => { e.stopPropagation(); onFollow(); }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#6366F1] rounded-full flex items-center justify-center"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>

        {/* Like */}
        <button onClick={(e) => { e.stopPropagation(); onLike(); }} className="flex flex-col items-center">
          <div className={`transition-transform ${video.isLiked ? 'scale-110' : ''}`}>
            {video.isLiked ? (
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </div>
          <span className="text-white text-xs font-semibold mt-1">{formatCount(video.likesCount)}</span>
        </button>

        {/* Comments */}
        <button onClick={(e) => { e.stopPropagation(); onComment(); }} className="flex flex-col items-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-white text-xs font-semibold mt-1">{formatCount(video.commentsCount)}</span>
        </button>

        {/* Save */}
        <button onClick={(e) => { e.stopPropagation(); onSave(); }} className="flex flex-col items-center">
          {video.isFavorited ? (
            <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          )}
          <span className="text-white text-xs font-semibold mt-1">Save</span>
        </button>

        {/* Share */}
        <button onClick={(e) => { e.stopPropagation(); onShare(); }} className="flex flex-col items-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="text-white text-xs font-semibold mt-1">{formatCount(video.sharesCount || 0)}</span>
        </button>

        {/* Sound disc */}
        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/30 animate-spin" style={{ animationDuration: '3s' }}>
          {video.thumbnailUrl ? (
            <Image src={video.thumbnailUrl} alt="Sound" width={40} height={40} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#6366F1] to-[#14B8A6]" />
          )}
        </div>
      </div>
    </div>
  );
}

function FeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<FeedTab>('forYou');
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [loadingMore, setLoadingMore] = useState(false);

  // Load videos
  const loadVideos = useCallback(async (reset = false) => {
    if (reset) {
      setIsLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const currentPage = reset ? 1 : page;

      const response = activeTab === 'following'
        ? await feedApi.getFollowingFeed(currentPage)
        : await feedApi.getForYouFeed(currentPage);

      if (reset) {
        setVideos(response.items);
        setCurrentIndex(0);
        setPage(1);
      } else {
        setVideos(prev => [...prev, ...response.items]);
      }
      setHasMore(response.hasMore);
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    loadVideos(true);
  }, [activeTab]);

  // Infinite scroll - load more when near end
  useEffect(() => {
    if (currentIndex >= videos.length - 3 && hasMore && !loadingMore && !isLoading && videos.length > 0) {
      setPage(prev => prev + 1);
    }
  }, [currentIndex, videos.length, hasMore, loadingMore, isLoading]);

  // Trigger load when page changes
  useEffect(() => {
    if (page > 1) {
      loadVideos(false);
    }
  }, [page]);

  // Handle URL video parameter
  useEffect(() => {
    const videoId = searchParams.get('video');
    if (videoId && videos.length > 0) {
      const index = videos.findIndex(v => v.id === videoId);
      if (index !== -1) {
        setCurrentIndex(index);
        // Scroll to that video
        const container = scrollContainerRef.current;
        if (container) {
          const videoHeight = container.clientHeight;
          container.scrollTo({ top: index * videoHeight, behavior: 'smooth' });
        }
      }
    }
  }, [searchParams, videos]);

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

  // Action handlers
  const handleLike = async (index: number) => {
    const video = videos[index];
    if (!video) return;
    if (!isAuthenticated) { router.push('/login'); return; }

    setVideos(prev => prev.map((v, i) =>
      i === index ? { ...v, isLiked: !v.isLiked, likesCount: v.isLiked ? v.likesCount - 1 : v.likesCount + 1 } : v
    ));

    try {
      await videoApi.toggleLike(video.id);
    } catch {
      setVideos(prev => prev.map((v, i) =>
        i === index ? { ...v, isLiked: !v.isLiked, likesCount: v.isLiked ? v.likesCount - 1 : v.likesCount + 1 } : v
      ));
    }
  };

  const handleSave = async (index: number) => {
    const video = videos[index];
    if (!video || !isAuthenticated) return;

    setVideos(prev => prev.map((v, i) =>
      i === index ? { ...v, isFavorited: !v.isFavorited } : v
    ));

    try {
      await videoApi.toggleFavorite(video.id);
    } catch {
      setVideos(prev => prev.map((v, i) =>
        i === index ? { ...v, isFavorited: !v.isFavorited } : v
      ));
    }
  };

  const handleFollow = async (index: number) => {
    const video = videos[index];
    if (!video) return;
    if (!isAuthenticated) { router.push('/login'); return; }

    setVideos(prev => prev.map(v =>
      v.userId === video.userId ? { ...v, isFollowing: !v.isFollowing } : v
    ));

    try {
      await userApi.toggleFollow(video.userId, video.isFollowing || false);
    } catch {
      setVideos(prev => prev.map(v =>
        v.userId === video.userId ? { ...v, isFollowing: !v.isFollowing } : v
      ));
    }
  };

  const handleComment = (videoId: string) => {
    setSelectedVideoId(videoId);
    setCommentsOpen(true);
  };

  const handleShare = (videoId: string) => {
    setSelectedVideoId(videoId);
    setShareOpen(true);
  };

  const selectedVideo = videos.find(v => v.id === selectedVideoId);

  // Scroll to specific video
  const scrollToVideo = useCallback((index: number) => {
    if (index < 0 || index >= videos.length) return;
    const container = scrollContainerRef.current;
    if (container) {
      const videoHeight = container.clientHeight;
      container.scrollTo({ top: index * videoHeight, behavior: 'smooth' });
    }
  }, [videos.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (commentsOpen || shareOpen) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
        case 'j':
          e.preventDefault();
          scrollToVideo(currentIndex + 1);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
        case 'k':
          e.preventDefault();
          scrollToVideo(currentIndex - 1);
          break;
        case 'l':
          e.preventDefault();
          handleLike(currentIndex);
          break;
        case 'm':
          e.preventDefault();
          setIsMuted(prev => !prev);
          break;
        case 'c':
          e.preventDefault();
          if (videos[currentIndex]) handleComment(videos[currentIndex].id);
          break;
        case 's':
          e.preventDefault();
          if (videos[currentIndex]) handleShare(videos[currentIndex].id);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, commentsOpen, shareOpen, videos, scrollToVideo]);

  // Mouse wheel navigation
  useEffect(() => {
    let lastWheelTime = 0;
    const handleWheel = (e: WheelEvent) => {
      if (commentsOpen || shareOpen) return;

      const now = Date.now();
      if (now - lastWheelTime < 300) return; // Debounce 300ms

      if (Math.abs(e.deltaY) > 30) {
        lastWheelTime = now;
        if (e.deltaY > 0) {
          scrollToVideo(currentIndex + 1);
        } else {
          scrollToVideo(currentIndex - 1);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentIndex, commentsOpen, shareOpen, scrollToVideo]);

  return (
    <>
      {/* Feed Tabs Header */}
      <header className="fixed top-0 left-0 right-0 z-40 md:left-64 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-center gap-6 pt-4 pb-8">
          <button
            onClick={() => setActiveTab('following')}
            className={`text-lg font-semibold transition-colors ${activeTab === 'following' ? 'text-white' : 'text-white/50'}`}
          >
            Following
          </button>
          <div className="w-0.5 h-4 bg-white/30" />
          <button
            onClick={() => setActiveTab('forYou')}
            className={`text-lg font-semibold transition-colors ${activeTab === 'forYou' ? 'text-white' : 'text-white/50'}`}
          >
            For You
          </button>
        </div>
      </header>

      {/* Search - Top Right */}
      <Link href="/search" className="fixed top-4 right-4 z-40 p-2 bg-black/30 backdrop-blur-sm rounded-full md:hidden">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </Link>

      {/* Scrollable Feed */}
      <div
        ref={scrollContainerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {isLoading && videos.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
              <p className="text-white/50">Loading your feed...</p>
            </div>
          </div>
        ) : videos.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center px-8">
              <div className="w-20 h-20 bg-[#1A1F2E] rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white text-xl font-semibold">No videos yet</h3>
              <p className="text-white/50">
                {activeTab === 'following' ? 'Follow creators to see their content here' : 'Be the first to share something amazing!'}
              </p>
              <Link href="/discover" className="mt-2 px-6 py-3 bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white font-semibold rounded-full">
                Explore
              </Link>
            </div>
          </div>
        ) : (
          <>
            {videos.map((video, index) => (
              <div key={video.id} data-index={index} className="h-full w-full">
                <VideoItem
                  video={video}
                  isActive={index === currentIndex}
                  isMuted={isMuted}
                  onMuteToggle={() => setIsMuted(!isMuted)}
                  onLike={() => handleLike(index)}
                  onSave={() => handleSave(index)}
                  onFollow={() => handleFollow(index)}
                  onComment={() => handleComment(video.id)}
                  onShare={() => handleShare(video.id)}
                  userId={user?.id}
                />
              </div>
            ))}
            {/* Loading more indicator */}
            {loadingMore && (
              <div className="h-full w-full flex items-center justify-center snap-start">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-3 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
                  <p className="text-white/50 text-sm">Loading more...</p>
                </div>
              </div>
            )}
            {/* End of feed */}
            {!hasMore && videos.length > 0 && (
              <div className="h-full w-full flex items-center justify-center snap-start bg-[#0A0E1A]">
                <div className="flex flex-col items-center gap-4 text-center px-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#6366F1] to-[#14B8A6] rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-white text-xl font-semibold">You&apos;re all caught up!</h3>
                  <p className="text-white/50">You&apos;ve seen all the latest videos</p>
                  <button
                    onClick={() => {
                      scrollToVideo(0);
                      loadVideos(true);
                    }}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white font-semibold rounded-full"
                  >
                    Refresh Feed
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Comments Sheet */}
      {selectedVideo && (
        <CommentSheet
          videoId={selectedVideo.id}
          isOpen={commentsOpen}
          onClose={() => setCommentsOpen(false)}
        />
      )}

      {/* Share Sheet */}
      {selectedVideo && (
        <ShareSheet
          videoId={selectedVideo.id}
          videoUrl={selectedVideo.videoUrl}
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
        />
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}

function FeedLoading() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
        <p className="text-white/50">Loading...</p>
      </div>
    </div>
  );
}

export default function FeedPage() {
  return (
    <div className="flex h-screen bg-[#0A0E1A] overflow-hidden">
      <SideNav />

      <main className="flex-1 md:ml-64 h-full relative">
        <Suspense fallback={<FeedLoading />}>
          <FeedContent />
        </Suspense>
      </main>

      <BottomNav />
    </div>
  );
}
