'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { feedApi, videoApi, userApi } from '@/services/api';
import { VideoPlayer } from '@/features/video-player';
import { ActionButton, CommentsSheet, ShareModal, ProfileButton } from '@/components/video';
import { useAuthStore } from '@/stores/authStore';
import type { Video } from '@/types';

type FeedTab = 'forYou' | 'following' | 'trending';

// Icons as components
const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg className="w-6 h-6" fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const CommentIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

const BookmarkIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg className="w-6 h-6" fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

export default function FeedPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<FeedTab>('forYou');
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Modal states
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const loadVideos = useCallback(async (reset = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const currentPage = reset ? 1 : page;
      let response;

      switch (activeTab) {
        case 'following':
          response = await feedApi.getFollowingFeed(currentPage);
          break;
        case 'trending':
          response = await feedApi.getTrendingFeed(currentPage);
          break;
        default:
          response = await feedApi.getForYouFeed(currentPage);
      }

      if (reset) {
        setVideos(response.items);
        setCurrentIndex(0);
        setPage(1);
      } else {
        setVideos((prev) => [...prev, ...response.items]);
      }

      setHasMore(response.hasMore);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to load videos');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    loadVideos(true);
  }, [activeTab]);

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (hasMore) {
      setPage((prev) => prev + 1);
      loadVideos();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleLike = async (videoId: string) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    try {
      const result = await videoApi.toggleLike(videoId);
      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoId
            ? { ...v, isLiked: result.liked, likesCount: result.likesCount }
            : v
        )
      );
    } catch (err) {
      console.error('Failed to like video:', err);
    }
  };

  const handleFavorite = async (videoId: string) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    try {
      const result = await videoApi.toggleFavorite(videoId);
      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoId
            ? { ...v, isFavorited: result.favorited }
            : v
        )
      );
    } catch (err) {
      console.error('Failed to favorite video:', err);
    }
  };

  const handleComment = () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    setCommentsOpen(true);
  };

  const handleShare = () => {
    setShareOpen(true);
  };

  const handleFollow = async (userId: string, currentlyFollowing: boolean) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    try {
      const result = await userApi.toggleFollow(userId, currentlyFollowing);
      setVideos((prev) =>
        prev.map((v) =>
          v.userId === userId
            ? { ...v, isFollowing: result.following }
            : v
        )
      );
    } catch (err) {
      console.error('Failed to follow user:', err);
    }
  };

  const handleProfile = (userId: string) => {
    // TODO: Navigate to profile page when implemented
    console.log('Navigate to profile:', userId);
  };

  const handleCommentAdded = () => {
    // Update comment count
    setVideos((prev) =>
      prev.map((v, i) =>
        i === currentIndex
          ? { ...v, commentsCount: v.commentsCount + 1 }
          : v
      )
    );
  };

  const currentVideo = videos[currentIndex];

  return (
    <div className="h-screen bg-[#0A0E1A] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#14B8A6] flex items-center justify-center font-bold text-sm text-white">
            V
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-[#6366F1] to-[#14B8A6] bg-clip-text text-transparent">
            VIB3
          </span>
        </Link>

        {/* Feed tabs */}
        <div className="flex gap-1 bg-[#1A1F2E] rounded-lg p-1">
          {(['forYou', 'following', 'trending'] as FeedTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-[#6366F1] text-white'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {tab === 'forYou' ? 'For You' : tab === 'following' ? 'Following' : 'Trending'}
            </button>
          ))}
        </div>

        {/* Auth */}
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="text-white/70 text-sm">@{user?.username}</span>
            <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center text-white font-medium">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-[#6366F1] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5558E3] transition-colors"
          >
            Sign In
          </Link>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center relative overflow-hidden">
        {isLoading && videos.length === 0 ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
            <p className="text-white/50">Loading videos...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-white/70">{error}</p>
            <button
              onClick={() => loadVideos(true)}
              className="bg-[#6366F1] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#5558E3] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <div className="w-16 h-16 bg-[#1A1F2E] rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-white/70">No videos yet</p>
            <p className="text-white/40 text-sm">Be the first to share something!</p>
          </div>
        ) : currentVideo ? (
          <div className="relative w-full max-w-md h-full max-h-[80vh] mx-auto">
            {/* Video player */}
            <VideoPlayer
              src={currentVideo.videoUrl}
              poster={currentVideo.thumbnailUrl}
              autoPlay
              muted={false}
              loop
              className="w-full h-full rounded-2xl"
            />

            {/* Video info overlay */}
            <div className="absolute bottom-0 left-0 right-20 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366F1] to-[#14B8A6] flex items-center justify-center text-white font-medium">
                  {currentVideo.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-white font-semibold">@{currentVideo.username}</p>
                </div>
              </div>
              <p className="text-white/90 text-sm line-clamp-2">{currentVideo.caption}</p>
              {currentVideo.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {currentVideo.hashtags.slice(0, 5).map((tag) => (
                    <span key={tag} className="text-[#6366F1] text-xs">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons - matching Flutter design */}
            <div className="absolute right-2 bottom-24 flex flex-col items-center gap-3">
              {/* Profile with Follow */}
              <ProfileButton
                username={currentVideo.username}
                userAvatar={currentVideo.userAvatar}
                isFollowing={currentVideo.isFollowing || false}
                isOwnVideo={currentVideo.userId === user?.id}
                onFollow={() => handleFollow(currentVideo.userId, currentVideo.isFollowing || false)}
                onProfile={() => handleProfile(currentVideo.userId)}
              />

              {/* Like */}
              <ActionButton
                icon={<HeartIcon />}
                activeIcon={<HeartIcon filled />}
                isActive={currentVideo.isLiked}
                label={currentVideo.likesCount}
                onClick={() => handleLike(currentVideo.id)}
              />

              {/* Comment */}
              <ActionButton
                icon={<CommentIcon />}
                label={currentVideo.commentsCount}
                onClick={handleComment}
                gradientFrom="#14B8A6"
                gradientTo="#6366F1"
              />

              {/* Share */}
              <ActionButton
                icon={<ShareIcon />}
                label={currentVideo.sharesCount}
                onClick={handleShare}
              />

              {/* Bookmark/Favorite */}
              <ActionButton
                icon={<BookmarkIcon />}
                activeIcon={<BookmarkIcon filled />}
                isActive={currentVideo.isFavorited}
                onClick={() => handleFavorite(currentVideo.id)}
                gradientFrom="#14B8A6"
                gradientTo="#6366F1"
              />
            </div>

            {/* Navigation arrows */}
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === videos.length - 1 && !hasMore}
              className="absolute right-20 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ) : null}
      </main>

      {/* Video counter */}
      {videos.length > 0 && (
        <div className="text-center py-2 text-white/30 text-sm">
          {currentIndex + 1} / {videos.length}
        </div>
      )}

      {/* Comments Sheet */}
      {currentVideo && (
        <CommentsSheet
          videoId={currentVideo.id}
          isOpen={commentsOpen}
          onClose={() => setCommentsOpen(false)}
          onCommentAdded={handleCommentAdded}
        />
      )}

      {/* Share Modal */}
      {currentVideo && (
        <ShareModal
          videoId={currentVideo.id}
          videoUrl={currentVideo.videoUrl}
          caption={currentVideo.caption || ''}
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
