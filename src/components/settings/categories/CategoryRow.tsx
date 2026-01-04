'use client';

import type { FeedCategory } from '@/types';

interface CategoryRowProps {
  category: FeedCategory;
  userCount: number;
  onClick?: () => void;
  onDelete?: () => void;
}

function getDescription(category: FeedCategory, userCount: number) {
  switch (category.id) {
    case 'foryou': return 'Personalized for you';
    case 'following': return 'Everyone you follow';
    case 'self': return 'Your own videos';
    case 'friends': return 'Mutual follows only';
    default:
      return userCount > 0
        ? `${userCount} ${userCount === 1 ? 'person' : 'people'}`
        : 'No users yet';
  }
}

export function CategoryRow({ category, userCount, onClick, onDelete }: CategoryRowProps) {
  return (
    <div
      className="glass-card flex items-center gap-4 p-4 rounded-xl mb-2 cursor-pointer hover:bg-white/5 transition-colors group"
      onClick={onClick}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
        style={{ backgroundColor: `${category.color}20` }}
      >
        {category.icon}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{category.name}</span>
          {category.type === 'custom' && (
            <span className="px-2 py-0.5 text-[10px] uppercase text-purple-400 bg-purple-500/20 rounded-full">
              Custom
            </span>
          )}
        </div>
        <span className="text-white/40 text-sm">{getDescription(category, userCount)}</span>
      </div>

      <div className="flex items-center gap-2">
        {category.isDeletable && onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
        <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}
