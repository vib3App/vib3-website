'use client';

import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import {
  VideoProgressBar,
  SettingsMenu,
  SpeedMenu,
  QualityMenu,
  ChapterMenu,
  PlayPauseButton,
  SkipButton,
  VolumeControl,
  TimeDisplay,
  PiPButton,
  FullscreenButton,
  SettingsButton,
  ChaptersButton,
  type Chapter,
} from './player';

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
  const {
    // Refs
    videoRef,
    containerRef,
    // HLS state
    qualityLevels,
    currentQuality,
    hasError,
    errorMessage,
    // Playback state
    isPlaying,
    isMuted,
    progress,
    duration,
    buffered,
    isBuffering,
    volume,
    playbackSpeed,
    currentChapter,
    // UI state
    showControlsOverlay,
    showVolumeSlider,
    isFullscreen,
    isPiPActive,
    showSpeedMenu,
    showQualityMenu,
    showChapterMenu,
    showSettingsMenu,
    // Setters
    setShowVolumeSlider,
    setShowSpeedMenu,
    setShowQualityMenu,
    setShowChapterMenu,
    setShowSettingsMenu,
    // Playback handlers
    handlePlay,
    handlePause,
    handleTimeUpdate,
    handleWaiting,
    handleCanPlay,
    togglePlay,
    toggleMute,
    handleVolumeChange,
    seek,
    skipForward,
    skipBackward,
    // Quality/speed
    changeSpeed,
    changeQuality,
    // UI handlers
    togglePiP,
    toggleFullscreen,
    handleMouseMove,
    handleMouseLeave,
    closeMenus,
  } = useVideoPlayer({
    src,
    autoPlay,
    muted, // Pass external muted state
    isActive,
    chapters,
    onPlay,
    onPause,
    onTimeUpdate,
    onError,
    onMiniPlayerToggle,
  });

  const pipEnabled = typeof document !== 'undefined' && document.pictureInPictureEnabled;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        poster={poster}
        muted={muted}
        loop={loop}
        playsInline
        preload="auto"
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

      {isBuffering && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center px-4">
            <svg className="w-12 h-12 text-white/40 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-white/60 text-sm">{errorMessage || 'Video unavailable'}</p>
          </div>
        </div>
      )}

      {!isPlaying && !isBuffering && !hasError && (
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

      {currentChapter && showControlsOverlay && (
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 pointer-events-none">
          <p className="text-white text-sm font-medium">{currentChapter.title}</p>
        </div>
      )}

      {showControls && (
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
            showControlsOverlay || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <VideoProgressBar
            progress={progress}
            duration={duration}
            buffered={buffered}
            chapters={chapters}
            onSeek={seek}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SkipButton direction="backward" onSkip={skipBackward} />
              <PlayPauseButton isPlaying={isPlaying} onToggle={togglePlay} />
              <SkipButton direction="forward" onSkip={skipForward} />
              <VolumeControl
                isMuted={isMuted}
                volume={volume}
                showSlider={showVolumeSlider}
                onToggleMute={toggleMute}
                onVolumeChange={handleVolumeChange}
                onShowSlider={() => setShowVolumeSlider(true)}
                onHideSlider={() => setShowVolumeSlider(false)}
              />
              <TimeDisplay progress={progress} duration={duration} />
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <ChaptersButton
                  hasChapters={chapters.length > 0}
                  onToggle={() => { closeMenus(); setShowChapterMenu(!showChapterMenu); }}
                />
                <ChapterMenu
                  isOpen={showChapterMenu}
                  chapters={chapters}
                  currentChapter={currentChapter}
                  onClose={() => setShowChapterMenu(false)}
                  onSeekToChapter={seek}
                />
              </div>

              <div className="relative">
                <SettingsButton onToggle={() => { closeMenus(); setShowSettingsMenu(!showSettingsMenu); }} />
                <SettingsMenu
                  isOpen={showSettingsMenu}
                  playbackSpeed={playbackSpeed}
                  qualityLevels={qualityLevels}
                  currentQuality={currentQuality}
                  onOpenSpeedMenu={() => { setShowSettingsMenu(false); setShowSpeedMenu(true); }}
                  onOpenQualityMenu={() => { setShowSettingsMenu(false); setShowQualityMenu(true); }}
                />
              </div>

              <SpeedMenu
                isOpen={showSpeedMenu}
                currentSpeed={playbackSpeed}
                onClose={() => setShowSpeedMenu(false)}
                onChangeSpeed={changeSpeed}
              />

              <QualityMenu
                isOpen={showQualityMenu}
                qualityLevels={qualityLevels}
                currentQuality={currentQuality}
                onClose={() => setShowQualityMenu(false)}
                onChangeQuality={changeQuality}
              />

              <PiPButton
                isActive={isPiPActive}
                enabled={pipEnabled}
                onToggle={togglePiP}
              />

              <FullscreenButton
                isFullscreen={isFullscreen}
                onToggle={toggleFullscreen}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
