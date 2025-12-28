'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Reaction {
  id: number;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  duration: number;
}

interface ReactionsLayerProps {
  /** Whether to show the reactions layer */
  enabled?: boolean;
  /** Maximum number of visible reactions */
  maxReactions?: number;
  /** Callback when user sends a reaction */
  onReact?: (emoji: string) => void;
}

const availableEmojis = ['❤️', '🔥', '😂', '😮', '👏', '💯', '🎉', '💀'];

/**
 * Floating reactions layer that displays emoji reactions
 * drifting across the video
 */
export function ReactionsLayer({
  enabled = true,
  maxReactions = 30,
  onReact,
}: ReactionsLayerProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  // Add a new reaction
  const addReaction = useCallback((emoji: string, fromUser: boolean = false) => {
    if (!enabled) return;

    const newReaction: Reaction = {
      id: Date.now() + Math.random(),
      emoji,
      x: 70 + Math.random() * 25, // Right side of screen (70-95%)
      y: 100, // Start from bottom
      scale: 0.8 + Math.random() * 0.6,
      duration: 3 + Math.random() * 2,
    };

    setReactions(prev => {
      const updated = [...prev, newReaction];
      // Keep only the last maxReactions
      return updated.slice(-maxReactions);
    });

    if (fromUser) {
      onReact?.(emoji);
    }

    // Remove reaction after animation
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, newReaction.duration * 1000);
  }, [enabled, maxReactions, onReact]);

  // Simulate incoming reactions (demo)
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomEmoji = availableEmojis[Math.floor(Math.random() * availableEmojis.length)];
        addReaction(randomEmoji, false);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [enabled, addReaction]);

  const handleEmojiClick = useCallback((emoji: string) => {
    addReaction(emoji, true);
    setShowPicker(false);
  }, [addReaction]);

  if (!enabled) return null;

  return (
    <>
      {/* Floating reactions */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {reactions.map(reaction => (
            <motion.div
              key={reaction.id}
              className="absolute text-2xl"
              initial={{
                x: `${reaction.x}%`,
                y: '100%',
                opacity: 0,
                scale: 0,
              }}
              animate={{
                y: '-20%',
                opacity: [0, 1, 1, 0],
                scale: reaction.scale,
                x: `${reaction.x + (Math.random() - 0.5) * 10}%`,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: reaction.duration,
                ease: 'easeOut',
                opacity: {
                  times: [0, 0.1, 0.8, 1],
                },
              }}
              style={{ fontSize: `${reaction.scale * 1.5}rem` }}
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reaction button */}
      <div className="absolute bottom-20 right-4">
        <motion.button
          className="p-3 rounded-full glass text-white/80 hover:text-white transition-colors"
          onClick={() => setShowPicker(!showPicker)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-xl">😊</span>
        </motion.button>

        {/* Emoji picker */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              className="absolute bottom-14 right-0 p-2 rounded-2xl glass flex gap-1"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {availableEmojis.map(emoji => (
                <motion.button
                  key={emoji}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors text-xl"
                  onClick={() => handleEmojiClick(emoji)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {emoji}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/**
 * Reaction heatmap showing where reactions peaked
 */
export function ReactionHeatmap({
  data,
  duration,
  currentTime,
}: {
  data: { time: number; count: number }[];
  duration: number;
  currentTime: number;
}) {
  if (!data.length || !duration) return null;

  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 flex">
      {data.map((point, i) => {
        const width = 100 / data.length;
        const intensity = point.count / maxCount;
        const isPast = point.time < currentTime;

        return (
          <div
            key={i}
            className="h-full transition-all duration-300"
            style={{
              width: `${width}%`,
              backgroundColor: `rgba(139, 92, 246, ${intensity * (isPast ? 0.8 : 0.3)})`,
            }}
          />
        );
      })}
    </div>
  );
}

export default ReactionsLayer;
