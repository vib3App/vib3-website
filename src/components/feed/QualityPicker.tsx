'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';

interface QualityPickerProps {
  /** Ref to the HLS instance (obtained via the video player) */
  hlsRef: React.RefObject<Hls | null>;
}

interface QualityLevel {
  index: number;
  label: string;
  height: number;
}

/**
 * QualityPicker - Gear icon button that opens a popup showing available
 * HLS quality levels. Sets hls.currentLevel on selection.
 */
export function QualityPicker({ hlsRef }: QualityPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 = Auto
  const menuRef = useRef<HTMLDivElement>(null);

  // Populate quality levels from HLS
  useEffect(() => {
    const hls = hlsRef.current;
    if (!hls) return;

    const updateLevels = () => {
      const hlsLevels = hls.levels;
      if (!hlsLevels || hlsLevels.length === 0) return;

      const qualityLevels: QualityLevel[] = hlsLevels.map((level, i) => ({
        index: i,
        label: level.height ? `${level.height}p` : `Level ${i}`,
        height: level.height,
      }));

      // Sort by height descending
      qualityLevels.sort((a, b) => b.height - a.height);
      setLevels(qualityLevels);
    };

    hls.on(Hls.Events.MANIFEST_PARSED, updateLevels);
    hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
      setCurrentLevel(data.level);
    });

    // Check if levels are already available
    if (hls.levels && hls.levels.length > 0) {
      updateLevels();
      setCurrentLevel(hls.currentLevel);
    }

    return () => {
      hls.off(Hls.Events.MANIFEST_PARSED, updateLevels);
    };
  }, [hlsRef]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const handleSelect = useCallback(
    (levelIndex: number) => {
      const hls = hlsRef.current;
      if (!hls) return;
      hls.currentLevel = levelIndex;
      setCurrentLevel(levelIndex);
      setIsOpen(false);
    },
    [hlsRef]
  );

  const getCurrentLabel = () => {
    if (currentLevel === -1) return 'Auto';
    const level = levels.find((l) => l.index === currentLevel);
    return level?.label || 'Auto';
  };

  // Don't show if there are fewer than 2 quality levels
  if (levels.length < 2) return null;

  return (
    <div ref={menuRef} className="relative">
      {/* Gear icon button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 glass rounded-xl text-white/70 hover:text-white transition-colors group"
        aria-label="Video quality"
        title={`Quality: ${getCurrentLabel()}`}
      >
        <svg
          className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Quality menu popup */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 glass-card border border-white/10 rounded-xl overflow-hidden shadow-xl min-w-[140px] z-50">
          <div className="px-3 py-2 text-xs text-white/50 border-b border-white/10 font-medium">
            Quality
          </div>

          {/* Auto option */}
          <button
            onClick={() => handleSelect(-1)}
            className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${
              currentLevel === -1
                ? 'text-purple-400 bg-purple-500/10'
                : 'text-white hover:bg-white/5'
            }`}
          >
            {currentLevel === -1 && <CheckIcon />}
            <span className={currentLevel !== -1 ? 'ml-6' : ''}>Auto</span>
          </button>

          {/* Quality level options */}
          {levels.map((level) => (
            <button
              key={level.index}
              onClick={() => handleSelect(level.index)}
              className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${
                currentLevel === level.index
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-white hover:bg-white/5'
              }`}
            >
              {currentLevel === level.index && <CheckIcon />}
              <span className={currentLevel !== level.index ? 'ml-6' : ''}>
                {level.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  );
}
