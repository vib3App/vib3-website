'use client';

import type { SearchFilters } from '@/services/api';

interface SearchFiltersPanelProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
}

export function SearchFiltersPanel({ filters, onFilterChange }: SearchFiltersPanelProps) {
  return (
    <div className="p-4 border-b border-white/5 bg-[#0A0E1A]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-white/50 text-xs mb-2">Date Range</label>
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange({ dateRange: e.target.value as SearchFilters['dateRange'] })}
            className="w-full bg-[#1A1F2E] text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[#6366F1]"
          >
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="year">This year</option>
          </select>
        </div>
        <div>
          <label className="block text-white/50 text-xs mb-2">Duration</label>
          <select
            value={filters.duration}
            onChange={(e) => onFilterChange({ duration: e.target.value as SearchFilters['duration'] })}
            className="w-full bg-[#1A1F2E] text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[#6366F1]"
          >
            <option value="all">Any duration</option>
            <option value="short">Under 30s</option>
            <option value="medium">30s - 3min</option>
            <option value="long">Over 3min</option>
          </select>
        </div>
        <div>
          <label className="block text-white/50 text-xs mb-2">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as SearchFilters['sortBy'] })}
            className="w-full bg-[#1A1F2E] text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[#6366F1]"
          >
            <option value="relevance">Relevance</option>
            <option value="date">Most recent</option>
            <option value="views">Most viewed</option>
            <option value="likes">Most liked</option>
          </select>
        </div>
      </div>
    </div>
  );
}
