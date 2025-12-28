'use client';

import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  formatFn?: (value: number) => string;
}

/**
 * Counter that animates from 0 to target value when scrolled into view
 */
export function AnimatedCounter({
  value,
  duration = 2,
  className = '',
  prefix = '',
  suffix = '',
  formatFn,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const display = useTransform(spring, (current) => {
    if (formatFn) return formatFn(Math.round(current));
    return Math.round(current).toLocaleString();
  });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      spring.set(value);
      setHasAnimated(true);
    }
  }, [isInView, value, spring, hasAnimated]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

/**
 * Format large numbers (1000 -> 1K, 1000000 -> 1M)
 */
export function formatCompact(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Animated stat with label
 */
export function AnimatedStat({
  value,
  label,
  prefix = '',
  suffix = '',
  className = '',
}: {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <div className={`text-center ${className}`}>
      <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-teal-400 bg-clip-text text-transparent">
        <AnimatedCounter
          value={value}
          prefix={prefix}
          suffix={suffix}
          formatFn={formatCompact}
        />
      </div>
      <div className="text-white/50 text-sm mt-1">{label}</div>
    </div>
  );
}

export default AnimatedCounter;
