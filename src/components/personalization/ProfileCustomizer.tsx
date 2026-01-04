'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import type { ProfileStyle } from './ProfileCustomizerTypes';
import { StyleTab } from './StyleTab';
import { BadgesTab } from './BadgesTab';
import { LayoutTab } from './LayoutTab';

interface ProfileCustomizerProps {
  className?: string;
}

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
            <StyleTab style={style} updateStyle={updateStyle} />
          )}
          {activeTab === 'badges' && (
            <BadgesTab selectedBadges={selectedBadges} toggleBadge={toggleBadge} />
          )}
          {activeTab === 'layout' && (
            <LayoutTab style={style} updateStyle={updateStyle} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default ProfileCustomizer;
