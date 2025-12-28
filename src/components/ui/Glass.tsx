'use client';

import { forwardRef, useRef, useEffect, ReactNode, HTMLAttributes, ButtonHTMLAttributes } from 'react';

// ═══════════════════════════════════════════════════════════
// GLASS CARD - The foundation component
// ═══════════════════════════════════════════════════════════

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'heavy' | 'subtle';
  glow?: boolean;
  hover?: boolean;
  className?: string;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, variant = 'default', glow = false, hover = true, className = '', ...props }, ref) => {
    const cardRef = useRef<HTMLDivElement>(null);

    // Lensing effect - track mouse position
    useEffect(() => {
      const card = cardRef.current;
      if (!card) return;

      const handleMouseMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
      };

      card.addEventListener('mousemove', handleMouseMove);
      return () => card.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const variants = {
      default: 'glass-card',
      heavy: 'glass-heavy rounded-3xl',
      subtle: 'glass rounded-2xl',
    };

    return (
      <div
        ref={(node) => {
          (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={`
          ${variants[variant]}
          glass-lens
          ${glow ? 'glow-pulse' : ''}
          ${hover ? '' : 'hover:transform-none hover:shadow-none'}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// ═══════════════════════════════════════════════════════════
// GLASS BUTTON - Liquid glass buttons
// ═══════════════════════════════════════════════════════════

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'glass' | 'brutal' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  className?: string;
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ children, variant = 'glass', size = 'md', glow = false, className = '', ...props }, ref) => {
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    const variants = {
      glass: `
        glass rounded-xl
        hover:bg-white/10 hover:border-white/20
        active:scale-95
        transition-all duration-200
      `,
      brutal: `
        brutal-btn rounded-xl
      `,
      ghost: `
        bg-transparent border border-transparent
        hover:bg-white/5 hover:border-white/10
        rounded-xl transition-all duration-200
      `,
    };

    return (
      <button
        ref={ref}
        className={`
          ${sizes[size]}
          ${variants[variant]}
          ${glow ? 'glow-pulse' : ''}
          font-semibold
          flex items-center justify-center gap-2
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

// ═══════════════════════════════════════════════════════════
// GLASS PILL - For tags, labels, status indicators
// ═══════════════════════════════════════════════════════════

interface GlassPillProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  color?: 'purple' | 'teal' | 'orange' | 'pink' | 'default';
  pulse?: boolean;
  className?: string;
}

export const GlassPill = forwardRef<HTMLSpanElement, GlassPillProps>(
  ({ children, color = 'default', pulse = false, className = '', ...props }, ref) => {
    const colors = {
      default: 'bg-white/10 border-white/20',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-300',
      teal: 'bg-teal-500/20 border-teal-500/30 text-teal-300',
      orange: 'bg-orange-500/20 border-orange-500/30 text-orange-300',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-300',
    };

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center gap-1.5
          px-3 py-1 rounded-full
          text-sm font-medium
          border backdrop-blur-md
          ${colors[color]}
          ${pulse ? 'vib3-pulse' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);

GlassPill.displayName = 'GlassPill';

// ═══════════════════════════════════════════════════════════
// GLASS NAV BAR - Floating navigation
// ═══════════════════════════════════════════════════════════

interface GlassNavProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  position?: 'top' | 'bottom' | 'floating';
  className?: string;
}

export const GlassNav = forwardRef<HTMLElement, GlassNavProps>(
  ({ children, position = 'top', className = '', ...props }, ref) => {
    const positions = {
      top: 'fixed top-0 left-0 right-0',
      bottom: 'fixed bottom-0 left-0 right-0',
      floating: 'fixed bottom-6 left-1/2 -translate-x-1/2',
    };

    return (
      <nav
        ref={ref}
        className={`
          ${positions[position]}
          glass-heavy
          ${position === 'floating' ? 'rounded-2xl px-2' : 'px-4'}
          py-2 z-50
          ${className}
        `}
        {...props}
      >
        {children}
      </nav>
    );
  }
);

GlassNav.displayName = 'GlassNav';

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
