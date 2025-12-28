'use client';

import { motion } from 'framer-motion';
import { ReactNode, useCallback } from 'react';
import { useHaptics } from '@/hooks/useHaptics';

interface HapticButtonProps {
  children: ReactNode;
  onClick?: () => void;
  hapticType?: 'tap' | 'medium' | 'heavy' | 'success' | 'warning';
  className?: string;
  disabled?: boolean;
}

/**
 * Button with haptic feedback on press
 */
export function HapticButton({
  children,
  onClick,
  hapticType = 'tap',
  className = '',
  disabled = false,
}: HapticButtonProps) {
  const { vibrate, tap } = useHaptics();

  const handleClick = useCallback(() => {
    if (disabled) return;

    switch (hapticType) {
      case 'tap':
        tap();
        break;
      default:
        vibrate(hapticType);
    }
    onClick?.();
  }, [hapticType, onClick, tap, vibrate, disabled]);

  return (
    <motion.button
      className={className}
      onClick={handleClick}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

interface HapticIconButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  hapticType?: 'tap' | 'medium' | 'success';
  className?: string;
}

/**
 * Icon button with haptic feedback and visual states
 */
export function HapticIconButton({
  icon,
  label,
  onClick,
  active = false,
  hapticType = 'tap',
  className = '',
}: HapticIconButtonProps) {
  const { vibrate, tap, success } = useHaptics();

  const handleClick = useCallback(() => {
    if (hapticType === 'success') {
      success();
    } else if (hapticType === 'tap') {
      tap();
    } else {
      vibrate(hapticType);
    }
    onClick?.();
  }, [hapticType, onClick, tap, success, vibrate]);

  return (
    <motion.button
      className={`
        relative p-3 rounded-full transition-colors
        ${active
          ? 'bg-purple-500/30 text-purple-400'
          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
        }
        ${className}
      `}
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={label}
    >
      {icon}
      {active && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-purple-400"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.2, opacity: 0 }}
        />
      )}
    </motion.button>
  );
}

interface HapticSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  hapticOnChange?: boolean;
  className?: string;
}

/**
 * Slider with haptic feedback at intervals
 */
export function HapticSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  hapticOnChange = true,
  className = '',
}: HapticSliderProps) {
  const { selection } = useHaptics();
  const lastHapticValue = { current: value };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);

    // Haptic feedback every 10%
    if (hapticOnChange) {
      const oldPercent = Math.floor(lastHapticValue.current / (max - min) * 10);
      const newPercent = Math.floor(newValue / (max - min) * 10);
      if (oldPercent !== newPercent) {
        selection();
      }
    }

    lastHapticValue.current = newValue;
    onChange(newValue);
  }, [onChange, hapticOnChange, max, min, selection]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`relative ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-purple-500/30"
      />
      {/* Progress fill */}
      <div
        className="absolute top-0 left-0 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

interface HapticToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

/**
 * Toggle switch with haptic feedback
 */
export function HapticToggle({
  checked,
  onChange,
  label,
  className = '',
}: HapticToggleProps) {
  const { impact } = useHaptics();

  const handleToggle = useCallback(() => {
    impact();
    onChange(!checked);
  }, [checked, onChange, impact]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.button
        className={`
          w-12 h-6 rounded-full p-1 transition-colors
          ${checked ? 'bg-purple-500' : 'bg-white/10'}
        `}
        onClick={handleToggle}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="w-4 h-4 bg-white rounded-full shadow-md"
          animate={{ x: checked ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.button>
      {label && <span className="text-white/70 text-sm">{label}</span>}
    </div>
  );
}

export default HapticButton;
