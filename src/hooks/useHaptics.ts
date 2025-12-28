'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection' | 'impact';

interface HapticConfig {
  pattern: number[]; // Vibration pattern in ms [vibrate, pause, vibrate, ...]
  intensity: number; // 0-1 (for browsers that support it)
}

const hapticPatterns: Record<HapticPattern, HapticConfig> = {
  light: { pattern: [10], intensity: 0.3 },
  medium: { pattern: [25], intensity: 0.5 },
  heavy: { pattern: [50], intensity: 0.8 },
  success: { pattern: [10, 50, 30], intensity: 0.6 },
  warning: { pattern: [30, 30, 30], intensity: 0.7 },
  error: { pattern: [50, 50, 50, 50, 100], intensity: 1.0 },
  selection: { pattern: [5], intensity: 0.2 },
  impact: { pattern: [15, 10, 40], intensity: 0.9 },
};

/**
 * Hook for haptic feedback using Vibration API
 */
export function useHaptics() {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Check if Vibration API is supported
    setIsSupported('vibrate' in navigator);

    // Load preference from localStorage
    const saved = localStorage.getItem('vib3-haptics-enabled');
    if (saved !== null) {
      setIsEnabled(JSON.parse(saved));
    }
  }, []);

  // Save preference
  useEffect(() => {
    localStorage.setItem('vib3-haptics-enabled', JSON.stringify(isEnabled));
  }, [isEnabled]);

  const vibrate = useCallback((pattern: HapticPattern | number[]) => {
    if (!isSupported || !isEnabled) return;

    try {
      if (Array.isArray(pattern)) {
        navigator.vibrate(pattern);
      } else {
        navigator.vibrate(hapticPatterns[pattern].pattern);
      }
    } catch (e) {
      // Vibration failed silently
    }
  }, [isSupported, isEnabled]);

  // Convenience methods
  const tap = useCallback(() => vibrate('light'), [vibrate]);
  const doubleTap = useCallback(() => vibrate([10, 30, 10]), [vibrate]);
  const longPress = useCallback(() => vibrate('medium'), [vibrate]);
  const success = useCallback(() => vibrate('success'), [vibrate]);
  const error = useCallback(() => vibrate('error'), [vibrate]);
  const warning = useCallback(() => vibrate('warning'), [vibrate]);
  const impact = useCallback(() => vibrate('impact'), [vibrate]);
  const selection = useCallback(() => vibrate('selection'), [vibrate]);

  // Stop any ongoing vibration
  const stop = useCallback(() => {
    if (isSupported) {
      navigator.vibrate(0);
    }
  }, [isSupported]);

  return {
    isSupported,
    isEnabled,
    setIsEnabled,
    vibrate,
    tap,
    doubleTap,
    longPress,
    success,
    error,
    warning,
    impact,
    selection,
    stop,
  };
}

/**
 * Hook for rhythm-synced haptic feedback
 */
export function useRhythmHaptics() {
  const { vibrate, isSupported, isEnabled } = useHaptics();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Play haptics synced to BPM
  const playRhythm = useCallback((bpm: number, pattern: 'beat' | 'pulse' | 'wave' = 'beat') => {
    if (!isSupported || !isEnabled) return;

    const interval = 60000 / bpm; // ms per beat

    const patterns = {
      beat: () => vibrate([20]),
      pulse: () => vibrate([10, 10, 10]),
      wave: () => vibrate([5, 20, 10, 20, 5]),
    };

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setIsPlaying(true);
    patterns[pattern](); // Initial beat

    intervalRef.current = setInterval(() => {
      patterns[pattern]();
    }, interval);
  }, [vibrate, isSupported, isEnabled]);

  // Stop rhythm
  const stopRhythm = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    playRhythm,
    stopRhythm,
    isPlaying,
  };
}

/**
 * Hook for gesture-based haptic feedback
 */
export function useGestureHaptics() {
  const { vibrate, tap, longPress, impact } = useHaptics();

  // Swipe feedback - intensity based on velocity
  const swipe = useCallback((velocity: number) => {
    const duration = Math.min(50, Math.max(10, velocity * 5));
    vibrate([duration]);
  }, [vibrate]);

  // Pinch/zoom feedback
  const pinch = useCallback((scale: number) => {
    if (scale > 1.5 || scale < 0.7) {
      vibrate([15, 10, 15]);
    } else {
      vibrate([10]);
    }
  }, [vibrate]);

  // Scroll boundary hit
  const scrollBoundary = useCallback(() => {
    vibrate([30, 20, 30]);
  }, [vibrate]);

  // Pull to refresh stages
  const pullProgress = useCallback((progress: number) => {
    if (progress >= 1) {
      vibrate([20, 30, 40]);
    } else if (progress >= 0.5) {
      vibrate([10]);
    }
  }, [vibrate]);

  // Drag threshold crossed
  const dragThreshold = useCallback(() => {
    impact();
  }, [impact]);

  return {
    tap,
    longPress,
    swipe,
    pinch,
    scrollBoundary,
    pullProgress,
    dragThreshold,
  };
}

export default useHaptics;
