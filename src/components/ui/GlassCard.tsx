'use client';

import { forwardRef, useRef, useEffect, ReactNode, HTMLAttributes } from 'react';

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
