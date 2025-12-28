'use client';

import { useState, useEffect, useCallback, RefObject } from 'react';

interface MousePosition {
  x: number;
  y: number;
  elementX: number;
  elementY: number;
  isInside: boolean;
}

/**
 * Hook to track mouse position globally or relative to an element
 */
export function useMouse(ref?: RefObject<HTMLElement | null>): MousePosition {
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    elementX: 0.5,
    elementY: 0.5,
    isInside: false,
  });

  const updatePosition = useCallback((e: MouseEvent) => {
    const element = ref?.current;

    if (element) {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const isInside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;

      setPosition({
        x: e.clientX,
        y: e.clientY,
        elementX: x / rect.width,
        elementY: y / rect.height,
        isInside,
      });
    } else {
      setPosition({
        x: e.clientX,
        y: e.clientY,
        elementX: e.clientX / window.innerWidth,
        elementY: e.clientY / window.innerHeight,
        isInside: true,
      });
    }
  }, [ref]);

  useEffect(() => {
    window.addEventListener('mousemove', updatePosition);
    return () => window.removeEventListener('mousemove', updatePosition);
  }, [updatePosition]);

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
