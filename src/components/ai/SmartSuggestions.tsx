'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface BestTimeSlot {
  hour: number;
  score: number; // 0-100 engagement potential
  audienceSize: 'low' | 'medium' | 'high';
}

interface TrendingSound {
  id: string;
  name: string;
  artist: string;
  uses: number;
  growth: number;
  preview?: string;
}

interface HashtagSuggestion {
  tag: string;
  reach: number;
  competition: 'low' | 'medium' | 'high';
  trending: boolean;
}

/**
 * Best time to post visualization
 */
export function BestTimeToPost({ className = '' }: { className?: string }) {
  const [slots, setSlots] = useState<BestTimeSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    // Generate mock data based on day
    const generateSlots = () => {
      return Array.from({ length: 24 }, (_, hour) => {
        // Simulate engagement patterns
        let baseScore = 30;
        if (hour >= 7 && hour <= 9) baseScore = 60;
        if (hour >= 12 && hour <= 14) baseScore = 75;
        if (hour >= 18 && hour <= 22) baseScore = 90;
        if (hour >= 0 && hour <= 5) baseScore = 20;

        // Add some randomness
        const score = Math.min(100, Math.max(0, baseScore + Math.random() * 20 - 10));

        return {
          hour,
          score: Math.round(score),
          audienceSize: score > 70 ? 'high' : score > 40 ? 'medium' : 'low',
        } as BestTimeSlot;
      });
    };
    setSlots(generateSlots());
  }, [selectedDay]);

  const bestSlot = slots.reduce((best, slot) =>
    slot.score > (best?.score || 0) ? slot : best, slots[0]);

  const formatHour = (hour: number) => {
    if (hour === 0) return '12am';
    if (hour === 12) return '12pm';
    return hour > 12 ? `${hour - 12}pm` : `${hour}am`;
  };

  return (
    <motion.div
      className={`glass-card p-4 rounded-2xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-medium">Best Time to Post</h3>
          <p className="text-white/50 text-sm">When your audience is most active</p>
        </div>
        <div className="text-2xl">⏰</div>
      </div>

      {/* Day selector */}
      <div className="flex gap-1 mb-4">
        {days.map((day, index) => (
          <motion.button
            key={day}
            className={`flex-1 py-1.5 rounded-lg text-xs transition-colors ${
              selectedDay === index
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
            onClick={() => setSelectedDay(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {day}
          </motion.button>
        ))}
      </div>

      {/* Heatmap */}
      <div className="grid grid-cols-12 gap-1 mb-4">
        {slots.slice(0, 24).map((slot, index) => (
          <motion.div
            key={index}
            className="aspect-square rounded cursor-pointer relative group"
            style={{
              backgroundColor: `rgba(168, 85, 247, ${slot.score / 100})`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.02 }}
            whileHover={{ scale: 1.2, zIndex: 10 }}
          >
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                          opacity-0 group-hover:opacity-100 transition-opacity
                          bg-black/90 px-2 py-1 rounded text-xs text-white
                          whitespace-nowrap z-20">
              {formatHour(slot.hour)}: {slot.score}% engagement
            </div>
          </motion.div>
        ))}
      </div>

      {/* Best time recommendation */}
      {bestSlot && (
        <motion.div
          className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <div>
              <div className="text-white text-sm font-medium">
                Best time: {formatHour(bestSlot.hour)}
              </div>
              <div className="text-white/60 text-xs">
                {bestSlot.score}% higher engagement potential
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Trending sounds suggestions
 */
export function TrendingSounds({ className = '' }: { className?: string }) {
  const [sounds, setSounds] = useState<TrendingSound[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSounds([
        { id: '1', name: 'Summer Vibes', artist: 'DJ Sun', uses: 1250000, growth: 85 },
        { id: '2', name: 'Electric Dreams', artist: 'Synth Wave', uses: 890000, growth: 120 },
        { id: '3', name: 'Chill Lo-Fi', artist: 'Beats Lab', uses: 2100000, growth: 45 },
        { id: '4', name: 'Bass Drop', artist: 'Heavy Beats', uses: 560000, growth: 200 },
      ]);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const formatUses = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={`glass-card p-4 rounded-2xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-medium">Trending Sounds</h3>
          <p className="text-white/50 text-sm">Popular audio for your content</p>
        </div>
        <div className="text-2xl">🎵</div>
      </div>

      <div className="space-y-2">
        {sounds.map((sound, index) => (
          <motion.div
            key={sound.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5
                       hover:bg-white/10 transition-colors cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500
                         flex items-center justify-center"
              whileHover={{ rotate: [0, -10, 10, 0] }}
            >
              <span>🎧</span>
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">
                {sound.name}
              </div>
              <div className="text-white/50 text-xs">{sound.artist}</div>
            </div>
            <div className="text-right">
              <div className="text-white/60 text-xs">{formatUses(sound.uses)} uses</div>
              <div className="text-green-400 text-xs">+{sound.growth}%</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/**
 * Hashtag suggestions with analytics
 */
export function HashtagSuggestions({ className = '' }: { className?: string }) {
  const [hashtags, setHashtags] = useState<HashtagSuggestion[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setHashtags([
      { tag: 'fyp', reach: 50000000000, competition: 'high', trending: true },
      { tag: 'viral', reach: 10000000000, competition: 'high', trending: true },
      { tag: 'vib3', reach: 500000, competition: 'low', trending: true },
      { tag: 'contentcreator', reach: 5000000000, competition: 'medium', trending: false },
      { tag: 'trending', reach: 8000000000, competition: 'high', trending: true },
      { tag: 'foryou', reach: 30000000000, competition: 'high', trending: false },
    ]);
  }, []);

  const formatReach = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(0)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const competitionColors = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-red-400',
  };

  const toggleHashtag = (tag: string) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <motion.div
      className={`glass-card p-4 rounded-2xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-medium">Smart Hashtags</h3>
          <p className="text-white/50 text-sm">AI-recommended for reach</p>
        </div>
        <div className="text-2xl">#️⃣</div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {hashtags.map((hashtag, index) => (
          <motion.button
            key={hashtag.tag}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              selected.includes(hashtag.tag)
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => toggleHashtag(hashtag.tag)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            #{hashtag.tag}
            {hashtag.trending && (
              <span className="ml-1">🔥</span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Selected hashtags info */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            className="p-3 rounded-xl bg-white/5 space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="text-white/60 text-xs">Selected: {selected.length} hashtags</div>
            {selected.map((tag) => {
              const hashtag = hashtags.find((h) => h.tag === tag);
              if (!hashtag) return null;
              return (
                <div key={tag} className="flex items-center justify-between text-xs">
                  <span className="text-white">#{tag}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white/50">{formatReach(hashtag.reach)} reach</span>
                    <span className={competitionColors[hashtag.competition]}>
                      {hashtag.competition}
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default BestTimeToPost;
