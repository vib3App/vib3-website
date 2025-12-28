'use client';

import {
  ChartBarIcon,
  VideoCameraIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export type CreatorTab = 'overview' | 'content' | 'monetization' | 'audience' | 'settings';

const tabs: { id: CreatorTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: ChartBarIcon },
  { id: 'content', label: 'Content', icon: VideoCameraIcon },
  { id: 'monetization', label: 'Monetization', icon: CurrencyDollarIcon },
  { id: 'audience', label: 'Audience', icon: UserGroupIcon },
  { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
];

interface CreatorTabsProps {
  activeTab: CreatorTab;
  onTabChange: (tab: CreatorTab) => void;
}

export function CreatorTabs({ activeTab, onTabChange }: CreatorTabsProps) {
  return (
    <nav className="border-b border-white/10 overflow-x-auto">
      <div className="max-w-6xl mx-auto px-4 flex gap-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-pink-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
