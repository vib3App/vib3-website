'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';

interface ProfileStyle {
  headerGradient: string[];
  avatarBorder: string;
  cardStyle: 'glass' | 'solid' | 'gradient' | 'minimal';
  fontStyle: 'modern' | 'classic' | 'playful' | 'elegant';
  layoutDensity: 'compact' | 'comfortable' | 'spacious';
}

interface ProfileBadge {
  id: string;
  name: string;
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const gradientPresets = [
  ['#a855f7', '#ec4899'],
  ['#3b82f6', '#06b6d4'],
  ['#22c55e', '#10b981'],
  ['#f97316', '#eab308'],
  ['#ef4444', '#f97316'],
  ['#8b5cf6', '#6366f1'],
  ['#ec4899', '#f43f5e'],
  ['#14b8a6', '#22c55e'],
];

const mockBadges: ProfileBadge[] = [
  { id: '1', name: 'Early Adopter', icon: '🌟', color: '#a855f7', rarity: 'legendary' },
  { id: '2', name: 'Content Creator', icon: '🎬', color: '#ec4899', rarity: 'epic' },
  { id: '3', name: 'Verified', icon: '✓', color: '#3b82f6', rarity: 'rare' },
  { id: '4', name: 'Top Fan', icon: '❤️', color: '#ef4444', rarity: 'common' },
  { id: '5', name: 'Trendsetter', icon: '🔥', color: '#f97316', rarity: 'epic' },
  { id: '6', name: 'Night Owl', icon: '🦉', color: '#6366f1', rarity: 'rare' },
];

interface ProfileCustomizerProps {
  className?: string;
}

/**
 * Profile appearance customization panel
 */
export function ProfileCustomizer({ className = '' }: ProfileCustomizerProps) {
  const [style, setStyle] = useState<ProfileStyle>({
    headerGradient: ['#a855f7', '#ec4899'],
    avatarBorder: '#a855f7',
    cardStyle: 'glass',
    fontStyle: 'modern',
    layoutDensity: 'comfortable',
  });

  const [selectedBadges, setSelectedBadges] = useState<string[]>(['1']);
  const [activeTab, setActiveTab] = useState<'style' | 'badges' | 'layout'>('style');

  const updateStyle = useCallback(<K extends keyof ProfileStyle>(
    key: K,
    value: ProfileStyle[K]
  ) => {
    setStyle(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleBadge = useCallback((badgeId: string) => {
    setSelectedBadges(prev =>
      prev.includes(badgeId)
        ? prev.filter(id => id !== badgeId)
        : prev.length < 3 ? [...prev, badgeId] : prev
    );
  }, []);

  const rarityColors = {
    common: 'border-gray-500',
    rare: 'border-blue-500',
    epic: 'border-purple-500',
    legendary: 'border-yellow-500',
  };

  return (
    <motion.div
      className={`glass-card rounded-2xl overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Preview Header */}
      <div
        className="h-32 relative"
        style={{
          background: `linear-gradient(135deg, ${style.headerGradient[0]}, ${style.headerGradient[1]})`,
        }}
      >
        <div className="absolute -bottom-10 left-6">
          <div
            className="w-20 h-20 rounded-full bg-gray-800 border-4"
            style={{ borderColor: style.avatarBorder }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
              👤
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-14 p-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-lg mb-6">
          {(['style', 'badges', 'layout'] as const).map((tab) => (
            <motion.button
              key={tab}
              className={`flex-1 py-2 rounded-md text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-purple-500 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'style' && (
            <motion.div
              key="style"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Header Gradient */}
              <div>
                <label className="text-white/50 text-sm block mb-2">Header Gradient</label>
                <div className="grid grid-cols-4 gap-2">
                  {gradientPresets.map((gradient, index) => (
                    <motion.button
                      key={index}
                      className={`h-12 rounded-lg ${
                        style.headerGradient[0] === gradient[0]
                          ? 'ring-2 ring-white'
                          : ''
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
                      }}
                      onClick={() => updateStyle('headerGradient', gradient)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    />
                  ))}
                </div>
              </div>

              {/* Card Style */}
              <div>
                <label className="text-white/50 text-sm block mb-2">Card Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['glass', 'solid', 'gradient', 'minimal'] as const).map((cardStyle) => (
                    <motion.button
                      key={cardStyle}
                      className={`p-4 rounded-xl text-center capitalize ${
                        style.cardStyle === cardStyle
                          ? 'bg-purple-500/30 border border-purple-500/50'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => updateStyle('cardStyle', cardStyle)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-white/70 text-sm">{cardStyle}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Font Style */}
              <div>
                <label className="text-white/50 text-sm block mb-2">Font Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['modern', 'classic', 'playful', 'elegant'] as const).map((font) => (
                    <motion.button
                      key={font}
                      className={`p-3 rounded-xl text-center capitalize ${
                        style.fontStyle === font
                          ? 'bg-purple-500/30 border border-purple-500/50'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => updateStyle('fontStyle', font)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-white/70 text-sm">{font}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'badges' && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <p className="text-white/50 text-sm">Select up to 3 badges to display</p>

              <div className="grid grid-cols-2 gap-3">
                {mockBadges.map((badge) => (
                  <motion.button
                    key={badge.id}
                    className={`p-3 rounded-xl border-2 transition-colors ${
                      selectedBadges.includes(badge.id)
                        ? `${rarityColors[badge.rarity]} bg-white/10`
                        : 'border-transparent bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => toggleBadge(badge.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                        style={{ backgroundColor: badge.color + '30' }}
                      >
                        {badge.icon}
                      </span>
                      <div className="text-left">
                        <div className="text-white text-sm">{badge.name}</div>
                        <div className="text-white/40 text-xs capitalize">{badge.rarity}</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'layout' && (
            <motion.div
              key="layout"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Layout Density */}
              <div>
                <label className="text-white/50 text-sm block mb-2">Content Density</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
                    <motion.button
                      key={density}
                      className={`p-3 rounded-xl text-center capitalize ${
                        style.layoutDensity === density
                          ? 'bg-purple-500/30 border border-purple-500/50'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => updateStyle('layoutDensity', density)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-white/70 text-sm">{density}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Grid Preview */}
              <div>
                <label className="text-white/50 text-sm block mb-2">Grid Preview</label>
                <div
                  className={`grid gap-1 ${
                    style.layoutDensity === 'compact'
                      ? 'grid-cols-4'
                      : style.layoutDensity === 'spacious'
                        ? 'grid-cols-2'
                        : 'grid-cols-3'
                  }`}
                >
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-white/10"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default ProfileCustomizer;
