'use client';

import type { ChallengeCategory } from '@/types/challenge';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🔥' },
  { id: 'trending', label: 'Trending', icon: '📈' },
  { id: 'new', label: 'New', icon: '✨' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'dance', label: 'Dance', icon: '💃' },
  { id: 'comedy', label: 'Comedy', icon: '😂' },
  { id: 'sponsored', label: 'Sponsored', icon: '⭐' },
];

interface ChallengeCategoryTabsProps {
  activeCategory: ChallengeCategory | 'all';
  onCategoryChange: (category: ChallengeCategory | 'all') => void;
}

export function ChallengeCategoryTabs({ activeCategory, onCategoryChange }: ChallengeCategoryTabsProps) {
  return (
    <div className="flex gap-2 px-6 py-4 overflow-x-auto scrollbar-hide">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id as ChallengeCategory | 'all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all border ${
            activeCategory === cat.id
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-white/20 shadow-lg shadow-amber-500/20'
              : 'glass text-white/70 hover:bg-white/10'
          }`}
        >
          <span>{cat.icon}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
