'use client';

import type { Chapter } from '@/components/video/player/types';
import { useHlsPlayer } from './video/useHlsPlayer';
import { usePlaybackState } from './video/usePlaybackState';
import { useVideoUI } from './video/useVideoUI';

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
  videoId?: string;
}

/**
 * Unified video player hook that composes HLS, playback, and UI hooks.
 * This is the main hook to use in VideoPlayer component.
 */
export function useVideoPlayer({
  src,
  muted: externalMuted,
  isActive,
  chapters,
  onPlay,
  onPause,
  onTimeUpdate,
  onError,
  onMiniPlayerToggle,
  videoId,
}: UseVideoPlayerOptions) {
  // HLS streaming and quality management
  const hls = useHlsPlayer({ src, onError });

  // Core playback state and controls
  const playback = usePlaybackState({
    videoRef: hls.videoRef,
    isActive,
    externalMuted,
    chapters,
    onPlay,
    onPause,
    onTimeUpdate,
    videoId,
  });

  // UI controls (fullscreen, PiP, menus)
  const ui = useVideoUI({
    videoRef: hls.videoRef,
    onMiniPlayerToggle,
  });

  // Wrap speed change to also close menus
  const changeSpeed = (speed: number) => {
    playback.changeSpeed(speed);
    ui.setShowSpeedMenu(false);
    ui.setShowSettingsMenu(false);
  };

  // Wrap quality change to also close menus
  const changeQuality = (level: number) => {
    hls.changeQuality(level);
    ui.setShowQualityMenu(false);
    ui.setShowSettingsMenu(false);
  };

  return {
    // Refs
    videoRef: hls.videoRef,
    containerRef: ui.containerRef,

    // HLS state
    qualityLevels: hls.qualityLevels,
    currentQuality: hls.currentQuality,
    hasError: hls.hasError,
    errorMessage: hls.errorMessage,

    // Playback state
    isPlaying: playback.isPlaying,
    isMuted: playback.isMuted,
    progress: playback.progress,
    duration: playback.duration,
    buffered: playback.buffered,
    isBuffering: playback.isBuffering,
    volume: playback.volume,
    playbackSpeed: playback.playbackSpeed,
    currentChapter: playback.currentChapter,

    // UI state
    showControlsOverlay: ui.showControlsOverlay,
    showVolumeSlider: ui.showVolumeSlider,
    isFullscreen: ui.isFullscreen,
    isPiPActive: ui.isPiPActive,
    showSpeedMenu: ui.showSpeedMenu,
    showQualityMenu: ui.showQualityMenu,
    showChapterMenu: ui.showChapterMenu,
    showSettingsMenu: ui.showSettingsMenu,

    // Setters
    setShowVolumeSlider: ui.setShowVolumeSlider,
    setShowSpeedMenu: ui.setShowSpeedMenu,
    setShowQualityMenu: ui.setShowQualityMenu,
    setShowChapterMenu: ui.setShowChapterMenu,
    setShowSettingsMenu: ui.setShowSettingsMenu,

    // Playback handlers
    handlePlay: playback.handlePlay,
    handlePause: playback.handlePause,
    handleTimeUpdate: playback.handleTimeUpdate,
    handleWaiting: playback.handleWaiting,
    handleCanPlay: playback.handleCanPlay,
    togglePlay: playback.togglePlay,
    toggleMute: playback.toggleMute,
    handleVolumeChange: playback.handleVolumeChange,
    seek: playback.seek,
    skipForward: playback.skipForward,
    skipBackward: playback.skipBackward,

    // Quality/speed (with menu closing)
    changeSpeed,
    changeQuality,

    // UI handlers
    togglePiP: ui.togglePiP,
    toggleFullscreen: ui.toggleFullscreen,
    handleMouseMove: ui.handleMouseMove,
    handleMouseLeave: ui.handleMouseLeave,
    closeMenus: ui.closeMenus,
  };
}
