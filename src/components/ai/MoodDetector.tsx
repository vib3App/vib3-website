'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type Mood = 'energetic' | 'chill' | 'focused' | 'creative' | 'social';

interface MoodConfig {
  label: string;
  emoji: string;
  color: string;
  gradient: string;
  description: string;
}

const moodConfigs: Record<Mood, MoodConfig> = {
  energetic: {
    label: 'Energetic',
    emoji: '⚡',
    color: 'rgb(239, 68, 68)',
    gradient: 'from-red-500 to-orange-500',
    description: 'Ready for action!',
  },
  chill: {
    label: 'Chill',
    emoji: '🌊',
    color: 'rgb(59, 130, 246)',
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Taking it easy',
  },
  focused: {
    label: 'Focused',
    emoji: '🎯',
    color: 'rgb(168, 85, 247)',
    gradient: 'from-purple-500 to-violet-500',
    description: 'Deep concentration',
  },
  creative: {
    label: 'Creative',
    emoji: '🎨',
    color: 'rgb(236, 72, 153)',
    gradient: 'from-pink-500 to-rose-500',
    description: 'Inspiration flowing',
  },
  social: {
    label: 'Social',
    emoji: '🎉',
    color: 'rgb(34, 197, 94)',
    gradient: 'from-green-500 to-emerald-500',
    description: 'Ready to connect',
  },
};

/**
 * Analyzes user behavior to detect current mood/vibe
 */
export function useMoodDetection() {
  const [mood, setMood] = useState<Mood>('focused');
  const [confidence, setConfidence] = useState(0.7);

  useEffect(() => {
    // Analyze based on time of day and simulated behavior
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 10) {
      setMood('energetic');
      setConfidence(0.8);
    } else if (hour >= 10 && hour < 14) {
      setMood('focused');
      setConfidence(0.85);
    } else if (hour >= 14 && hour < 18) {
      setMood('creative');
      setConfidence(0.75);
    } else if (hour >= 18 && hour < 22) {
      setMood('social');
      setConfidence(0.9);
    } else {
      setMood('chill');
      setConfidence(0.95);
    }
  }, []);

  return { mood, confidence, config: moodConfigs[mood] };
}

interface MoodIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * Visual mood indicator based on detected user mood
 */
export function MoodIndicator({ className = '', showLabel = true }: MoodIndicatorProps) {
  const { mood: _mood, confidence, config } = useMoodDetection();

  return (
    <motion.div
      className={`flex items-center gap-2 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.div
        className={`relative w-10 h-10 rounded-full bg-gradient-to-r ${config.gradient}
                   flex items-center justify-center shadow-lg`}
        style={{ boxShadow: `0 0 20px ${config.color}40` }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-lg">{config.emoji}</span>

        {/* Confidence ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 36 36"
        >
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="white"
            strokeOpacity="0.2"
            strokeWidth="2"
          />
          <motion.circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${confidence * 100}, 100`}
            initial={{ strokeDasharray: '0, 100' }}
            animate={{ strokeDasharray: `${confidence * 100}, 100` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </svg>
      </motion.div>

      {showLabel && (
        <div>
          <div className="text-white text-sm font-medium">{config.label}</div>
          <div className="text-white/50 text-xs">{config.description}</div>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Full mood panel with suggestions
 */
export function MoodPanel({ className = '' }: { className?: string }) {
  const { mood, config } = useMoodDetection();

  const suggestions: Record<Mood, string[]> = {
    energetic: ['Dance challenges', 'Workout videos', 'Fast-paced edits'],
    chill: ['Ambient content', 'ASMR', 'Lo-fi beats'],
    focused: ['Tutorials', 'Educational', 'How-to guides'],
    creative: ['Art timelapses', 'Music creation', 'DIY projects'],
    social: ['Duets', 'Watch parties', 'Live streams'],
  };

  return (
    <motion.div
      className={`glass-card p-4 rounded-2xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <MoodIndicator />

      <div className="mt-4">
        <div className="text-white/50 text-xs uppercase tracking-wider mb-2">
          Suggested for your vibe
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions[mood].map((suggestion, index) => (
            <motion.span
              key={suggestion}
              className={`px-3 py-1 rounded-full text-xs bg-gradient-to-r ${config.gradient}
                        bg-opacity-20 text-white/80`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {suggestion}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default MoodIndicator;
