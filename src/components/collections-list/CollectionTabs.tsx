'use client';

import type { CollectionTabType } from '@/hooks/useCollections';

interface Tab {
  id: CollectionTabType;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  {
    id: 'playlists',
    label: 'Playlists',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
      </svg>
    ),
  },
  {
    id: 'saved',
    label: 'Saved',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
      </svg>
    ),
  },
  {
    id: 'liked',
    label: 'Liked',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'History',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13 3a9 9 0 00-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21a9 9 0 000-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
      </svg>
    ),
  },
];

interface CollectionTabsProps {
  activeTab: CollectionTabType;
  onTabChange: (tab: CollectionTabType) => void;
}

export function CollectionTabs({ activeTab, onTabChange }: CollectionTabsProps) {
  return (
    <div className="flex border-b border-white/5">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium relative ${
            activeTab === tab.id ? 'text-white' : 'text-white/50'
          }`}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.label}</span>
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6366F1] to-[#14B8A6]" />
          )}
        </button>
      ))}
    </div>
  );
}
