'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Hls from 'hls.js';

interface Chapter {
  title: string;
  startTime: number;
  endTime?: number;
}

interface QualityLevel {
  height: number;
  bitrate: number;
  label: string;
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (time: number, duration: number) => void;
  onError?: (error: Error) => void;
  className?: string;
  showControls?: boolean;
  isActive?: boolean;
  chapters?: Chapter[];
  onMiniPlayerToggle?: (isMini: boolean) => void;
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  muted = true,
  loop = true,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onError,
  className = '',
  showControls = true,
  isActive = true,
  chapters = [],
  onMiniPlayerToggle,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Core state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControlsOverlay, setShowControlsOverlay] = useState(false);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Enhanced features state
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 = auto
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [showChapterMenu, setShowChapterMenu] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // Initialize HLS or native video
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
        // Extract quality levels
        const levels: QualityLevel[] = data.levels.map((level, index) => ({
          height: level.height,
          bitrate: level.bitrate,
          label: level.height ? `${level.height}p` : `Level ${index}`,
        }));
        setQualityLevels(levels);

        if (autoPlay && isActive) {
          video.play().catch(() => {});
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentQuality(data.level);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          onError?.(new Error(data.details));
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      if (autoPlay && isActive) {
        video.play().catch(() => {});
      }
    } else {
      video.src = src;
      if (autoPlay && isActive) {
        video.play().catch(() => {});
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay, isActive, onError]);

  // Handle active state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isActive]);

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

    // Update buffered
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

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * duration);
  }, [duration, seek]);

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

  const skipForward = useCallback(() => {
    seek(progress + 10);
  }, [progress, seek]);

  const skipBackward = useCallback(() => {
    seek(progress - 10);
  }, [progress, seek]);

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

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityLabel = () => {
    if (currentQuality === -1) return 'Auto';
    return qualityLevels[currentQuality]?.label || 'Auto';
  };

  const closeMenus = () => {
    setShowSpeedMenu(false);
    setShowQualityMenu(false);
    setShowChapterMenu(false);
    setShowSettingsMenu(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-black ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setShowControlsOverlay(false);
        closeMenus();
      }}
    >
      <video
        ref={videoRef}
        poster={poster}
        muted={isMuted}
        loop={loop}
        playsInline
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={onEnded}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        className="w-full h-full object-contain"
      />

      {/* Buffering indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Play/Pause overlay */}
      {!isPlaying && !isBuffering && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20"
        >
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}

      {/* Current chapter display */}
      {currentChapter && showControlsOverlay && (
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 pointer-events-none">
          <p className="text-white text-sm font-medium">{currentChapter.title}</p>
        </div>
      )}

      {/* Controls overlay */}
      {showControls && (
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
            showControlsOverlay || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Progress bar with buffer and chapters */}
          <div className="relative w-full mb-3 group">
            {/* Chapter markers */}
            {chapters.length > 0 && (
              <div className="absolute inset-x-0 h-1 pointer-events-none">
                {chapters.map((chapter, i) => (
                  <div
                    key={i}
                    className="absolute top-0 w-0.5 h-full bg-white/50"
                    style={{ left: `${(chapter.startTime / duration) * 100}%` }}
                  />
                ))}
              </div>
            )}

            <div
              className="w-full h-1 bg-white/20 rounded-full cursor-pointer relative"
              onClick={handleProgressClick}
            >
              {/* Buffered */}
              <div
                className="absolute h-full bg-white/30 rounded-full"
                style={{ width: `${(buffered / duration) * 100 || 0}%` }}
              />
              {/* Progress */}
              <div
                className="absolute h-full bg-gradient-to-r from-[#6366F1] to-[#14B8A6] rounded-full"
                style={{ width: `${(progress / duration) * 100 || 0}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
              </div>
            </div>

            {/* Time tooltip on hover */}
            <div className="absolute -top-8 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div
                className="absolute bg-black/80 text-white text-xs px-2 py-1 rounded transform -translate-x-1/2"
                style={{ left: `${(progress / duration) * 100}%` }}
              >
                {formatTime(progress)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Skip backward */}
              <button onClick={skipBackward} className="text-white hover:text-white/80 hidden sm:block">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8zm-1.1 11H10v-3.3L9 13v-.7l1.8-.6h.1V16z" />
                </svg>
              </button>

              {/* Play/Pause */}
              <button onClick={togglePlay} className="text-white hover:text-white/80">
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Skip forward */}
              <button onClick={skipForward} className="text-white hover:text-white/80 hidden sm:block">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8zm.1 11H13v-3.3L14 13v-.7l-1.8-.6h-.1V16z" />
                </svg>
              </button>

              {/* Volume */}
              <div
                className="relative flex items-center"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button onClick={toggleMute} className="text-white hover:text-white/80">
                  {isMuted || volume === 0 ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : volume < 0.5 ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>
                {showVolumeSlider && (
                  <div className="absolute left-8 w-20 h-1 bg-white/30 rounded-full cursor-pointer hidden sm:block">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                    <div
                      className="h-full bg-white rounded-full pointer-events-none"
                      style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Time */}
              <span className="text-white/70 text-sm hidden sm:block">
                {formatTime(progress)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Chapters */}
              {chapters.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => { closeMenus(); setShowChapterMenu(!showChapterMenu); }}
                    className="text-white hover:text-white/80 hidden sm:flex items-center gap-1"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                    </svg>
                  </button>
                  {showChapterMenu && (
                    <div className="absolute bottom-8 right-0 bg-black/90 backdrop-blur-sm rounded-lg py-2 min-w-[180px] max-h-64 overflow-y-auto">
                      <p className="text-white/50 text-xs px-3 pb-2 border-b border-white/10">Chapters</p>
                      {chapters.map((chapter, i) => (
                        <button
                          key={i}
                          onClick={() => { seek(chapter.startTime); setShowChapterMenu(false); }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 ${
                            currentChapter === chapter ? 'text-[#6366F1]' : 'text-white'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="truncate mr-2">{chapter.title}</span>
                            <span className="text-white/50 text-xs">{formatTime(chapter.startTime)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Menu */}
              <div className="relative">
                <button
                  onClick={() => { closeMenus(); setShowSettingsMenu(!showSettingsMenu); }}
                  className="text-white hover:text-white/80"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                  </svg>
                </button>
                {showSettingsMenu && (
                  <div className="absolute bottom-8 right-0 bg-black/90 backdrop-blur-sm rounded-lg py-2 min-w-[180px]">
                    {/* Speed */}
                    <button
                      onClick={() => { setShowSettingsMenu(false); setShowSpeedMenu(true); }}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-white hover:bg-white/10"
                    >
                      <span>Speed</span>
                      <span className="text-white/50">{playbackSpeed}x</span>
                    </button>
                    {/* Quality */}
                    {qualityLevels.length > 0 && (
                      <button
                        onClick={() => { setShowSettingsMenu(false); setShowQualityMenu(true); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-white hover:bg-white/10"
                      >
                        <span>Quality</span>
                        <span className="text-white/50">{getQualityLabel()}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Speed Menu */}
              {showSpeedMenu && (
                <div className="absolute bottom-12 right-4 bg-black/90 backdrop-blur-sm rounded-lg py-2 min-w-[120px]">
                  <button
                    onClick={() => setShowSpeedMenu(false)}
                    className="w-full flex items-center gap-2 px-3 py-1 text-sm text-white/70 hover:bg-white/10"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                    Speed
                  </button>
                  <div className="border-t border-white/10 mt-1 pt-1">
                    {PLAYBACK_SPEEDS.map(speed => (
                      <button
                        key={speed}
                        onClick={() => changeSpeed(speed)}
                        className={`w-full text-left px-3 py-1.5 text-sm hover:bg-white/10 ${
                          playbackSpeed === speed ? 'text-[#6366F1]' : 'text-white'
                        }`}
                      >
                        {speed}x {playbackSpeed === speed && '✓'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality Menu */}
              {showQualityMenu && qualityLevels.length > 0 && (
                <div className="absolute bottom-12 right-4 bg-black/90 backdrop-blur-sm rounded-lg py-2 min-w-[120px]">
                  <button
                    onClick={() => setShowQualityMenu(false)}
                    className="w-full flex items-center gap-2 px-3 py-1 text-sm text-white/70 hover:bg-white/10"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                    Quality
                  </button>
                  <div className="border-t border-white/10 mt-1 pt-1">
                    <button
                      onClick={() => changeQuality(-1)}
                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-white/10 ${
                        currentQuality === -1 ? 'text-[#6366F1]' : 'text-white'
                      }`}
                    >
                      Auto {currentQuality === -1 && '✓'}
                    </button>
                    {qualityLevels.map((level, i) => (
                      <button
                        key={i}
                        onClick={() => changeQuality(i)}
                        className={`w-full text-left px-3 py-1.5 text-sm hover:bg-white/10 ${
                          currentQuality === i ? 'text-[#6366F1]' : 'text-white'
                        }`}
                      >
                        {level.label} {currentQuality === i && '✓'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PiP */}
              {document.pictureInPictureEnabled && (
                <button
                  onClick={togglePiP}
                  className={`text-white hover:text-white/80 hidden sm:block ${isPiPActive ? 'text-[#6366F1]' : ''}`}
                  title="Picture in Picture"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
                  </svg>
                </button>
              )}

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-white/80"
              >
                {isFullscreen ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
