'use client';

import { forwardRef, ReactNode, HTMLAttributes } from 'react';

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
