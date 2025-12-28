'use client';

import { useEffect, useRef } from 'react';
import { useParallax } from '@/hooks/useMouse';

interface AuroraBackgroundProps {
  /** Intensity of parallax effect (default: 30) */
  intensity?: number;
  /** Whether to show the aurora (default: true) */
  enabled?: boolean;
}

/**
 * Immersive aurora background with parallax mouse tracking
 * Creates multiple gradient orbs that move subtly with cursor
 */
export function AuroraBackground({ intensity = 30, enabled = true }: AuroraBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { x, y } = useParallax(intensity);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion && containerRef.current) {
      containerRef.current.style.setProperty('--parallax-x', '0px');
      containerRef.current.style.setProperty('--parallax-y', '0px');
      return;
    }

    if (containerRef.current) {
      containerRef.current.style.setProperty('--parallax-x', `${x}px`);
      containerRef.current.style.setProperty('--parallax-y', `${y}px`);
    }
  }, [x, y]);

  if (!enabled) return null;

  return (
    <div
      ref={containerRef}
      className="aurora-parallax"
      aria-hidden="true"
    >
      {/* Primary purple orb - top left */}
      <div
        className="aurora-orb aurora-orb-1"
        style={{
          transform: `translate(calc(-30% + var(--parallax-x, 0px)), calc(-20% + var(--parallax-y, 0px)))`,
        }}
      />

      {/* Secondary teal orb - bottom right */}
      <div
        className="aurora-orb aurora-orb-2"
        style={{
          transform: `translate(calc(30% - var(--parallax-x, 0px)), calc(30% - var(--parallax-y, 0px)))`,
        }}
      />

      {/* Tertiary orange orb - center */}
      <div
        className="aurora-orb aurora-orb-3"
        style={{
          transform: `translate(calc(var(--parallax-x, 0px) * 0.5), calc(var(--parallax-y, 0px) * 0.5))`,
        }}
      />

      {/* Subtle accent orb - top right */}
      <div
        className="aurora-orb aurora-orb-4"
        style={{
          transform: `translate(calc(20% - var(--parallax-x, 0px) * 0.3), calc(-30% - var(--parallax-y, 0px) * 0.3))`,
        }}
      />
    </div>
  );
}

export default AuroraBackground;
