'use client';

import { useEffect, useCallback } from 'react';
import type { Video } from '@/types';

interface UseFeedNavigationOptions {
  currentIndex: number;
  videos: Video[];
  scrollToVideo: (index: number) => void;
  onLike: (index: number) => void;
  onComment: (videoId: string) => void;
  onShare: (videoId: string) => void;
  toggleMute: () => void;
  disabled: boolean;
}

export function useFeedNavigation({
  currentIndex,
  videos,
  scrollToVideo,
  onLike,
  onComment,
  onShare,
  toggleMute,
  disabled,
}: UseFeedNavigationOptions) {
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
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
          onLike(currentIndex);
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'c':
          e.preventDefault();
          if (videos[currentIndex]) onComment(videos[currentIndex].id);
          break;
        case 's':
          e.preventDefault();
          if (videos[currentIndex]) onShare(videos[currentIndex].id);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, disabled, videos, scrollToVideo, onLike, onComment, onShare, toggleMute]);

  // Mouse wheel navigation
  useEffect(() => {
    let lastWheelTime = 0;
    const handleWheel = (e: WheelEvent) => {
      if (disabled) return;

      const now = Date.now();
      if (now - lastWheelTime < 300) return;

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
  }, [currentIndex, disabled, scrollToVideo]);
}
