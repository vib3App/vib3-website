'use client';

import { forwardRef, ReactNode, ButtonHTMLAttributes } from 'react';

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
