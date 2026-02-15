'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

// Re-export profile-specific components so existing imports still work
export {
  FloatingCircleButton,
  FloatingActionPill,
  FloatingStatBubble,
  FloatingProfilePicture,
} from './FloatingProfileComponents';

interface FloatingPillButtonProps {
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  label?: string;
  count?: number;
  isActive?: boolean;
  /** @deprecated Use CSS theme variables instead */
  gradientFrom?: string;
  /** @deprecated Use CSS theme variables instead */
  gradientTo?: string;
  /** Use theme colors from CSS variables (--color-primary, --color-secondary) */
  useThemeColors?: boolean;
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
 * Uses theme colors by default (CSS variables --color-primary, --color-secondary)
 */
export function FloatingPillButton({
  icon,
  activeIcon,
  label,
  count,
  isActive = false,
  gradientFrom,
  gradientTo,
  useThemeColors = true,
  onClick,
  className = '',
}: FloatingPillButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const primaryColor = useThemeColors ? 'var(--color-primary, #8B5CF6)' : (gradientFrom || '#8B5CF6');
  const secondaryColor = useThemeColors ? 'var(--color-secondary, #14B8A6)' : (gradientTo || '#14B8A6');

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
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        boxShadow: useThemeColors
          ? '0 0 12px 1px rgba(168, 85, 247, 0.4), 2px 2px 16px 2px rgba(20, 184, 166, 0.3)'
          : `0 0 12px 1px ${gradientFrom}66, 2px 2px 16px 2px ${gradientTo}4D`,
      }}
    >
      <div className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
        {displayIcon}
      </div>

      {displayLabel && (
        <span className="mt-1 text-[11px] font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
          {displayLabel}
        </span>
      )}
    </motion.button>
  );
}

export default FloatingPillButton;
