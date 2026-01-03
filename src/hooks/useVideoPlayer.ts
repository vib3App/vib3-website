'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import type { Chapter, QualityLevel } from '@/components/video/player/types';

interface UseVideoPlayerOptions {
  src: string;
  autoPlay: boolean;
  muted: boolean;
  isActive: boolean;
  chapters: Chapter[];
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (time: number, duration: number) => void;
  onError?: (error: Error) => void;
  onMiniPlayerToggle?: (isMini: boolean) => void;
}

export function useVideoPlayer({
  src,
  autoPlay,
  muted: externalMuted,
  isActive,
  chapters,
  onPlay,
  onPause,
  onTimeUpdate,
  onError,
  onMiniPlayerToggle,
}: UseVideoPlayerOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Core state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(externalMuted);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControlsOverlay, setShowControlsOverlay] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Enhanced features state
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Menu states
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showChapterMenu, setShowChapterMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // Initialize HLS or native video - only depends on src, not isActive
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const isHls = src.includes('.m3u8');

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        capLevelToPlayerSize: true,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const levels: QualityLevel[] = data.levels.map((level, index) => ({
          height: level.height,
          bitrate: level.bitrate,
          label: level.height ? `${level.height}p` : `Level ${index}`,
        }));
        setQualityLevels(levels);
        // Don't autoplay here - let the isActive effect handle it
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentQuality(data.level);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          // Check for 404/network errors (video doesn't exist on CDN)
          const is404 = data.details === 'manifestLoadError' ||
                        data.details === 'manifestParsingError' ||
                        data.response?.code === 404;

          const errorMsg = is404
            ? 'Video not available'
            : `Playback error: ${data.details}`;

          setHasError(true);
          setErrorMessage(errorMsg);
          setIsBuffering(false);

          console.warn(`Video playback error: ${data.details}`, { src, data });
          onError?.(new Error(errorMsg));
        }
      });
    } else {
      video.src = src;
      // Don't autoplay here - let the isActive effect handle it
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, onError]);

  // Handle active state - autoplay when active, pause when inactive
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    const playVideo = () => {
      if (cancelled) return;
      video.play().catch((err) => {
        console.log('Autoplay prevented:', err);
      });
    };

    if (isActive) {
      // If video is ready, play immediately, otherwise wait for canplay
      if (video.readyState >= 3) {
        playVideo();
      } else {
        video.addEventListener('canplay', playVideo, { once: true });
      }
    } else {
      // Pause the video when not active
      video.pause();
      // Reset to beginning when scrolling away (optional, better UX)
      video.currentTime = 0;
    }

    // Cleanup: cancel pending play and remove listener
    return () => {
      cancelled = true;
      video.removeEventListener('canplay', playVideo);
    };
  }, [isActive]);

  // Sync muted state with external prop
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = externalMuted;
    setIsMuted(externalMuted);
  }, [externalMuted]);

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

  // PiP event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPiP = () => setIsPiPActive(true);
    const handleLeavePiP = () => setIsPiPActive(false);

    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
  }, [onTimeUpdate]);

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
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0 && video.muted) {
      video.muted = false;
      setIsMuted(false);
    }
  }, []);

  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(time, video.duration));
  }, []);

  const changeSpeed = useCallback((speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    setShowSettingsMenu(false);
  }, []);

  const changeQuality = useCallback((level: number) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = level;
    setCurrentQuality(level);
    setShowQualityMenu(false);
    setShowSettingsMenu(false);
  }, []);

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        onMiniPlayerToggle?.(false);
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
        onMiniPlayerToggle?.(true);
      }
    } catch (err) {
      console.error('PiP error:', err);
    }
  }, [onMiniPlayerToggle]);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  const skipForward = useCallback(() => seek(progress + 10), [progress, seek]);
  const skipBackward = useCallback(() => seek(progress - 10), [progress, seek]);

  const handleMouseMove = useCallback(() => {
    setShowControlsOverlay(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      setShowControlsOverlay(false);
      setShowSpeedMenu(false);
      setShowQualityMenu(false);
      setShowSettingsMenu(false);
      setShowChapterMenu(false);
    }, 3000);
  }, []);

  const closeMenus = useCallback(() => {
    setShowSpeedMenu(false);
    setShowQualityMenu(false);
    setShowChapterMenu(false);
    setShowSettingsMenu(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowControlsOverlay(false);
    closeMenus();
  }, [closeMenus]);

  return {
    // Refs
    videoRef,
    containerRef,
    // State
    isPlaying,
    isMuted,
    progress,
    duration,
    buffered,
    isBuffering,
    showControlsOverlay,
    playbackSpeed,
    qualityLevels,
    currentQuality,
    isPiPActive,
    currentChapter,
    volume,
    showVolumeSlider,
    isFullscreen,
    showSpeedMenu,
    showQualityMenu,
    showChapterMenu,
    showSettingsMenu,
    // Error state
    hasError,
    errorMessage,
    // Setters
    setShowVolumeSlider,
    setShowSpeedMenu,
    setShowQualityMenu,
    setShowChapterMenu,
    setShowSettingsMenu,
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
    changeQuality,
    togglePiP,
    toggleFullscreen,
    skipForward,
    skipBackward,
    handleMouseMove,
    handleMouseLeave,
    closeMenus,
  };
}
