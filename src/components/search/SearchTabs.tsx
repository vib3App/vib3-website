'use client';

import type { SearchTab } from '@/hooks/useSearch';

interface SearchTabsProps {
  activeTab: SearchTab;
  onTabChange: (tab: SearchTab) => void;
  showFilters: boolean;
  onShowFiltersChange: (show: boolean) => void;
}

const TABS: { id: SearchTab; label: string }[] = [
  { id: 'top', label: 'Top' },
  { id: 'users', label: 'Users' },
  { id: 'videos', label: 'Videos' },
  { id: 'sounds', label: 'Sounds' },
  { id: 'hashtags', label: 'Hashtags' },
  { id: 'transcripts', label: 'In Videos' },
];

export function SearchTabs({ activeTab, onTabChange, showFilters, onShowFiltersChange }: SearchTabsProps) {
  return (
    <div className="flex items-center border-b border-white/5">
      <div className="flex-1 flex overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-shrink-0 px-6 py-3 text-sm font-medium relative ${
              activeTab === tab.id ? 'text-white' : 'text-white/50'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-teal-400" />
            )}
          </button>
        ))}
      </div>
      <button
        onClick={() => onShowFiltersChange(!showFilters)}
        className={`p-3 ${showFilters ? 'text-purple-400' : 'text-white/50'}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </button>
    </div>
  );
}
