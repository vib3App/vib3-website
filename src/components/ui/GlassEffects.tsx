'use client';

import { forwardRef, ReactNode, HTMLAttributes } from 'react';

// ═══════════════════════════════════════════════════════════
// AURORA CONTAINER - Background with flowing aurora
// ═══════════════════════════════════════════════════════════

interface AuroraContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  intensity?: 'subtle' | 'medium' | 'strong';
  className?: string;
}

export const AuroraContainer = forwardRef<HTMLDivElement, AuroraContainerProps>(
  ({ children, intensity = 'medium', className = '', ...props }, ref) => {
    const intensities = {
      subtle: 'before:opacity-10',
      medium: 'before:opacity-20',
      strong: 'before:opacity-30',
    };

    return (
      <div
        ref={ref}
        className={`aurora-bg ${intensities[intensity]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AuroraContainer.displayName = 'AuroraContainer';

// ═══════════════════════════════════════════════════════════
// SOUND VISUALIZER - Audio playing indicator
// ═══════════════════════════════════════════════════════════

interface SoundVisualizerProps {
  isPlaying?: boolean;
  className?: string;
}

export function SoundVisualizer({ isPlaying = true, className = '' }: SoundVisualizerProps) {
  return (
    <div className={`flex items-end gap-0.5 h-6 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`sound-bar ${isPlaying ? '' : 'animation-paused'}`}
          style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// GRADIENT TEXT - Animated gradient text
// ═══════════════════════════════════════════════════════════

interface GradientTextProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  animate?: boolean;
  className?: string;
}

export function GradientText({ children, animate = false, className = '' }: GradientTextProps) {
  return (
    <span className={`${animate ? 'gradient-text-animated' : 'gradient-text'} ${className}`}>
      {children}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
// RIPPLE EFFECT - Touch/click feedback
// ═══════════════════════════════════════════════════════════

export function useRipple() {
  const createRipple = (event: React.MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height)}px`;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    ripple.addEventListener('animationend', () => ripple.remove());
  };

  return { createRipple };
}
