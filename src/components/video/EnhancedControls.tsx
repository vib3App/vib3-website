'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';

interface SpeedControlProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
}

const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

/**
 * Speed control with visual time-warp effect
 */
export function SpeedControl({ currentSpeed, onSpeedChange }: SpeedControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showEffect, setShowEffect] = useState(false);

  const handleSpeedChange = useCallback((speed: number) => {
    onSpeedChange(speed);
    setIsOpen(false);

    // Show time-warp effect
    setShowEffect(true);
    setTimeout(() => setShowEffect(false), 500);
  }, [onSpeedChange]);

  return (
    <div className="relative">
      {/* Time warp effect overlay */}
      <AnimatePresence>
        {showEffect && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-teal-500/20"
              animate={{
                x: currentSpeed > 1 ? ['0%', '100%'] : ['0%', '-100%'],
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speed button */}
      <motion.button
        className="px-2 py-1 rounded-lg glass text-white/70 hover:text-white text-sm font-medium transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {currentSpeed}x
      </motion.button>

      {/* Speed menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-2 rounded-xl glass min-w-[80px]"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            {speeds.map(speed => (
              <motion.button
                key={speed}
                className={`w-full px-3 py-1.5 rounded-lg text-sm text-left transition-colors ${
                  speed === currentSpeed
                    ? 'bg-purple-500/30 text-purple-300'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => handleSpeedChange(speed)}
                whileHover={{ x: 2 }}
              >
                {speed}x
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DoubleTapSeekProps {
  onSeek: (seconds: number) => void;
  seekSeconds?: number;
}

/**
 * Double tap to seek with visual feedback
 */
export function DoubleTapSeek({ onSeek, seekSeconds = 10 }: DoubleTapSeekProps) {
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const handleDoubleTap = useCallback((side: 'left' | 'right') => {
    const seconds = side === 'left' ? -seekSeconds : seekSeconds;
    onSeek(seconds);

    if (side === 'left') {
      setShowLeft(true);
      setTimeout(() => setShowLeft(false), 500);
    } else {
      setShowRight(true);
      setTimeout(() => setShowRight(false), 500);
    }
  }, [onSeek, seekSeconds]);

  return (
    <>
      {/* Left tap zone */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
        onDoubleClick={() => handleDoubleTap('left')}
      />

      {/* Right tap zone */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
        onDoubleClick={() => handleDoubleTap('right')}
      />

      {/* Left seek indicator */}
      <AnimatePresence>
        {showLeft && (
          <motion.div
            className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center gap-1 text-white"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              animate={{ x: [-5, 0, -5] }}
              transition={{ duration: 0.3, repeat: 1 }}
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.5 3C17.15 3 21.08 6.03 22.47 10.22L20.1 11C19.05 7.81 16.04 5.5 12.5 5.5C10.54 5.5 8.77 6.22 7.38 7.38L10 10H3V3L5.6 5.6C7.45 4 9.85 3 12.5 3M10 12V22H8V14H6V12H10M18 14V20C18 21.11 17.11 22 16 22H14C12.9 22 12 21.1 12 20V14C12 12.9 12.9 12 14 12H16C17.11 12 18 12.9 18 14M14 14V20H16V14H14Z" />
              </svg>
            </motion.div>
            <span className="text-lg font-bold">{seekSeconds}s</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right seek indicator */}
      <AnimatePresence>
        {showRight && (
          <motion.div
            className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-1 text-white"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            <span className="text-lg font-bold">{seekSeconds}s</span>
            <motion.div
              animate={{ x: [5, 0, 5] }}
              transition={{ duration: 0.3, repeat: 1 }}
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 3C4.85 3 .92 6.03.5 10.22L2.9 11C3.95 7.81 6.96 5.5 10.5 5.5C12.46 5.5 14.23 6.22 15.62 7.38L13 10H20V3L17.4 5.6C15.55 4 13.15 3 10.5 3M10 12V22H8V14H6V12H10M18 14V20C18 21.11 17.11 22 16 22H14C12.9 22 12 21.1 12 20V14C12 12.9 12.9 12 14 12H16C17.11 12 18 12.9 18 14M14 14V20H16V14H14Z" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Quality badge with glow effect
 */
export function QualityBadge({
  quality,
  isHD,
}: {
  quality: string;
  isHD: boolean;
}) {
  return (
    <motion.div
      className={`px-2 py-0.5 rounded text-xs font-bold ${
        isHD ? 'bg-purple-500/30 text-purple-300' : 'bg-white/10 text-white/60'
      }`}
      animate={isHD ? {
        boxShadow: [
          '0 0 10px rgba(139, 92, 246, 0.3)',
          '0 0 20px rgba(139, 92, 246, 0.5)',
          '0 0 10px rgba(139, 92, 246, 0.3)',
        ],
      } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {quality}
    </motion.div>
  );
}

/**
 * Gesture hint overlay
 */
export function GestureHints({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center text-white">
            <div className="flex justify-center gap-16 mb-4">
              <div className="text-center">
                <div className="text-3xl mb-2">👆👆</div>
                <p className="text-sm text-white/70">Double tap to seek</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">👆</div>
                <p className="text-sm text-white/70">Tap to play/pause</p>
              </div>
            </div>
            <p className="text-xs text-white/50">Press T for theater mode</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SpeedControl;
