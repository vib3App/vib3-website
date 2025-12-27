/**
 * Video player state management hook
 * Handles play/pause, progress, mute, etc.
 */
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVideoPlayerStateOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  initialMuted?: boolean;
}

interface VideoPlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
}

interface VideoPlayerActions {
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => Promise<void>;
  seek: (time: number) => void;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
}

type UseVideoPlayerStateReturn = VideoPlayerState & VideoPlayerActions;

export function useVideoPlayerState({
  videoRef,
  initialMuted = true,
}: UseVideoPlayerStateOptions): UseVideoPlayerStateReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolumeState] = useState(1);

  const animationFrameRef = useRef<number | null>(null);

  const updateProgress = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);

      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    }
    animationFrameRef.current = requestAnimationFrame(updateProgress);
  }, [videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setIsMuted(video.muted);
      setVolumeState(video.volume);
    };
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoRef, updateProgress]);

  const play = useCallback(async () => {
    const video = videoRef.current;
    if (video) {
      try {
        await video.play();
      } catch {
        // Autoplay blocked
      }
    }
  }, [videoRef]);

  const pause = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
  }, [videoRef]);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.max(0, Math.min(time, video.duration || 0));
    }
  }, [videoRef]);

  const handleSetMuted = useCallback((muted: boolean) => {
    const video = videoRef.current;
    if (video) {
      video.muted = muted;
    }
  }, [videoRef]);

  const toggleMute = useCallback(() => {
    handleSetMuted(!isMuted);
  }, [isMuted, handleSetMuted]);

  const setVolume = useCallback((vol: number) => {
    const video = videoRef.current;
    if (video) {
      video.volume = Math.max(0, Math.min(1, vol));
    }
  }, [videoRef]);

  return {
    isPlaying,
    isMuted,
    currentTime,
    duration,
    buffered,
    volume,
    play,
    pause,
    togglePlay,
    seek,
    setMuted: handleSetMuted,
    toggleMute,
    setVolume,
  };
}
