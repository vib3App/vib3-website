'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { videoApi } from '@/services/api';
import { videoDownloadService } from '@/services/videoDownload';
import type { Video } from '@/types';
import { logger } from '@/utils/logger';

export function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export function useVideoActionState(
  video: Video,
  onCommentClick?: () => void,
  onShareClick?: () => void,
  onCommentAdded?: () => void,
) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const addToast = useToastStore(s => s.addToast);

  const [isLiked, setIsLiked] = useState(video.isLiked || false);
  const [likesCount, setLikesCount] = useState(video.likesCount || 0);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const [hasCommented, setHasCommented] = useState(video.hasCommented || false);
  const [commentsCount, setCommentsCount] = useState(video.commentsCount || 0);
  const [isCommentAnimating, setIsCommentAnimating] = useState(false);

  const [isSaved, setIsSaved] = useState(video.isFavorited || false);
  const [savesCount, setSavesCount] = useState(video.savesCount || 0);
  const [isSaveAnimating, setIsSaveAnimating] = useState(false);

  const [hasShared, setHasShared] = useState(video.hasShared || false);
  const [sharesCount, setSharesCount] = useState(video.sharesCount || 0);
  const [isShareAnimating, setIsShareAnimating] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Sync comment state from parent when video prop updates (e.g. after comment added)
  useEffect(() => {
    const newHasCommented = video.hasCommented || false;
    const newCommentsCount = video.commentsCount || 0;
    if (newHasCommented && !hasCommented) {
      setIsCommentAnimating(true);
      setTimeout(() => setIsCommentAnimating(false), 300);
    }
    setHasCommented(newHasCommented);
    setCommentsCount(newCommentsCount);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync when video prop changes, not internal state
  }, [video.hasCommented, video.commentsCount]);

  const handleLike = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    setIsLikeAnimating(true);
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    setTimeout(() => setIsLikeAnimating(false), 300);
    try {
      await videoApi.toggleLike(video.id);
    } catch (error) {
      setIsLiked(isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      logger.error('Failed to toggle like:', error);
    }
  };

  const handleCommentClick = () => { onCommentClick?.(); };

  // TODO: Wire this to comment submission UI
  const _handleCommentAdded = () => {
    setIsCommentAnimating(true);
    setHasCommented(true);
    setCommentsCount(prev => prev + 1);
    setTimeout(() => setIsCommentAnimating(false), 300);
    onCommentAdded?.();
  };

  const handleSave = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    setIsSaveAnimating(true);
    const wasSaved = isSaved;
    setIsSaved(!isSaved);
    setSavesCount(prev => wasSaved ? prev - 1 : prev + 1);
    setTimeout(() => setIsSaveAnimating(false), 300);
    try {
      await videoApi.toggleFavorite(video.id);
    } catch (error) {
      setIsSaved(wasSaved);
      setSavesCount(prev => wasSaved ? prev + 1 : prev - 1);
      logger.error('Failed to toggle save:', error);
    }
  };

  const handleShare = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (!hasShared) {
      setIsShareAnimating(true);
      setHasShared(true);
      setSharesCount(prev => prev + 1);
      setTimeout(() => setIsShareAnimating(false), 300);
    }
    try { await videoApi.shareVideo(video.id); } catch (error) { logger.error('Failed to record share:', error); }
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.caption || 'Check out this video on VIB3',
          url: `${window.location.origin}/video/${video.id}`,
        });
      } catch { /* User cancelled share */ }
    } else {
      onShareClick?.();
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(0);
    try {
      await videoDownloadService.downloadVideo(video.videoUrl, video.id, {
        onProgress: (progress) => { setDownloadProgress(progress.percent); },
        filename: `vib3-${video.username}-${video.id}.mp4`,
      });
    } catch (error) {
      logger.error('Download failed:', error);
      try { await videoDownloadService.quickDownload(video.videoUrl, video.id); } catch { addToast('Download failed. Please try again.'); }
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  return {
    isLiked, likesCount, isLikeAnimating,
    hasCommented, commentsCount, isCommentAnimating,
    isSaved, savesCount, isSaveAnimating,
    hasShared, sharesCount, isShareAnimating,
    isDownloading, downloadProgress,
    handleLike, handleCommentClick, handleSave, handleShare, handleDownload,
  };
}
