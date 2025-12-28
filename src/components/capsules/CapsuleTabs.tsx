'use client';

import {
  ClockIcon,
  LockOpenIcon,
  CalendarIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import type { CapsuleTab } from '@/hooks/useCapsules';

interface Tab {
  id: CapsuleTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: Tab[] = [
  { id: 'upcoming', label: 'Upcoming', icon: ClockIcon },
  { id: 'unlocked', label: 'Unlocked', icon: LockOpenIcon },
  { id: 'my', label: 'My Capsules', icon: CalendarIcon },
  { id: 'received', label: 'Received', icon: LockClosedIcon },
];

interface CapsuleTabsProps {
  activeTab: CapsuleTab;
  onTabChange: (tab: CapsuleTab) => void;
}

export function CapsuleTabs({ activeTab, onTabChange }: CapsuleTabsProps) {
  return (
    <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
      {TABS.map(t => {
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
              activeTab === t.id
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
