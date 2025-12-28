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
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const hasDraggedRef = useRef(false);

  // Convert client coordinates to percentage position
  const clientToPercent = useCallback((clientX: number, clientY: number): Position => {
    const container = containerRef.current?.parentElement;
    if (!container) {
      return { x: 50, y: 50 };
    }
    const rect = container.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100));
    return { x, y };
  }, []);

  // Clear long press timer
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Handle pointer down - start long press timer
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;

    // Store the element for later reference
    containerRef.current = e.currentTarget as HTMLElement;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    hasDraggedRef.current = false;

    // Capture pointer for tracking outside element
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    // Start long press timer
    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(true);
      setIsDragging(true);
      onDragStart?.();

      // Vibrate on mobile to indicate drag mode
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, longPressDelay);
  }, [disabled, longPressDelay, onDragStart, clearLongPressTimer]);

  // Handle pointer move
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!startPosRef.current) return;

    // Check if moved significantly (prevents accidental drag on tap)
    const dx = Math.abs(e.clientX - startPosRef.current.x);
    const dy = Math.abs(e.clientY - startPosRef.current.y);

    if (dx > 10 || dy > 10) {
      hasDraggedRef.current = true;
      // Cancel long press if moved before timer completes
      if (!isDragging) {
        clearLongPressTimer();
      }
    }

    // Update position if dragging
    if (isDragging) {
      const newPos = clientToPercent(e.clientX, e.clientY);
      setPosition(newPos);
      onDrag?.(newPos);
    }
  }, [isDragging, clientToPercent, onDrag, clearLongPressTimer]);

  // Handle pointer up - end drag
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    clearLongPressTimer();

    // Release pointer capture
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if already released
    }

    if (isDragging && position) {
      onDragEnd?.(position);
    }

    setIsDragging(false);
    setIsLongPressing(false);
    startPosRef.current = null;
  }, [isDragging, position, onDragEnd, clearLongPressTimer]);

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
