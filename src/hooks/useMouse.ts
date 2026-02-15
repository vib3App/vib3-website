'use client';

import { useState, useEffect, useRef, RefObject } from 'react';

interface MousePosition {
  x: number;
  y: number;
  elementX: number;
  elementY: number;
  isInside: boolean;
}

const DEFAULT_POSITION: MousePosition = {
  x: 0,
  y: 0,
  elementX: 0.5,
  elementY: 0.5,
  isInside: false,
};

/**
 * Hook to track mouse position globally or relative to an element.
 * Uses rAF-throttled state updates to avoid 60fps re-renders on every mousemove.
 */
export function useMouse(ref?: RefObject<HTMLElement | null>): MousePosition {
  const [position, setPosition] = useState<MousePosition>(DEFAULT_POSITION);
  const positionRef = useRef<MousePosition>(DEFAULT_POSITION);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const element = ref?.current;

      if (element) {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const isInside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;

        positionRef.current = {
          x: e.clientX,
          y: e.clientY,
          elementX: x / rect.width,
          elementY: y / rect.height,
          isInside,
        };
      } else {
        positionRef.current = {
          x: e.clientX,
          y: e.clientY,
          elementX: e.clientX / window.innerWidth,
          elementY: e.clientY / window.innerHeight,
          isInside: true,
        };
      }

      // Throttle state updates to one per animation frame
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          setPosition(positionRef.current);
          rafIdRef.current = null;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [ref]);

  return position;
}

/**
 * Hook to get 3D tilt rotation values based on mouse position
 */
export function useTilt(ref: RefObject<HTMLElement | null>, intensity: number = 15) {
  const mouse = useMouse(ref);

  const rotateX = mouse.isInside
    ? (mouse.elementY - 0.5) * -intensity
    : 0;
  const rotateY = mouse.isInside
    ? (mouse.elementX - 0.5) * intensity
    : 0;

  return { rotateX, rotateY, isHovered: mouse.isInside };
}

/**
 * Hook to create parallax effect based on mouse position
 */
export function useParallax(strength: number = 20) {
  const mouse = useMouse();

  const x = (mouse.elementX - 0.5) * strength;
  const y = (mouse.elementY - 0.5) * strength;

  return { x, y };
}
