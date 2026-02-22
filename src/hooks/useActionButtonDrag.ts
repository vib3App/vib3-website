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
  // Track the latest pointer position so we can use it when the timer fires
  const latestPointerRef = useRef<{ x: number; y: number } | null>(null);
  // Grab offset: distance (in px) between cursor and element center when drag starts
  const grabOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Refs to avoid stale closures in pointer handlers
  const positionRef = useRef<Position | null>(position);
  useEffect(() => { positionRef.current = position; }, [position]);
  const onDragEndRef = useRef(onDragEnd);
  useEffect(() => { onDragEndRef.current = onDragEnd; }, [onDragEnd]);

  // Convert client coordinates to viewport percentage, applying grab offset
  const pointerToPosition = useCallback((clientX: number, clientY: number): Position => {
    // Subtract the grab offset so the element stays pinned to where you grabbed it
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

  // Store pointerId for capture/release
  const pointerIdRef = useRef<number | null>(null);
  const dragEnabledRef = useRef(false);

  // Handle pointer down - start long press timer
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;

    // Store the element and pointer for later reference
    containerRef.current = e.currentTarget as HTMLElement;
    latestPointerRef.current = { x: e.clientX, y: e.clientY };
    pointerIdRef.current = e.pointerId;
    dragEnabledRef.current = false;

    // Start long press timer
    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      dragEnabledRef.current = true;
      setIsLongPressing(true);
      setIsDragging(true);

      // Calculate grab offset: difference between cursor and element center
      // This keeps the element pinned to where you grabbed it instead of centering on cursor
      if (containerRef.current && latestPointerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        grabOffsetRef.current = {
          x: latestPointerRef.current.x - centerX,
          y: latestPointerRef.current.y - centerY,
        };

        // Set initial position to the element's current center (not the cursor)
        const initialPos = pointerToPosition(latestPointerRef.current.x, latestPointerRef.current.y);
        setPosition(initialPos);
      }

      onDragStart?.();

      // Capture pointer for tracking outside element during drag
      if (containerRef.current && pointerIdRef.current !== null) {
        try {
          containerRef.current.setPointerCapture(pointerIdRef.current);
        } catch {
          // Ignore if pointer is no longer active
        }
      }

      // Vibrate on mobile to indicate drag mode
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, longPressDelay);
  }, [disabled, longPressDelay, onDragStart, clearLongPressTimer, pointerToPosition]);

  // Block touch scrolling while dragging
  useEffect(() => {
    if (!isDragging) return;
    const preventScroll = (e: TouchEvent) => { e.preventDefault(); };
    document.addEventListener('touchmove', preventScroll, { passive: false });
    return () => document.removeEventListener('touchmove', preventScroll);
  }, [isDragging]);

  // Handle pointer move
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    // Always track latest pointer position (even before drag activates)
    latestPointerRef.current = { x: e.clientX, y: e.clientY };

    // Update position if dragging - prevent default to stop page scroll
    if (dragEnabledRef.current) {
      e.preventDefault();
      e.stopPropagation();
      const newPos = pointerToPosition(e.clientX, e.clientY);
      setPosition(newPos);
      onDrag?.(newPos);
    }
  }, [pointerToPosition, onDrag]);

  // Handle pointer up - end drag (reads from refs to avoid stale closure)
  const handlePointerUp = useCallback((_e: React.PointerEvent) => {
    clearLongPressTimer();

    // Release pointer capture if we captured it
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

    dragEnabledRef.current = false;
    setIsDragging(false);
    setIsLongPressing(false);
    latestPointerRef.current = null;
    pointerIdRef.current = null;
  }, [clearLongPressTimer]);

  // Handle pointer cancel (e.g., touch interrupted)
  const handlePointerCancel = useCallback((e: React.PointerEvent) => {
    handlePointerUp(e);
  }, [handlePointerUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, [clearLongPressTimer]);

  // Compute drag style
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
