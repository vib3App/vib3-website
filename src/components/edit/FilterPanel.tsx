'use client';

import { EDITOR_FILTERS } from '@/hooks/useVideoEditor';
import { scaleCssFilter } from '@/utils/cssFilter';

interface FilterPanelProps {
  selectedFilter: number;
  onSelect: (index: number) => void;
  intensity: number;
  onIntensityChange: (value: number) => void;
}

export function FilterPanel({ selectedFilter, onSelect, intensity, onIntensityChange }: FilterPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {EDITOR_FILTERS.map((filter, index) => (
          <button
            key={filter.name}
            onClick={() => onSelect(index)}
            className={`flex-shrink-0 text-center ${selectedFilter === index ? 'opacity-100' : 'opacity-60'}`}
          >
            <div className={`w-16 h-20 rounded-lg overflow-hidden mb-1 ${selectedFilter === index ? 'ring-2 ring-purple-500' : ''}`}>
              <div
                className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500"
                style={{ filter: index === selectedFilter ? scaleCssFilter(filter.filter, intensity) : filter.filter }}
              />
            </div>
            <span className="text-white text-xs">{filter.name}</span>
          </button>
        ))}
      </div>

      {/* Intensity — only meaningful for an actual filter (not Normal) */}
      {selectedFilter !== 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/50 text-sm">Intensity</span>
            <span className="text-white font-mono text-sm">{Math.round(intensity * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={intensity}
            onChange={e => onIntensityChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      )}
    </div>
  );
}
