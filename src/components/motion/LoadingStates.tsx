'use client';

import { motion } from 'framer-motion';

/**
 * Skeleton with animated shimmer effect
 */
export function Skeleton({
  className = '',
  variant = 'rectangular',
}: {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}) {
  const baseClass = 'relative overflow-hidden bg-white/5';
  const variantClass = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded-md h-4',
  };

  return (
    <div className={`${baseClass} ${variantClass[variant]} ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{
          duration: 1.5,
          ease: 'linear',
          repeat: Infinity,
        }}
      />
    </div>
  );
}

/**
 * Video card skeleton
 */
export function VideoCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[9/16] w-full" />
      <div className="flex gap-3">
        <Skeleton variant="circular" className="w-10 h-10 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
    </div>
  );
}

/**
 * User card skeleton
 */
export function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton variant="circular" className="w-12 h-12" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-32" />
        <Skeleton variant="text" className="w-20" />
      </div>
      <Skeleton className="w-20 h-8 rounded-full" />
    </div>
  );
}

/**
 * Pulsing VIB3 logo loader
 */
export function LogoLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-24 h-24 text-5xl',
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`${sizes[size]} rounded-2xl bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center font-bold text-white`}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 1.5,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      >
        V3
      </motion.div>
    </div>
  );
}

/**
 * Spinning loader with gradient
 */
export function SpinnerLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      className={`${sizes[size]} rounded-full border-2 border-white/10 border-t-purple-500`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        ease: 'linear',
        repeat: Infinity,
      }}
    />
  );
}

/**
 * Dots loader
 */
export function DotsLoader() {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-purple-400"
          animate={{
            y: [0, -8, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Progress bar with animation
 */
export function ProgressBar({
  progress,
  className = '',
}: {
  progress: number;
  className?: string;
}) {
  return (
    <div className={`h-1 bg-white/10 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-gradient-to-r from-purple-500 to-teal-400"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </div>
  );
}

/**
 * Full page loader overlay
 */
export function PageLoader() {
  return (
    <motion.div
      className="fixed inset-0 bg-neutral-950 z-50 flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center gap-6">
        <LogoLoader size="lg" />
        <DotsLoader />
      </div>
    </motion.div>
  );
}

/**
 * Content loader that fades in when ready
 */
export function ContentLoader({
  isLoading,
  children,
  skeleton,
}: {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
}) {
  return (
    <>
      {isLoading ? (
        skeleton || <Skeleton className="w-full h-40" />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </>
  );
}

export default Skeleton;
