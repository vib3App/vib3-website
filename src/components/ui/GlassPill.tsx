'use client';

import { forwardRef, ReactNode, HTMLAttributes } from 'react';

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
