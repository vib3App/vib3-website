/**
 * Custom hook for draggable action buttons
 * Handles long press detection and drag functionality
 * Works with both touch and mouse events
 */
import { useCallback, useRef, useState, useEffect } from 'react';
import type { Position } from '@/types/actionButtons';

interface UseDragOptions {
  onDragStart?: () => void;
  onDrag?: (position: Position) => void;
  onDragEnd?: (position: Position) => void;
  longPressDelay?: number; // ms to wait before enabling drag
  disabled?: boolean;
}

interface UseDragReturn {
  isDragging: boolean;
  isLongPressing: boolean;
  position: Position | null;
  dragProps: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    style?: React.CSSProperties;
  };
}

// Track elements we've locked so we can restore them exactly
let lockedElements: { el: HTMLElement; overflow: string; touchAction: string }[] = [];

function lockScroll() {
  // Lock body + html
  for (const el of [document.body, document.documentElement]) {
    lockedElements.push({ el, overflow: el.style.overflow, touchAction: el.style.touchAction });
    el.style.overflow = 'hidden';
    el.style.touchAction = 'none';
  }
  // Lock ALL scrollable containers on the page (feed scroll container, etc.)
  document.querySelectorAll<HTMLElement>('[class*="overflow"]').forEach((el) => {
    const style = getComputedStyle(el);
    if (style.overflowX !== 'hidden' && style.overflowX !== 'visible' ||
        style.overflowY !== 'hidden' && style.overflowY !== 'visible') {
      lockedElements.push({ el, overflow: el.style.overflow, touchAction: el.style.touchAction });
      el.style.overflow = 'hidden';
      el.style.touchAction = 'none';
    }
  });
}

function unlockScroll() {
  for (const { el, overflow, touchAction } of lockedElements) {
    el.style.overflow = overflow;
    el.style.touchAction = touchAction;
  }
  lockedElements = [];
}

export function useActionButtonDrag(options: UseDragOptions = {}): UseDragReturn {
  const {
    onDragStart,
    onDrag,
    onDragEnd,
    longPressDelay = 500,
    disabled = false,
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const latestPointerRef = useRef<{ x: number; y: number } | null>(null);
  const grabOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  // Ref for the global touchmove/pointermove blocker so we can add/remove without React timing
  const scrollBlockerRef = useRef<((e: Event) => void) | null>(null);

  // Refs to avoid stale closures in pointer handlers
  const positionRef = useRef<Position | null>(position);
  useEffect(() => { positionRef.current = position; }, [position]);
  const onDragEndRef = useRef(onDragEnd);
  useEffect(() => { onDragEndRef.current = onDragEnd; }, [onDragEnd]);

  // Convert client coordinates to viewport percentage, applying grab offset
  const pointerToPosition = useCallback((clientX: number, clientY: number): Position => {
    const adjustedX = clientX - grabOffsetRef.current.x;
    const adjustedY = clientY - grabOffsetRef.current.y;
    const x = Math.max(5, Math.min(95, (adjustedX / window.innerWidth) * 100));
    const y = Math.max(5, Math.min(95, (adjustedY / window.innerHeight) * 100));
    return { x, y };
  }, []);

  // Clear long press timer
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Immediately start blocking scroll (called directly, not via useEffect)
  const startBlockingScroll = useCallback(() => {
    // Block at the CSS level
    lockScroll();
    // Block at the event level
    const blocker = (e: Event) => { e.preventDefault(); };
    scrollBlockerRef.current = blocker;
    document.addEventListener('touchmove', blocker, { passive: false });
    document.addEventListener('wheel', blocker, { passive: false });
  }, []);

  // Stop blocking scroll
  const stopBlockingScroll = useCallback(() => {
    unlockScroll();
    if (scrollBlockerRef.current) {
      document.removeEventListener('touchmove', scrollBlockerRef.current);
      document.removeEventListener('wheel', scrollBlockerRef.current);
      scrollBlockerRef.current = null;
    }
  }, []);

  const pointerIdRef = useRef<number | null>(null);
  const dragEnabledRef = useRef(false);

  // Handle pointer down - start long press timer
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;

    containerRef.current = e.currentTarget as HTMLElement;
    latestPointerRef.current = { x: e.clientX, y: e.clientY };
    pointerIdRef.current = e.pointerId;
    dragEnabledRef.current = false;

    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      dragEnabledRef.current = true;
      setIsLongPressing(true);
      setIsDragging(true);

      // Block scrolling IMMEDIATELY — don't wait for React useEffect
      startBlockingScroll();

      // Calculate grab offset
      if (containerRef.current && latestPointerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        grabOffsetRef.current = {
          x: latestPointerRef.current.x - centerX,
          y: latestPointerRef.current.y - centerY,
        };
        const initialPos = pointerToPosition(latestPointerRef.current.x, latestPointerRef.current.y);
        setPosition(initialPos);
      }

      onDragStart?.();

      // Capture pointer for tracking outside element
      if (containerRef.current && pointerIdRef.current !== null) {
        try {
          containerRef.current.setPointerCapture(pointerIdRef.current);
        } catch {
          // Ignore if pointer is no longer active
        }
      }

      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, longPressDelay);
  }, [disabled, longPressDelay, onDragStart, clearLongPressTimer, pointerToPosition, startBlockingScroll]);

  // Handle pointer move
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    latestPointerRef.current = { x: e.clientX, y: e.clientY };

    if (dragEnabledRef.current) {
      e.preventDefault();
      e.stopPropagation();
      const newPos = pointerToPosition(e.clientX, e.clientY);
      setPosition(newPos);
      onDrag?.(newPos);
    }
  }, [pointerToPosition, onDrag]);

  // Handle pointer up
  const handlePointerUp = useCallback((_e: React.PointerEvent) => {
    clearLongPressTimer();

    if (dragEnabledRef.current && containerRef.current && pointerIdRef.current !== null) {
      try {
        containerRef.current.releasePointerCapture(pointerIdRef.current);
      } catch {
        // Ignore if already released
      }
    }

    if (dragEnabledRef.current && positionRef.current) {
      onDragEndRef.current?.(positionRef.current);
    }

    // Stop blocking scroll immediately
    stopBlockingScroll();

    dragEnabledRef.current = false;
    setIsDragging(false);
    setIsLongPressing(false);
    latestPointerRef.current = null;
    pointerIdRef.current = null;
  }, [clearLongPressTimer, stopBlockingScroll]);

  const handlePointerCancel = useCallback((e: React.PointerEvent) => {
    handlePointerUp(e);
  }, [handlePointerUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLongPressTimer();
      stopBlockingScroll();
    };
  }, [clearLongPressTimer, stopBlockingScroll]);

  const dragStyle: React.CSSProperties | undefined = isDragging && position
    ? {
        position: 'fixed',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
        cursor: 'grabbing',
        touchAction: 'none',
      }
    : undefined;

  return {
    isDragging,
    isLongPressing,
    position,
    dragProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      style: dragStyle,
    },
  };
}

// Simple hook for just detecting long press (without drag)
export function useLongPress(
  callback: () => void,
  delay: number = 500
): {
  onPointerDown: () => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
} {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    timerRef.current = setTimeout(() => {
      callback();
    }, delay);
  }, [callback, delay]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clear();
  }, [clear]);

  return {
    onPointerDown: start,
    onPointerUp: clear,
    onPointerLeave: clear,
  };
}
