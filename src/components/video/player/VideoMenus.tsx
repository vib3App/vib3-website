'use client';

import type { Chapter, QualityLevel } from './types';
import { PLAYBACK_SPEEDS, formatTime } from './types';

interface SettingsMenuProps {
  isOpen: boolean;
  playbackSpeed: number;
  qualityLevels: QualityLevel[];
  currentQuality: number;
  onOpenSpeedMenu: () => void;
  onOpenQualityMenu: () => void;
}

export function SettingsMenu({
  isOpen,
  playbackSpeed,
  qualityLevels,
  currentQuality,
  onOpenSpeedMenu,
  onOpenQualityMenu,
}: SettingsMenuProps) {
  if (!isOpen) return null;

  const getQualityLabel = () => {
    if (currentQuality === -1) return 'Auto';
    return qualityLevels[currentQuality]?.label || 'Auto';
  };

  return (
    <div className="absolute bottom-8 right-0 bg-black/90 backdrop-blur-sm rounded-lg py-2 min-w-[180px]">
      <button
        onClick={onOpenSpeedMenu}
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-white hover:bg-white/10"
      >
        <span>Speed</span>
        <span className="text-white/50">{playbackSpeed}x</span>
      </button>
      {qualityLevels.length > 0 && (
        <button
          onClick={onOpenQualityMenu}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-white hover:bg-white/10"
        >
          <span>Quality</span>
          <span className="text-white/50">{getQualityLabel()}</span>
        </button>
      )}
    </div>
  );
}

interface SpeedMenuProps {
  isOpen: boolean;
  currentSpeed: number;
  onClose: () => void;
  onChangeSpeed: (speed: number) => void;
}

export function SpeedMenu({ isOpen, currentSpeed, onClose, onChangeSpeed }: SpeedMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-12 right-4 bg-black/90 backdrop-blur-sm rounded-lg py-2 min-w-[120px]">
      <button
        onClick={onClose}
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
            onClick={() => onChangeSpeed(speed)}
            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-white/10 ${
              currentSpeed === speed ? 'text-purple-400' : 'text-white'
            }`}
          >
            {speed}x {currentSpeed === speed && '✓'}
          </button>
        ))}
      </div>
    </div>
  );
}

interface QualityMenuProps {
  isOpen: boolean;
  qualityLevels: QualityLevel[];
  currentQuality: number;
  onClose: () => void;
  onChangeQuality: (level: number) => void;
}

export function QualityMenu({ isOpen, qualityLevels, currentQuality, onClose, onChangeQuality }: QualityMenuProps) {
  if (!isOpen || qualityLevels.length === 0) return null;

  return (
    <div className="absolute bottom-12 right-4 bg-black/90 backdrop-blur-sm rounded-lg py-2 min-w-[120px]">
      <button
        onClick={onClose}
        className="w-full flex items-center gap-2 px-3 py-1 text-sm text-white/70 hover:bg-white/10"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        Quality
      </button>
      <div className="border-t border-white/10 mt-1 pt-1">
        <button
          onClick={() => onChangeQuality(-1)}
          className={`w-full text-left px-3 py-1.5 text-sm hover:bg-white/10 ${
            currentQuality === -1 ? 'text-purple-400' : 'text-white'
          }`}
        >
          Auto {currentQuality === -1 && '✓'}
        </button>
        {qualityLevels.map((level, i) => (
          <button
            key={i}
            onClick={() => onChangeQuality(i)}
            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-white/10 ${
              currentQuality === i ? 'text-purple-400' : 'text-white'
            }`}
          >
            {level.label} {currentQuality === i && '✓'}
          </button>
        ))}
      </div>
    </div>
  );
}

interface ChapterMenuProps {
  isOpen: boolean;
  chapters: Chapter[];
  currentChapter: Chapter | null;
  onClose: () => void;
  onSeekToChapter: (time: number) => void;
}

export function ChapterMenu({ isOpen, chapters, currentChapter, onClose, onSeekToChapter }: ChapterMenuProps) {
  if (!isOpen || chapters.length === 0) return null;

  return (
    <div className="absolute bottom-8 right-0 bg-black/90 backdrop-blur-sm rounded-lg py-2 min-w-[180px] max-h-64 overflow-y-auto">
      <p className="text-white/50 text-xs px-3 pb-2 border-b border-white/10">Chapters</p>
      {chapters.map((chapter, i) => (
        <button
          key={i}
          onClick={() => { onSeekToChapter(chapter.startTime); onClose(); }}
          className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 ${
            currentChapter === chapter ? 'text-purple-400' : 'text-white'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="truncate mr-2">{chapter.title}</span>
            <span className="text-white/50 text-xs">{formatTime(chapter.startTime)}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
