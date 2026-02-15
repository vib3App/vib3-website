'use client';

import { formatTime } from './types';

interface PlayPauseButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export function PlayPauseButton({ isPlaying, onToggle }: PlayPauseButtonProps) {
  return (
    <button onClick={onToggle} className="text-white hover:text-white/80" aria-label={isPlaying ? "Pause" : "Play"}>
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
  );
}

interface SkipButtonProps {
  direction: 'forward' | 'backward';
  onSkip: () => void;
}

export function SkipButton({ direction, onSkip }: SkipButtonProps) {
  return (
    <button onClick={onSkip} className="text-white hover:text-white/80 hidden sm:block" aria-label={direction === 'backward' ? "Skip backward" : "Skip forward"}>
      {direction === 'backward' ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8zm-1.1 11H10v-3.3L9 13v-.7l1.8-.6h.1V16z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8zm.1 11H13v-3.3L14 13v-.7l-1.8-.6h-.1V16z" />
        </svg>
      )}
    </button>
  );
}

interface VolumeControlProps {
  isMuted: boolean;
  volume: number;
  showSlider: boolean;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  onShowSlider: () => void;
  onHideSlider: () => void;
}

export function VolumeControl({
  isMuted,
  volume,
  showSlider,
  onToggleMute,
  onVolumeChange,
  onShowSlider,
  onHideSlider,
}: VolumeControlProps) {
  return (
    <div
      className="relative flex items-center"
      onMouseEnter={onShowSlider}
      onMouseLeave={onHideSlider}
    >
      <button onClick={onToggleMute} className="text-white hover:text-white/80" aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}>
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
      {showSlider && (
        <div className="absolute left-8 w-20 h-1 bg-white/30 rounded-full cursor-pointer hidden sm:block">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
          <div
            className="h-full bg-white rounded-full pointer-events-none"
            style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

interface TimeDisplayProps {
  progress: number;
  duration: number;
}

export function TimeDisplay({ progress, duration }: TimeDisplayProps) {
  return (
    <span className="text-white/70 text-sm hidden sm:block">
      {formatTime(progress)} / {formatTime(duration)}
    </span>
  );
}

interface PiPButtonProps {
  isActive: boolean;
  enabled: boolean;
  onToggle: () => void;
}

export function PiPButton({ isActive, enabled, onToggle }: PiPButtonProps) {
  if (!enabled) return null;

  return (
    <button
      onClick={onToggle}
      className={`text-white hover:text-white/80 hidden sm:block ${isActive ? 'text-purple-400' : ''}`}
      title="Picture in Picture"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
      </svg>
    </button>
  );
}

interface FullscreenButtonProps {
  isFullscreen: boolean;
  onToggle: () => void;
}

export function FullscreenButton({ isFullscreen, onToggle }: FullscreenButtonProps) {
  return (
    <button onClick={onToggle} className="text-white hover:text-white/80" aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
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
  );
}

interface SettingsButtonProps {
  onToggle: () => void;
}

export function SettingsButton({ onToggle }: SettingsButtonProps) {
  return (
    <button onClick={onToggle} className="text-white hover:text-white/80" aria-label="Settings">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
      </svg>
    </button>
  );
}

interface ChaptersButtonProps {
  hasChapters: boolean;
  onToggle: () => void;
}

export function ChaptersButton({ hasChapters, onToggle }: ChaptersButtonProps) {
  if (!hasChapters) return null;

  return (
    <button onClick={onToggle} className="text-white hover:text-white/80 hidden sm:flex items-center gap-1" aria-label="Chapters">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
      </svg>
    </button>
  );
}
