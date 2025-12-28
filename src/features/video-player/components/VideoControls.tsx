/**
 * VideoControls - UI controls for video playback
 * Presentation only, receives all state via props
 */
'use client';

import { useState, useCallback } from 'react';
import type { VideoQuality } from '@/types';

interface VideoControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  qualities: VideoQuality[];
  currentQuality: VideoQuality;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onMuteToggle: () => void;
  onVolumeChange: (volume: number) => void;
  onQualityChange: (quality: VideoQuality) => void;
  onFullscreen?: () => void;
  visible?: boolean;
}

export function VideoControls({
  isPlaying,
  isMuted,
  currentTime,
  duration,
  buffered,
  volume,
  qualities,
  currentQuality,
  onPlayPause,
  onSeek,
  onMuteToggle,
  onVolumeChange,
  onQualityChange,
  onFullscreen,
  visible = true,
}: VideoControlsProps) {
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const formatTime = useCallback((time: number) => {
    if (!isFinite(time) || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  if (!visible) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
      {/* Progress bar */}
      <div
        className="relative w-full h-1 bg-white/30 rounded cursor-pointer mb-3 group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          onSeek(percent * duration);
        }}
      >
        {/* Buffered */}
        <div
          className="absolute h-1 bg-white/50 rounded"
          style={{ width: `${bufferedPercent}%` }}
        />
        {/* Progress */}
        <div
          className="absolute h-1 bg-gradient-to-r from-purple-500 to-teal-400 rounded"
          style={{ width: `${progressPercent}%` }}
        />
        {/* Scrubber handle */}
        <div
          className="absolute w-3 h-3 -mt-1 -ml-1.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progressPercent}%` }}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Play/Pause */}
          <button
            onClick={onPlayPause}
            className="text-white hover:text-purple-400 transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <button
              onClick={onMuteToggle}
              className="text-white hover:text-purple-400 transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12A4.5 4.5 0 0 0 14 8.22v2.05l2.47 2.47c.03-.24.03-.49.03-.74zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.22v7.56c.91-.44 1.5-1.37 1.5-2.78zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 accent-purple-500"
            />
          </div>

          {/* Time */}
          <span className="text-white text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Quality */}
          {qualities.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="flex items-center gap-1 text-white hover:text-purple-400 text-sm bg-white/10 px-2 py-1 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {currentQuality === 'auto' ? 'Auto' : currentQuality}
              </button>
              {showQualityMenu && (
                <div className="absolute bottom-full right-0 mb-2 glass-card border border-white/10 rounded-lg overflow-hidden shadow-xl min-w-[100px]">
                  <div className="px-3 py-1.5 text-xs text-white/50 border-b border-white/10">Quality</div>
                  {qualities.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        onQualityChange(q);
                        setShowQualityMenu(false);
                      }}
                      className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${
                        q === currentQuality
                          ? 'text-purple-400 bg-purple-500/10'
                          : 'text-white hover:bg-white/5'
                      }`}
                    >
                      {q === currentQuality && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      )}
                      <span className={q !== currentQuality ? 'ml-6' : ''}>
                        {q === 'auto' ? 'Auto' : q}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fullscreen */}
          {onFullscreen && (
            <button
              onClick={onFullscreen}
              className="text-white hover:text-purple-400 transition-colors"
              aria-label="Fullscreen"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
