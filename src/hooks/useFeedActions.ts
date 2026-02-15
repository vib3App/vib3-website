'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { videoApi } from '@/services/api';
import { useSocialStore } from '@/stores/socialStore';
import { performWithOfflineFallback } from '@/utils/offlineQueue';
import type { Video } from '@/types';

interface UseFeedActionsOptions {
  videos: Video[];
  setVideos: React.Dispatch<React.SetStateAction<Video[]>>;
  isAuthenticated: boolean;
}

export function useFeedActions({ videos, setVideos, isAuthenticated }: UseFeedActionsOptions) {
  const router = useRouter();

  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const handleLike = useCallback(async (index: number) => {
    const video = videos[index];
    if (!video) return;
    if (!isAuthenticated) { router.push('/login'); return; }

    setVideos(prev => prev.map((v, i) =>
      i === index ? { ...v, isLiked: !v.isLiked, likesCount: v.isLiked ? v.likesCount - 1 : v.likesCount + 1 } : v
    ));

    const token = localStorage.getItem('auth_token') || '';
    const { queued } = await performWithOfflineFallback(
      { type: 'like', endpoint: `/videos/${video.id}/like`, method: 'POST', token },
      () => videoApi.toggleLike(video.id),
    );
    if (!queued) return;
    // Don't revert optimistic update for queued actions - will sync later
  }, [videos, isAuthenticated, router, setVideos]);

  const handleSave = useCallback(async (index: number) => {
    const video = videos[index];
    if (!video || !isAuthenticated) return;

    const wasFavorited = video.isFavorited;
    setVideos(prev => prev.map((v, i) =>
      i === index ? {
        ...v,
        isFavorited: !v.isFavorited,
        savesCount: wasFavorited ? (v.savesCount || 1) - 1 : (v.savesCount || 0) + 1
      } : v
    ));

    try {
      const result = await videoApi.toggleFavorite(video.id);
      // Update with actual count from server
      setVideos(prev => prev.map((v, i) =>
        i === index ? { ...v, isFavorited: result.favorited, savesCount: result.favoriteCount } : v
      ));
    } catch {
      setVideos(prev => prev.map((v, i) =>
        i === index ? {
          ...v,
          isFavorited: wasFavorited,
          savesCount: wasFavorited ? (v.savesCount || 0) + 1 : (v.savesCount || 1) - 1
        } : v
      ));
    }
  }, [videos, isAuthenticated, setVideos]);

  const handleFollow = useCallback(async (index: number) => {
    const video = videos[index];
    if (!video) return;
    if (!isAuthenticated) { router.push('/login'); return; }

    // Use social store for follow toggle - it handles API call and state update
    const { toggleFollow, isFollowing } = useSocialStore.getState();
    const wasFollowing = isFollowing(video.userId);

    // Optimistically update video state
    setVideos(prev => prev.map(v =>
      v.userId === video.userId ? { ...v, isFollowing: !wasFollowing } : v
    ));

    try {
      await toggleFollow(video.userId);
    } catch {
      // Revert on error
      setVideos(prev => prev.map(v =>
        v.userId === video.userId ? { ...v, isFollowing: wasFollowing } : v
      ));
    }
  }, [videos, isAuthenticated, router, setVideos]);

  const handleComment = useCallback((videoId: string) => {
    setSelectedVideoId(videoId);
    setCommentsOpen(true);
  }, []);

  // Called when user successfully posts a comment
  const handleCommentAdded = useCallback((videoId: string) => {
    setVideos(prev => prev.map(v =>
      v.id === videoId ? {
        ...v,
        hasCommented: true,
        commentsCount: (v.commentsCount || 0) + 1
      } : v
    ));
  }, [setVideos]);

  const handleShare = useCallback((videoId: string) => {
    setSelectedVideoId(videoId);
    setShareOpen(true);
  }, []);

  // Called when user shares a video
  const handleShareComplete = useCallback(async (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (!video || video.hasShared) return; // Only count first share

    setVideos(prev => prev.map(v =>
      v.id === videoId ? {
        ...v,
        hasShared: true,
        sharesCount: (v.sharesCount || 0) + 1
      } : v
    ));

    try {
      await videoApi.shareVideo(videoId);
    } catch {
      // Silently fail - share was still shown to user
    }
  }, [videos, setVideos]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const toggleQueue = useCallback(() => {
    setShowQueue(prev => !prev);
  }, []);

  const closeQueue = useCallback(() => {
    setShowQueue(false);
  }, []);

  const closeComments = useCallback(() => {
    setCommentsOpen(false);
  }, []);

  const closeShare = useCallback(() => {
    setShareOpen(false);
  }, []);

  const selectedVideo = videos.find(v => v.id === selectedVideoId);

  return {
    // State
    isMuted,
    showQueue,
    commentsOpen,
    shareOpen,
    selectedVideo,
    // Actions
    handleLike,
    handleSave,
    handleFollow,
    handleComment,
    handleCommentAdded,
    handleShare,
    handleShareComplete,
    toggleMute,
    toggleQueue,
    closeQueue,
    closeComments,
    closeShare,
  };
}
