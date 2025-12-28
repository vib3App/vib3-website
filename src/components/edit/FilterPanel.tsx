'use client';

import { EDITOR_FILTERS } from '@/hooks/useVideoEditor';

interface FilterPanelProps {
  selectedFilter: number;
  onSelect: (index: number) => void;
}

export function FilterPanel({ selectedFilter, onSelect }: FilterPanelProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {EDITOR_FILTERS.map((filter, index) => (
        <button
          key={filter.name}
          onClick={() => onSelect(index)}
          className={`flex-shrink-0 text-center ${selectedFilter === index ? 'opacity-100' : 'opacity-60'}`}
        >
          <div className={`w-16 h-20 rounded-lg overflow-hidden mb-1 ${selectedFilter === index ? 'ring-2 ring-[#6366F1]' : ''}`}>
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" style={{ filter: filter.filter }} />
          </div>
          <span className="text-white text-xs">{filter.name}</span>
        </button>
      ))}
    </div>
  );
}
