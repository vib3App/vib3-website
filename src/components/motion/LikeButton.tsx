'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';

interface LikeButtonProps {
  isLiked?: boolean;
  likeCount?: number;
  onLike?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

/**
 * Like button with exploding hearts particle effect
 */
export function LikeButton({
  isLiked = false,
  likeCount = 0,
  onLike,
  size = 'md',
}: LikeButtonProps) {
  const [liked, setLiked] = useState(isLiked);
  const [particles, setParticles] = useState<Particle[]>([]);

  const sizes = {
    sm: { icon: 'w-5 h-5', text: 'text-xs' },
    md: { icon: 'w-6 h-6', text: 'text-sm' },
    lg: { icon: 'w-8 h-8', text: 'text-base' },
  };

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * 360;
      const distance = 30 + Math.random() * 20;
      newParticles.push({
        id: Date.now() + i,
        x: Math.cos((angle * Math.PI) / 180) * distance,
        y: Math.sin((angle * Math.PI) / 180) * distance,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
      });
    }

    setParticles(newParticles);
    setTimeout(() => setParticles([]), 600);
  }, []);

  const handleClick = useCallback(() => {
    if (!liked) {
      createParticles();
    }
    setLiked(!liked);
    onLike?.();
  }, [liked, createParticles, onLike]);

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.button
        onClick={handleClick}
        className="relative p-2"
        whileTap={{ scale: 0.8 }}
      >
        {/* Heart particles */}
        <AnimatePresence>
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              className="absolute top-1/2 left-1/2 pointer-events-none"
              initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                scale: particle.scale,
                x: particle.x,
                y: particle.y,
                rotate: particle.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <svg className="w-4 h-4 text-red-500 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Main heart icon */}
        <motion.div
          animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <svg
            className={`${sizes[size].icon} ${liked ? 'text-red-500 fill-current' : 'text-white/60'}`}
            fill={liked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </motion.div>

        {/* Glow effect when liked */}
        {liked && (
          <motion.div
            className="absolute inset-0 rounded-full bg-red-500/20 blur-xl"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.5, 0], scale: [0.5, 1.5, 1.5] }}
            transition={{ duration: 0.5 }}
          />
        )}
      </motion.button>

      {/* Like count */}
      <motion.span
        className={`${sizes[size].text} ${liked ? 'text-red-400' : 'text-white/60'}`}
        animate={liked ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.2 }}
      >
        {likeCount + (liked && !isLiked ? 1 : 0)}
      </motion.span>
    </div>
  );
}

export default LikeButton;
