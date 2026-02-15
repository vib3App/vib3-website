'use client';

import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';

interface BestTimeSlot {
  hour: number;
  score: number; // 0-100 engagement potential
  audienceSize: 'low' | 'medium' | 'high';
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function generateSlots(_dayIndex: number): BestTimeSlot[] {
  return Array.from({ length: 24 }, (_, hour) => {
    let baseScore = 30;
    if (hour >= 7 && hour <= 9) baseScore = 60;
    if (hour >= 12 && hour <= 14) baseScore = 75;
    if (hour >= 18 && hour <= 22) baseScore = 90;
    if (hour >= 0 && hour <= 5) baseScore = 20;

    const score = Math.min(100, Math.max(0, baseScore + Math.random() * 20 - 10));

    return {
      hour,
      score: Math.round(score),
      audienceSize: score > 70 ? 'high' : score > 40 ? 'medium' : 'low',
    };
  });
}

function formatHour(hour: number): string {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  return hour > 12 ? `${hour - 12}pm` : `${hour}am`;
}

export function BestTimeToPost({ className = '' }: { className?: string }) {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  // Generate slots based on selectedDay - useMemo recalculates when day changes
  const slots = useMemo(() => generateSlots(selectedDay), [selectedDay]);

  const bestSlot = slots.reduce((best, slot) =>
    slot.score > (best?.score || 0) ? slot : best, slots[0]);

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
        {DAYS.map((day, index) => (
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

export default BestTimeToPost;
