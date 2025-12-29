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
  const player = useVideoPlayer({
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
      ref={player.containerRef}
      className={`relative bg-black ${className}`}
      onMouseMove={player.handleMouseMove}
      onMouseLeave={player.handleMouseLeave}
    >
      <video
        ref={player.videoRef}
        poster={poster}
        muted={muted}
        loop={loop}
        playsInline
        onClick={player.togglePlay}
        onDoubleClick={player.toggleFullscreen}
        onPlay={player.handlePlay}
        onPause={player.handlePause}
        onEnded={onEnded}
        onTimeUpdate={player.handleTimeUpdate}
        onWaiting={player.handleWaiting}
        onCanPlay={player.handleCanPlay}
        className="w-full h-full object-contain"
      />

      {player.isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {!player.isPlaying && !player.isBuffering && (
        <button
          onClick={player.togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20"
        >
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}

      {player.currentChapter && player.showControlsOverlay && (
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 pointer-events-none">
          <p className="text-white text-sm font-medium">{player.currentChapter.title}</p>
        </div>
      )}

      {showControls && (
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
            player.showControlsOverlay || !player.isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <VideoProgressBar
            progress={player.progress}
            duration={player.duration}
            buffered={player.buffered}
            chapters={chapters}
            onSeek={player.seek}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SkipButton direction="backward" onSkip={player.skipBackward} />
              <PlayPauseButton isPlaying={player.isPlaying} onToggle={player.togglePlay} />
              <SkipButton direction="forward" onSkip={player.skipForward} />
              <VolumeControl
                isMuted={player.isMuted}
                volume={player.volume}
                showSlider={player.showVolumeSlider}
                onToggleMute={player.toggleMute}
                onVolumeChange={player.handleVolumeChange}
                onShowSlider={() => player.setShowVolumeSlider(true)}
                onHideSlider={() => player.setShowVolumeSlider(false)}
              />
              <TimeDisplay progress={player.progress} duration={player.duration} />
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <ChaptersButton
                  hasChapters={chapters.length > 0}
                  onToggle={() => { player.closeMenus(); player.setShowChapterMenu(!player.showChapterMenu); }}
                />
                <ChapterMenu
                  isOpen={player.showChapterMenu}
                  chapters={chapters}
                  currentChapter={player.currentChapter}
                  onClose={() => player.setShowChapterMenu(false)}
                  onSeekToChapter={player.seek}
                />
              </div>

              <div className="relative">
                <SettingsButton onToggle={() => { player.closeMenus(); player.setShowSettingsMenu(!player.showSettingsMenu); }} />
                <SettingsMenu
                  isOpen={player.showSettingsMenu}
                  playbackSpeed={player.playbackSpeed}
                  qualityLevels={player.qualityLevels}
                  currentQuality={player.currentQuality}
                  onOpenSpeedMenu={() => { player.setShowSettingsMenu(false); player.setShowSpeedMenu(true); }}
                  onOpenQualityMenu={() => { player.setShowSettingsMenu(false); player.setShowQualityMenu(true); }}
                />
              </div>

              <SpeedMenu
                isOpen={player.showSpeedMenu}
                currentSpeed={player.playbackSpeed}
                onClose={() => player.setShowSpeedMenu(false)}
                onChangeSpeed={player.changeSpeed}
              />

              <QualityMenu
                isOpen={player.showQualityMenu}
                qualityLevels={player.qualityLevels}
                currentQuality={player.currentQuality}
                onClose={() => player.setShowQualityMenu(false)}
                onChangeQuality={player.changeQuality}
              />

              <PiPButton
                isActive={player.isPiPActive}
                enabled={pipEnabled}
                onToggle={player.togglePiP}
              />

              <FullscreenButton
                isFullscreen={player.isFullscreen}
                onToggle={player.toggleFullscreen}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
