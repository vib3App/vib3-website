'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { useTilt } from '@/hooks/useMouse';

interface Card3DProps {
  children: ReactNode;
  /** Tilt intensity in degrees (default: 15) */
  intensity?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show glow effect on hover */
  glowOnHover?: boolean;
  /** Glow color (default: purple) */
  glowColor?: 'purple' | 'teal' | 'orange';
}

const glowColors = {
  purple: 'rgba(139, 92, 246, 0.4)',
  teal: 'rgba(45, 212, 191, 0.4)',
  orange: 'rgba(249, 115, 22, 0.4)',
};

/**
 * 3D card that tilts toward cursor with perspective effect
 * Creates immersive depth and interactivity
 */
export function Card3D({
  children,
  intensity = 15,
  className = '',
  glowOnHover = true,
  glowColor = 'purple',
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { rotateX, rotateY, isHovered } = useTilt(cardRef, intensity);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    if (innerRef.current) {
      if (isHovered) {
        innerRef.current.style.transform = `
          perspective(1000px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          translateZ(20px)
        `;
        if (glowOnHover) {
          innerRef.current.style.boxShadow = `
            0 25px 50px rgba(0, 0, 0, 0.4),
            0 0 80px ${glowColors[glowColor]}
          `;
        }
      } else {
        innerRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        innerRef.current.style.boxShadow = '';
      }
    }
  }, [rotateX, rotateY, isHovered, glowOnHover, glowColor]);

  return (
    <div
      ref={cardRef}
      className={`card-3d ${className}`}
      style={{ perspective: '1000px' }}
    >
      <div
        ref={innerRef}
        className="card-3d-inner glass-card rounded-2xl transition-all duration-200 ease-out"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Simpler elevated card with hover lift effect
 */
export function CardElevated({
  children,
  className = '',
  glowColor = 'purple',
}: Omit<Card3DProps, 'intensity'>) {
  return (
    <div
      className={`card-elevated glass-card rounded-2xl ${className}`}
      style={{
        '--glow-color': glowColors[glowColor],
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * Floating card with gentle bob animation
 */
export function CardFloating({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`float-gentle glass-card rounded-2xl ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

export default Card3D;
