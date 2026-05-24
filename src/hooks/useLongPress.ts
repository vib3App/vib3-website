'use client';

import { useCallback, useRef } from 'react';

interface UseLongPressOptions {
  onLongPress: (event: React.PointerEvent) => void;
  threshold?: number;        // ms before long-press fires (default 500)
  movementThreshold?: number; // px of movement that cancels the press (default 10)
}

interface UseLongPressHandlers {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onPointerLeave: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

/**
 * Cross-input long-press detector. Works for touch + mouse + pen via the
 * Pointer Events API. Cancels on movement past the threshold so a scroll
 * gesture doesn't accidentally trigger.
 */
export function useLongPress({
  onLongPress,
  threshold = 500,
  movementThreshold = 10,
}: UseLongPressOptions): UseLongPressHandlers {
  const timerRef = useRef<number | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const eventRef = useRef<React.PointerEvent | null>(null);
  const firedRef = useRef(false);

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startRef.current = null;
    eventRef.current = null;
    firedRef.current = false;
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      startRef.current = { x: e.clientX, y: e.clientY };
      eventRef.current = e;
      firedRef.current = false;
      timerRef.current = window.setTimeout(() => {
        if (eventRef.current) {
          firedRef.current = true;
          onLongPress(eventRef.current);
        }
      }, threshold);
    },
    [onLongPress, threshold],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startRef.current || timerRef.current === null) return;
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      if (Math.hypot(dx, dy) > movementThreshold) cancel();
    },
    [cancel, movementThreshold],
  );

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      // Suppress the native menu so our overlay isn't double-covered when
      // a long-press already fired.
      if (firedRef.current) e.preventDefault();
    },
    [],
  );

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onPointerLeave: cancel,
    onContextMenu,
  };
}
