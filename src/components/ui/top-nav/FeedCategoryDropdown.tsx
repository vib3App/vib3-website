'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useFeedCategoryStore } from '@/stores/feedCategoryStore';
import type { FeedCategory } from '@/types';

interface FeedCategoryDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function FeedCategoryDropdown({ isOpen, onToggle, onClose }: FeedCategoryDropdownProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { categories, selectedCategory, selectCategory, categoryCounts } = useFeedCategoryStore();

  const isActive = pathname === '/feed' || pathname.startsWith('/feed/');

  const handleSelectCategory = (category: FeedCategory) => {
    selectCategory(category);
    onClose();
    if (pathname !== '/feed') {
      router.push('/feed');
    }
  };

  const handleSettingsClick = (e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation();
    onClose();
    router.push(`/settings/categories/${categoryId}`);
  };

  const getCategoryDescription = (category: FeedCategory) => {
    switch (category.id) {
      case 'foryou': return 'Personalized for you';
      case 'following': return 'Everyone you follow';
      case 'self': return 'Your own videos';
      case 'friends': return 'Mutual follows only';
      case 'family': return `${categoryCounts[category.id] || 0} people`;
      default:
        if (category.type === 'custom' || category.type === 'default') {
          const count = categoryCounts[category.id] || 0;
          return `${count} ${count === 1 ? 'person' : 'people'}`;
        }
        return '';
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
          isActive || isOpen
            ? 'bg-black/70 text-white border border-teal-500/50'
            : 'bg-black/50 text-white/90 hover:bg-black/70 border border-white/10'
        }`}
      >
        <span className="w-5 h-5 rounded flex items-center justify-center text-sm" style={{ color: selectedCategory?.color || '#8B5CF6' }}>
          {selectedCategory?.icon || '✨'}
        </span>
        <span>{selectedCategory?.name || 'For You'}</span>
        <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[300px] bg-black/95 backdrop-blur-xl rounded-2xl border border-teal-500/30 shadow-2xl overflow-hidden z-[100] animate-in">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-white/50 text-xs">Categories</span>
            <Link href="/settings/categories" className="text-purple-400 text-xs hover:text-purple-300 transition-colors" onClick={() => onClose()}>
              Manage
            </Link>
          </div>

          <div className="py-2 max-h-[50vh] overflow-y-auto">
            {categories.map((category) => {
              const isSelected = selectedCategory?.id === category.id;
              return (
                <div
                  key={category.id}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer ${
                    isSelected ? 'bg-gradient-to-r from-purple-500/15 to-transparent border-l-2' : 'hover:bg-white/5 border-l-2 border-transparent'
                  }`}
                  style={{ borderLeftColor: isSelected ? category.color : 'transparent' }}
                  onClick={() => handleSelectCategory(category)}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: `${category.color}25` }}>
                    {category.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm truncate ${isSelected ? 'text-white' : 'text-white/80'}`}>{category.name}</span>
                      {isSelected && (
                        <svg className="w-4 h-4 flex-shrink-0" style={{ color: category.color }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-white/40 text-xs">{getCategoryDescription(category)}</span>
                  </div>
                  <button onClick={(e) => handleSettingsClick(e, category.id)} className="p-1.5 text-white/30 hover:text-white/70 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0" title="Category settings">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="border-t border-white/10 py-2">
            <Link href="/discover" className="block w-full px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white transition-colors" onClick={() => onClose()}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🔍</span>
                <div><div className="font-medium text-sm">Discover</div><div className="text-xs text-white/40">Explore trending content</div></div>
              </div>
            </Link>
            <Link href="/live" className="block w-full px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white transition-colors" onClick={() => onClose()}>
              <div className="flex items-center gap-3">
                <span className="text-lg">📡</span>
                <div><div className="font-medium text-sm">LIVE</div><div className="text-xs text-white/40">Watch live streams</div></div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
