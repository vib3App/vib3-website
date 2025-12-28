/**
 * VideoPlayer - Main video player component
 * Composes VideoElement, VideoControls, and hooks
 */
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { VideoElement } from './VideoElement';
import { VideoControls } from './VideoControls';
import { useHLS, useVideoPlayerState } from '../hooks';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  aspectRatio?: number;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  showControls?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (time: number) => void;
  className?: string;
}

export function VideoPlayer({
  src,
  poster,
  aspectRatio,
  autoPlay = false,
  muted = true,
  loop = false,
  showControls = true,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  className = '',
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [controlsVisible, setControlsVisible] = useState(false);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // HLS hook for video source management
  const { videoRef, isLoading, error, qualities, currentQuality, setQuality, retry } =
    useHLS({ src, autoPlay });

  // Player state hook for playback controls
  const playerState = useVideoPlayerState({ videoRef, initialMuted: muted });

  // Auto-hide controls
  const showControlsTemporarily = useCallback(() => {
    setControlsVisible(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    hideControlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  }, []);

  // Event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => onPlay?.();
    const handlePause = () => onPause?.();
    const handleEnded = () => onEnded?.();
    const handleTimeUpdate = () => onTimeUpdate?.(video.currentTime);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoRef, onPlay, onPause, onEnded, onTimeUpdate]);

  // Fullscreen handler
  const handleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  }, []);

  // Click to play/pause
  const handleVideoClick = useCallback(() => {
    playerState.togglePlay();
    showControlsTemporarily();
  }, [playerState, showControlsTemporarily]);

  return (
    <div
      ref={containerRef}
      className={`relative bg-black overflow-hidden ${className}`}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => setControlsVisible(false)}
    >
      {/* Video */}
      <VideoElement
        ref={videoRef}
        poster={poster}
        aspectRatio={aspectRatio}
        loop={loop}
        muted={playerState.isMuted}
        onClick={handleVideoClick}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
          <p className="mb-4 text-white/70">{error}</p>
          <button
            onClick={retry}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-400 rounded-lg hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      )}

      {/* Play button overlay when paused */}
      {!playerState.isPlaying && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <VideoControls
          isPlaying={playerState.isPlaying}
          isMuted={playerState.isMuted}
          currentTime={playerState.currentTime}
          duration={playerState.duration}
          buffered={playerState.buffered}
          volume={playerState.volume}
          qualities={qualities}
          currentQuality={currentQuality}
          onPlayPause={playerState.togglePlay}
          onSeek={playerState.seek}
          onMuteToggle={playerState.toggleMute}
          onVolumeChange={playerState.setVolume}
          onQualityChange={setQuality}
          onFullscreen={handleFullscreen}
          visible={controlsVisible || !playerState.isPlaying}
        />
      )}
    </div>
  );
}
