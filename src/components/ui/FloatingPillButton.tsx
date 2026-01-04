'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface FloatingPillButtonProps {
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  label?: string;
  count?: number;
  isActive?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  onClick?: () => void;
  className?: string;
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

/**
 * Floating pill-shaped action button matching Flutter app style
 * Features gradient background, glow shadows, and scale animation
 */
export function FloatingPillButton({
  icon,
  activeIcon,
  label,
  count,
  isActive = false,
  gradientFrom = '#8B5CF6',
  gradientTo = '#14B8A6',
  onClick,
  className = '',
}: FloatingPillButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const displayIcon = isActive && activeIcon ? activeIcon : icon;
  const displayLabel = count !== undefined ? formatCount(count) : label;

  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setIsPressed(false)}
      onTapCancel={() => setIsPressed(false)}
      animate={{ scale: isPressed ? 1.1 : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`relative flex flex-col items-center justify-center w-[50px] h-[70px] rounded-[25px] ${className}`}
      style={{
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        boxShadow: `
          0 0 12px 1px ${gradientFrom}66,
          2px 2px 16px 2px ${gradientTo}4D
        `,
      }}
    >
      {/* Icon */}
      <div className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
        {displayIcon}
      </div>

      {/* Label/Count */}
      {displayLabel && (
        <span className="mt-1 text-[11px] font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
          {displayLabel}
        </span>
      )}
    </motion.button>
  );
}

/**
 * Floating circular action button (for profile page)
 */
export function FloatingCircleButton({
  icon,
  gradientFrom = '#8B5CF6',
  gradientTo = '#14B8A6',
  onClick,
  size = 44,
  className = '',
}: {
  icon: React.ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
  onClick?: () => void;
  size?: number;
  className?: string;
}) {
  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 1.8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`flex items-center justify-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        boxShadow: `
          0 0 12px 1px ${gradientFrom}66,
          2px 2px 16px 2px ${gradientTo}4D
        `,
      }}
    >
      <div className="w-5 h-5 text-white">
        {icon}
      </div>
    </motion.button>
  );
}

/**
 * Floating action pill with text (for profile Edit/Follow buttons)
 */
export function FloatingActionPill({
  icon,
  label,
  gradientFrom = '#8B5CF6',
  gradientTo = '#14B8A6',
  onClick,
  className = '',
}: {
  icon: React.ReactNode;
  label: string;
  gradientFrom?: string;
  gradientTo?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`flex items-center gap-2 px-5 py-3 rounded-[25px] ${className}`}
      style={{
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        boxShadow: `
          0 0 15px 2px ${gradientFrom}66,
          2px 2px 20px 3px ${gradientTo}4D
        `,
      }}
    >
      <div className="w-[18px] h-[18px] text-white">
        {icon}
      </div>
      <span className="text-white text-sm font-semibold">{label}</span>
    </motion.button>
  );
}

/**
 * Floating stat bubble for profile page
 */
export function FloatingStatBubble({
  count,
  label,
  gradientFrom = '#8B5CF6',
  gradientTo = '#14B8A6',
  delay = 0,
}: {
  count: number;
  label: string;
  gradientFrom?: string;
  gradientTo?: string;
  delay?: number;
}) {
  return (
    <motion.div
      animate={{
        y: [-8, 8, -8],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      className="flex flex-col items-center px-4 py-3 rounded-[20px]"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        boxShadow: `
          0 0 15px 2px ${gradientFrom}66,
          3px 3px 20px 4px ${gradientTo}4D
        `,
      }}
    >
      <span className="text-lg font-bold text-white">
        {formatCount(count)}
      </span>
      <span className="text-xs font-semibold text-white/90 mt-0.5">
        {label}
      </span>
    </motion.div>
  );
}

/**
 * Floating profile picture container
 */
export function FloatingProfilePicture({
  src,
  fallback,
  size = 120,
  gradientFrom = '#14B8A6',
  gradientTo = '#8B5CF6',
}: {
  src?: string | null;
  fallback: string;
  size?: number;
  gradientFrom?: string;
  gradientTo?: string;
}) {
  return (
    <motion.div
      animate={{
        y: [-10, 10, -10],
        scale: [1, 1.03, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="p-2 rounded-[30px]"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        boxShadow: `
          0 0 20px 3px ${gradientFrom}66,
          3px 3px 25px 5px ${gradientTo}4D
        `,
      }}
    >
      <div
        className="rounded-[25px] bg-black overflow-hidden"
        style={{ width: size, height: size }}
      >
        {src ? (
          <img
            src={src}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
            }}
          >
            {fallback}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default FloatingPillButton;
