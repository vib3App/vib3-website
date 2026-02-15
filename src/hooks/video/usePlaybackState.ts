'use client';

import { useState, useCallback, useEffect, RefObject } from 'react';
import type { Chapter } from '@/components/video/player/types';

interface UsePlaybackStateOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  externalMuted: boolean;
  chapters: Chapter[];
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (time: number, duration: number) => void;
}

export function usePlaybackState({
  videoRef,
  isActive,
  externalMuted,
  chapters,
  onPlay,
  onPause,
  onTimeUpdate,
}: UsePlaybackStateOptions) {
  // Core playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(externalMuted);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);

  // Handle active state - autoplay when active, pause when inactive
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    const playVideo = () => {
      if (cancelled) return;
      video.play().catch((err) => {
        // Autoplay prevented by browser policy
      });
    };

    if (isActive) {
      if (video.readyState >= 3) {
        playVideo();
      } else {
        video.addEventListener('canplay', playVideo, { once: true });
      }
    } else {
      video.pause();
      video.currentTime = 0;
    }

    return () => {
      cancelled = true;
      video.removeEventListener('canplay', playVideo);
    };
  }, [isActive, videoRef]);

  // Sync muted state with external prop
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = externalMuted;
    setIsMuted(externalMuted);
  }, [externalMuted, videoRef]);

  // Track current chapter
  useEffect(() => {
    if (chapters.length === 0) return;

    const chapter = chapters.find(
      (ch, i) =>
        progress >= ch.startTime &&
        (ch.endTime ? progress < ch.endTime : i === chapters.length - 1 || progress < chapters[i + 1]?.startTime)
    );

    if (chapter !== currentChapter) {
      setCurrentChapter(chapter || null);
    }
  }, [progress, chapters, currentChapter]);

  // Event handlers
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    onPause?.();
  }, [onPause]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setProgress(video.currentTime);
    setDuration(video.duration);
    onTimeUpdate?.(video.currentTime, video.duration);

    if (video.buffered.length > 0) {
      setBuffered(video.buffered.end(video.buffered.length - 1));
    }
  }, [onTimeUpdate, videoRef]);

  const handleWaiting = useCallback(() => setIsBuffering(true), []);
  const handleCanPlay = useCallback(() => setIsBuffering(false), []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [videoRef]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, [videoRef]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0 && video.muted) {
      video.muted = false;
      setIsMuted(false);
    }
  }, [videoRef]);

  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(time, video.duration));
  }, [videoRef]);

  const changeSpeed = useCallback((speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
  }, [videoRef]);

  const skipForward = useCallback(() => seek(progress + 10), [progress, seek]);
  const skipBackward = useCallback(() => seek(progress - 10), [progress, seek]);

  return {
    // State
    isPlaying,
    isMuted,
    progress,
    duration,
    buffered,
    isBuffering,
    volume,
    playbackSpeed,
    currentChapter,
    // Handlers
    handlePlay,
    handlePause,
    handleTimeUpdate,
    handleWaiting,
    handleCanPlay,
    togglePlay,
    toggleMute,
    handleVolumeChange,
    seek,
    changeSpeed,
    skipForward,
    skipBackward,
  };
}
