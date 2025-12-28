'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';

interface FollowButtonProps {
  isFollowing?: boolean;
  onFollow?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

interface Confetti {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  delay: number;
}

const confettiColors = ['#8B5CF6', '#14B8A6', '#F97316', '#EC4899', '#FBBF24'];

/**
 * Follow button with confetti burst effect
 */
export function FollowButton({
  isFollowing = false,
  onFollow,
  size = 'md',
}: FollowButtonProps) {
  const [following, setFollowing] = useState(isFollowing);
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-1.5 text-sm',
    lg: 'px-6 py-2 text-base',
  };

  const createConfetti = useCallback(() => {
    const newConfetti: Confetti[] = [];
    const count = 12;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 360 + Math.random() * 30;
      const distance = 40 + Math.random() * 30;
      newConfetti.push({
        id: Date.now() + i,
        x: Math.cos((angle * Math.PI) / 180) * distance,
        y: Math.sin((angle * Math.PI) / 180) * distance - 20,
        rotation: Math.random() * 720 - 360,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        delay: Math.random() * 0.1,
      });
    }

    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 800);
  }, []);

  const handleClick = useCallback(() => {
    if (!following) {
      createConfetti();
    }
    setFollowing(!following);
    onFollow?.();
  }, [following, createConfetti, onFollow]);

  return (
    <div className="relative">
      {/* Confetti particles */}
      <AnimatePresence>
        {confetti.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-sm pointer-events-none"
            style={{ backgroundColor: particle.color }}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
            animate={{
              opacity: 0,
              scale: 1,
              x: particle.x,
              y: particle.y,
              rotate: particle.rotation,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
              delay: particle.delay,
            }}
          />
        ))}
      </AnimatePresence>

      <motion.button
        onClick={handleClick}
        className={`
          ${sizes[size]}
          font-medium rounded-full relative overflow-hidden
          ${following
            ? 'bg-white/10 border border-white/20 text-white'
            : 'bg-purple-500 text-white hover:bg-purple-400'
          }
          transition-colors
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <motion.span
          initial={false}
          animate={{ opacity: 1 }}
          className="relative z-10"
        >
          {following ? 'Following' : 'Follow'}
        </motion.span>

        {/* Success glow */}
        {following && (
          <motion.div
            className="absolute inset-0 bg-purple-500/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.4 }}
          />
        )}
      </motion.button>
    </div>
  );
}

/**
 * Subscribe button with special animation
 */
export function SubscribeButton({
  isSubscribed = false,
  price,
  onSubscribe,
}: {
  isSubscribed?: boolean;
  price?: string;
  onSubscribe?: () => void;
}) {
  const [subscribed, setSubscribed] = useState(isSubscribed);
  const [showStar, setShowStar] = useState(false);

  const handleClick = useCallback(() => {
    if (!subscribed) {
      setShowStar(true);
      setTimeout(() => setShowStar(false), 1000);
    }
    setSubscribed(!subscribed);
    onSubscribe?.();
  }, [subscribed, onSubscribe]);

  return (
    <div className="relative">
      {/* Star burst */}
      <AnimatePresence>
        {showStar && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleClick}
        className={`
          px-5 py-2 font-medium rounded-xl relative overflow-hidden
          ${subscribed
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
            : 'bg-gradient-to-r from-purple-500 to-teal-400 text-white'
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="relative z-10 flex items-center gap-2">
          {subscribed ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Subscribed
            </>
          ) : (
            <>Subscribe {price && `• ${price}/mo`}</>
          )}
        </span>
      </motion.button>
    </div>
  );
}

export default FollowButton;
