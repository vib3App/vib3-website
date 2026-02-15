'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';



interface KeyMoment {
  timestamp: number;
  label: string;
  type: 'highlight' | 'funny' | 'educational' | 'emotional';
}

interface VideoSummaryProps {
  summary: string;
  keyMoments: KeyMoment[];
  topics: string[];
  sentiment: { positive: number; neutral: number; negative: number };
  onSeekTo?: (timestamp: number) => void;
  className?: string;
}

/**
 * AI-generated video summary and insights
 */
export function VideoInsights({
  summary,
  keyMoments,
  topics,
  sentiment,
  onSeekTo,
  className = '',
}: VideoSummaryProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'moments' | 'topics'>('summary');
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const momentIcons = {
    highlight: '⭐',
    funny: '😂',
    educational: '📚',
    emotional: '❤️',
  };

  return (
    <motion.div
      className={`glass-card rounded-2xl overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <motion.div
            className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500
                       flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <span className="text-sm">🤖</span>
          </motion.div>
          <div>
            <div className="text-white font-medium">AI Insights</div>
            <div className="text-white/50 text-xs">Powered by VIB3 AI</div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="text-white/50"
        >
          ▼
        </motion.div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {(['summary', 'moments', 'topics'] as const).map((tab) => (
                <button
                  key={tab}
                  className={`flex-1 py-2 text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-purple-400 border-b-2 border-purple-400'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4">
              {activeTab === 'summary' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <p className="text-white/80 text-sm leading-relaxed">{summary}</p>

                  {/* Sentiment bar */}
                  <div>
                    <div className="text-white/50 text-xs mb-2">Sentiment Analysis</div>
                    <div className="h-2 rounded-full overflow-hidden flex">
                      <motion.div
                        className="bg-green-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${sentiment.positive}%` }}
                        transition={{ delay: 0.2 }}
                      />
                      <motion.div
                        className="bg-gray-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${sentiment.neutral}%` }}
                        transition={{ delay: 0.3 }}
                      />
                      <motion.div
                        className="bg-red-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${sentiment.negative}%` }}
                        transition={{ delay: 0.4 }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-white/50 mt-1">
                      <span>Positive {sentiment.positive}%</span>
                      <span>Neutral {sentiment.neutral}%</span>
                      <span>Negative {sentiment.negative}%</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'moments' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  {keyMoments.map((moment, index) => (
                    <motion.button
                      key={index}
                      className="w-full flex items-center gap-3 p-2 rounded-lg
                               bg-white/5 hover:bg-white/10 transition-colors text-left"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => onSeekTo?.(moment.timestamp)}
                    >
                      <span className="text-lg">{momentIcons[moment.type]}</span>
                      <div className="flex-1">
                        <div className="text-white text-sm">{moment.label}</div>
                        <div className="text-white/50 text-xs capitalize">
                          {moment.type}
                        </div>
                      </div>
                      <div className="text-purple-400 text-sm font-mono">
                        {formatTime(moment.timestamp)}
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {activeTab === 'topics' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap gap-2"
                >
                  {topics.map((topic, index) => (
                    <motion.span
                      key={topic}
                      className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-sm
                               hover:bg-purple-500/30 hover:text-purple-300 cursor-pointer
                               transition-colors"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      #{topic}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Quick AI summary badge for video cards
 */
export function AISummaryBadge({ summary }: { summary: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      <motion.div
        className="flex items-center gap-1 px-2 py-1 rounded-full
                   bg-purple-500/30 border border-purple-500/50 cursor-pointer"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
      >
        <span className="text-xs">🤖</span>
        <span className="text-purple-300 text-xs">AI Summary</span>
      </motion.div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute bottom-full left-0 mb-2 p-3 rounded-lg
                       bg-black/90 backdrop-blur-xl border border-white/10
                       w-64 text-white/80 text-xs z-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {summary}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VideoInsights;
