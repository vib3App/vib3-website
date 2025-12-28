'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { videoApi } from '@/services/api';
import { useSocialStore } from '@/stores/socialStore';
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

    try {
      await videoApi.toggleLike(video.id);
    } catch {
      setVideos(prev => prev.map((v, i) =>
        i === index ? { ...v, isLiked: !v.isLiked, likesCount: v.isLiked ? v.likesCount - 1 : v.likesCount + 1 } : v
      ));
    }
  }, [videos, isAuthenticated, router, setVideos]);

  const handleSave = useCallback(async (index: number) => {
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

  const handleShare = useCallback((videoId: string) => {
    setSelectedVideoId(videoId);
    setShareOpen(true);
  }, []);

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
    handleShare,
    toggleMute,
    toggleQueue,
    closeQueue,
    closeComments,
    closeShare,
  };
}
