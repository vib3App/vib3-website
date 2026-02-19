'use client';

import { useRef, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeConfig {
  threshold?: number;
  preventScroll?: boolean;
}

export function useSwipeGestures(handlers: SwipeHandlers, config: SwipeConfig = {}) {
  const { threshold = 50, preventScroll = false } = config;
  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    tracking.current = true;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (preventScroll && tracking.current) {
      e.preventDefault();
    }
  }, [preventScroll]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!tracking.current) return;
    tracking.current = false;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - startX.current;
    const dy = endY - startY.current;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
      if (dx > 0) handlers.onSwipeRight?.();
      else handlers.onSwipeLeft?.();
    } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > threshold) {
      if (dy > 0) handlers.onSwipeDown?.();
      else handlers.onSwipeUp?.();
    }
  }, [handlers, threshold]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
