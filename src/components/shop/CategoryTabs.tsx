'use client';

import type { ProductCategory } from '@/types/shop';
import { categories } from './shopConfig';

interface CategoryTabsProps {
  activeCategory: ProductCategory | 'all';
  onCategoryChange: (category: ProductCategory | 'all') => void;
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 px-6 py-4 overflow-x-auto scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all border ${
            activeCategory === cat.id
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-white/20 shadow-lg shadow-purple-500/20'
              : 'glass text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <span>{cat.icon}</span>
          <span className="font-medium">{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
