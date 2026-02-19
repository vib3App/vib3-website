'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeedControlProps {
  /** Ref to the video element whose playbackRate to control */
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' },
];

/**
 * SpeedControl - Playback speed control button for feed video player.
 * Shows current speed and a popup menu to select from predefined speeds.
 * Sets video.playbackRate on selection.
 */
export function SpeedControl({ videoRef }: SpeedControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(1);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
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

  const handleSpeedChange = useCallback(
    (speed: number) => {
      const video = videoRef.current;
      if (video) {
        video.playbackRate = speed;
      }
      setCurrentSpeed(speed);
      setIsOpen(false);
    },
    [videoRef]
  );

  const getDisplayLabel = () => {
    if (currentSpeed === 1) return '1x';
    return `${currentSpeed}x`;
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Speed button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2.5 py-1.5 glass rounded-xl text-sm font-medium transition-colors ${
          currentSpeed !== 1
            ? 'text-purple-400 bg-purple-500/10'
            : 'text-white/70 hover:text-white'
        }`}
        aria-label="Playback speed"
        title={`Speed: ${getDisplayLabel()}`}
      >
        {getDisplayLabel()}
      </button>

      {/* Speed menu popup */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 glass-card border border-white/10 rounded-xl overflow-hidden shadow-xl min-w-[100px] z-50">
          <div className="px-3 py-2 text-xs text-white/50 border-b border-white/10 font-medium">
            Speed
          </div>
          {SPEED_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSpeedChange(option.value)}
              className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${
                currentSpeed === option.value
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-white hover:bg-white/5'
              }`}
            >
              {currentSpeed === option.value && (
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
              <span className={currentSpeed !== option.value ? 'ml-6' : ''}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
