'use client';

import { useCallback } from 'react';
import { useVideoShortcuts } from '@/hooks/keyboard/useVideoShortcuts';

/**
 * Wire keyboard shortcuts for the video detail page.
 * Space/K=play/pause, arrows=seek, F=fullscreen, Ctrl+P=PiP,
 * M=mute, Shift+L=like, Shift+C=comment, Shift+S=share, Shift+B=save
 */
export function useVideoPageShortcuts({
  scrollContainerRef,
  currentIndex,
  videosLength,
  toggleMute,
  onLike,
  onSave,
  onComment,
  onShare,
}: {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  currentIndex: number;
  videosLength: number;
  toggleMute: () => void;
  onLike: () => void;
  onSave: () => void;
  onComment: () => void;
  onShare: () => void;
}) {
  const getActiveVideo = useCallback((): HTMLVideoElement | null => {
    const items = scrollContainerRef.current?.querySelectorAll('[data-index]');
    return items?.[currentIndex]?.querySelector('video') ?? null;
  }, [scrollContainerRef, currentIndex]);

  const scrollToVideo = useCallback((i: number) => {
    const c = scrollContainerRef.current;
    if (c) c.scrollTo({ top: Math.max(0, Math.min(i, videosLength - 1)) * c.clientHeight, behavior: 'smooth' });
  }, [scrollContainerRef, videosLength]);

  useVideoShortcuts({
    onPlayPause: () => { const v = getActiveVideo(); if (v) { v.paused ? v.play() : v.pause(); } },
    onSeekForward: (s) => { const v = getActiveVideo(); if (v) v.currentTime = Math.min(v.duration, v.currentTime + s); },
    onSeekBackward: (s) => { const v = getActiveVideo(); if (v) v.currentTime = Math.max(0, v.currentTime - s); },
    onMute: toggleMute,
    onFullscreen: () => {
      const el = getActiveVideo()?.closest('[data-index]') as HTMLElement | null;
      if (el) { document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen(); }
    },
    onPiP: () => {
      const v = getActiveVideo();
      if (v && document.pictureInPictureEnabled) {
        document.pictureInPictureElement ? document.exitPictureInPicture() : v.requestPictureInPicture();
      }
    },
    onNextVideo: () => scrollToVideo(currentIndex + 1),
    onPrevVideo: () => scrollToVideo(currentIndex - 1),
    onLike,
    onComment,
    onShare,
    onSave,
  });
}
