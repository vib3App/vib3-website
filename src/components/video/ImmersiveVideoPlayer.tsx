'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoPlayer } from './VideoPlayer';
import { useVideoColors } from '@/hooks/useVideoColors';
import type { Chapter } from './player';

interface ImmersiveVideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  chapters?: Chapter[];
  className?: string;
  ambientEnabled?: boolean;
  theaterMode?: boolean;
  onTheaterModeChange?: (enabled: boolean) => void;
}

/**
 * Immersive video player with ambient color background
 * and theater mode for distraction-free viewing
 */
export function ImmersiveVideoPlayer({
  src,
  poster,
  autoPlay = false,
  muted = true,
  loop = true,
  chapters = [],
  className = '',
  ambientEnabled = true,
  theaterMode: initialTheaterMode = false,
  onTheaterModeChange,
}: ImmersiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [theaterMode, setTheaterMode] = useState(initialTheaterMode);
  const [isHovering, setIsHovering] = useState(false);

  const { colors } = useVideoColors(videoRef, ambientEnabled);

  const toggleTheaterMode = useCallback(() => {
    const newState = !theaterMode;
    setTheaterMode(newState);
    onTheaterModeChange?.(newState);
  }, [theaterMode, onTheaterModeChange]);

  // Handle escape key to exit theater mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && theaterMode) {
        setTheaterMode(false);
        onTheaterModeChange?.(false);
      }
      if (e.key === 't' || e.key === 'T') {
        toggleTheaterMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [theaterMode, onTheaterModeChange, toggleTheaterMode]);

  return (
    <div
      ref={containerRef}
      className={`relative ${theaterMode ? 'fixed inset-0 z-50' : ''} ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Ambient background glow */}
      <AnimatePresence>
        {ambientEnabled && (
          <motion.div
            className="absolute inset-0 -z-10 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Primary glow */}
            <motion.div
              className="absolute -inset-1/2 rounded-full blur-3xl opacity-30"
              animate={{
                background: `radial-gradient(circle, ${colors.dominant} 0%, transparent 70%)`,
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            {/* Secondary vibrant glow */}
            <motion.div
              className="absolute -inset-1/4 rounded-full blur-2xl opacity-20"
              animate={{
                background: `radial-gradient(circle at 30% 70%, ${colors.vibrant} 0%, transparent 50%)`,
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            {/* Color bleed at edges */}
            <motion.div
              className="absolute inset-0"
              animate={{
                boxShadow: `inset 0 0 100px 50px ${colors.background}`,
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theater mode backdrop */}
      <AnimatePresence>
        {theaterMode && (
          <motion.div
            className="fixed inset-0 bg-black/95 -z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Video container */}
      <div
        className={`relative ${
          theaterMode
            ? 'w-full h-full flex items-center justify-center'
            : 'aspect-[9/16] md:aspect-video'
        }`}
      >
        <div className={theaterMode ? 'w-full max-w-6xl max-h-full aspect-video' : 'w-full h-full'}>
          <VideoPlayer
            src={src}
            poster={poster}
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            chapters={chapters}
            className="w-full h-full rounded-xl overflow-hidden"
            showControls={true}
            isActive={true}
          />
        </div>

        {/* Theater mode toggle */}
        <motion.button
          className={`absolute top-4 right-4 p-2 rounded-lg glass text-white/60 hover:text-white transition-colors ${
            isHovering ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={toggleTheaterMode}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={theaterMode ? 'Exit theater mode (T)' : 'Enter theater mode (T)'}
        >
          {theaterMode ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </motion.button>
      </div>

      {/* Quality badge with glow */}
      <motion.div
        className="absolute top-4 left-4 px-2 py-1 rounded text-xs font-medium bg-black/50 text-white/80"
        animate={{
          boxShadow: `0 0 20px ${colors.vibrant}40`,
        }}
        transition={{ duration: 0.5 }}
      >
        HD
      </motion.div>
    </div>
  );
}

export default ImmersiveVideoPlayer;
