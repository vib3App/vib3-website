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
    onTouchStart: (e: React.TouchEvent) => void;
    style?: React.CSSProperties;
  };
}

/**
 * Freeze ALL scrolling on the page (both touch and mouse/wheel).
 * Returns a cleanup function to restore normal scrolling.
 */
function freezeAllScrolling(): () => void {
  // 1. Block touch scrolling
  const touchBlocker = (e: TouchEvent) => { e.preventDefault(); };
  document.addEventListener('touchmove', touchBlocker, { passive: false, capture: true });

  // 2. Block mouse wheel / trackpad scrolling
  const wheelBlocker = (e: WheelEvent) => { e.preventDefault(); };
  document.addEventListener('wheel', wheelBlocker, { passive: false, capture: true });

  // 3. Undo any scroll that sneaks through (scroll event isn't cancelable)
  const scrollPositions = new Map<Element | Window, { x: number; y: number }>();
  scrollPositions.set(window, { x: window.scrollX, y: window.scrollY });
  // Find all scrollable elements and save their positions
  document.querySelectorAll('*').forEach((el) => {
    if (el instanceof HTMLElement && (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight)) {
      scrollPositions.set(el, { x: el.scrollLeft, y: el.scrollTop });
    }
  });
  const scrollBlocker = () => {
    scrollPositions.forEach((pos, el) => {
      if (el === window) {
        window.scrollTo(pos.x, pos.y);
      } else if (el instanceof HTMLElement) {
        el.scrollLeft = pos.x;
        el.scrollTop = pos.y;
      }
    });
  };
  document.addEventListener('scroll', scrollBlocker, { capture: true });

  // 4. CSS-level: lock overflow on body/html and add overscroll-behavior
  const html = document.documentElement;
  const body = document.body;
  const saved = {
    htmlOverflow: html.style.overflow,
    htmlOverscroll: html.style.overscrollBehavior,
    bodyOverflow: body.style.overflow,
    bodyOverscroll: body.style.overscrollBehavior,
  };
  html.style.overflow = 'hidden';
  html.style.overscrollBehavior = 'none';
  body.style.overflow = 'hidden';
  body.style.overscrollBehavior = 'none';

  // Return cleanup function
  return () => {
    document.removeEventListener('touchmove', touchBlocker, { capture: true } as EventListenerOptions);
    document.removeEventListener('wheel', wheelBlocker, { capture: true } as EventListenerOptions);
    document.removeEventListener('scroll', scrollBlocker, { capture: true } as EventListenerOptions);
    html.style.overflow = saved.htmlOverflow;
    html.style.overscrollBehavior = saved.htmlOverscroll;
    body.style.overflow = saved.bodyOverflow;
    body.style.overscrollBehavior = saved.bodyOverscroll;
  };
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
  // Cleanup function for scroll freeze — set on pointer down, called on pointer up
  const unfreezeScrollRef = useRef<(() => void) | null>(null);

  // Refs to avoid stale closures in pointer handlers
  const positionRef = useRef<Position | null>(position);
  useEffect(() => { positionRef.current = position; }, [position]);
  const onDragEndRef = useRef(onDragEnd);
  useEffect(() => { onDragEndRef.current = onDragEnd; }, [onDragEnd]);

  const pointerToPosition = useCallback((clientX: number, clientY: number): Position => {
    const adjustedX = clientX - grabOffsetRef.current.x;
    const adjustedY = clientY - grabOffsetRef.current.y;
    const x = Math.max(5, Math.min(95, (adjustedX / window.innerWidth) * 100));
    const y = Math.max(5, Math.min(95, (adjustedY / window.innerHeight) * 100));
    return { x, y };
  }, []);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const pointerIdRef = useRef<number | null>(null);
  const dragEnabledRef = useRef(false);

  // Block scrolling on touch start (mobile) — fires before pointerdown
  const handleTouchStart = useCallback((_e: React.TouchEvent) => {
    if (disabled) return;
    // Freeze scrolling immediately so browser can't start a scroll gesture
    if (!unfreezeScrollRef.current) {
      unfreezeScrollRef.current = freezeAllScrolling();
    }
  }, [disabled]);

  // Handle pointer down — works for both mouse and touch
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;

    containerRef.current = e.currentTarget as HTMLElement;
    latestPointerRef.current = { x: e.clientX, y: e.clientY };
    pointerIdRef.current = e.pointerId;
    dragEnabledRef.current = false;

    // For mouse (non-touch), freeze scrolling immediately on click
    if (e.pointerType === 'mouse' && !unfreezeScrollRef.current) {
      unfreezeScrollRef.current = freezeAllScrolling();
    }

    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      dragEnabledRef.current = true;
      setIsLongPressing(true);
      setIsDragging(true);

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
  }, [disabled, longPressDelay, onDragStart, clearLongPressTimer, pointerToPosition]);

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

    // Unfreeze scrolling
    if (unfreezeScrollRef.current) {
      unfreezeScrollRef.current();
      unfreezeScrollRef.current = null;
    }

    dragEnabledRef.current = false;
    setIsDragging(false);
    setIsLongPressing(false);
    latestPointerRef.current = null;
    pointerIdRef.current = null;
  }, [clearLongPressTimer]);

  const handlePointerCancel = useCallback((e: React.PointerEvent) => {
    handlePointerUp(e);
  }, [handlePointerUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLongPressTimer();
      if (unfreezeScrollRef.current) {
        unfreezeScrollRef.current();
        unfreezeScrollRef.current = null;
      }
    };
  }, [clearLongPressTimer]);

  const dragStyle: React.CSSProperties | undefined = isDragging && position
    ? {
        position: 'fixed',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
        cursor: 'grabbing',
        touchAction: 'none',
        userSelect: 'none',
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
      onTouchStart: handleTouchStart,
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
