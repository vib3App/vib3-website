'use client';

import { motion, useAnimation } from 'framer-motion';
import { ReactNode, useState, useCallback } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

/**
 * Button with ripple effect and scale animation
 */
export function AnimatedButton({
  children,
  onClick,
  className = '',
  variant = 'primary',
  disabled = false,
}: AnimatedButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);

    onClick?.();
  }, [onClick, disabled]);

  const baseStyles = 'relative overflow-hidden rounded-xl font-semibold transition-colors';
  const variantStyles = {
    primary: 'bg-gradient-to-r from-purple-500 to-teal-400 text-white',
    secondary: 'glass border border-white/10 text-white hover:bg-white/10',
    ghost: 'bg-transparent text-white hover:bg-white/5',
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none"
          initial={{ width: 0, height: 0, opacity: 0.5 }}
          animate={{ width: 300, height: 300, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            left: ripple.x - 150,
            top: ripple.y - 150,
          }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

/**
 * Icon button with bounce effect
 */
export function IconButton({
  children,
  onClick,
  className = '',
  active = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  active?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`p-2 rounded-full transition-colors ${active ? 'text-purple-400' : 'text-white/60 hover:text-white'} ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
}

/**
 * Magnetic button that follows cursor
 */
export function MagneticButton({
  children,
  onClick,
  className = '',
  strength = 0.3,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  strength?: number;
}) {
  const controls = useAnimation();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    controls.start({
      x: x * strength,
      y: y * strength,
      transition: { duration: 0.15, ease: 'easeOut' },
    });
  }, [controls, strength]);

  const handleMouseLeave = useCallback(() => {
    controls.start({
      x: 0,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    });
  }, [controls]);

  return (
    <motion.button
      onClick={onClick}
      className={className}
      animate={controls}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

export default AnimatedButton;
