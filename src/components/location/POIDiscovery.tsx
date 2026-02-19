'use client';

import { useState, useMemo } from 'react';
import type { NearbyPlace } from '@/types/location';
import { formatDistance } from '@/utils/distance';

interface POIDiscoveryProps {
  places: NearbyPlace[];
  onSelectPlace: (place: NearbyPlace) => void;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  Cafe: '☕', Restaurant: '🍽️', Park: '🌳', Gym: '💪',
  Grocery: '🛒', Bookstore: '📚', Library: '📖', Transit: '🚇',
  Bar: '🍸', Shopping: '🛍️', Hospital: '🏥', School: '🎓',
};

const CATEGORY_FILTERS = ['All', 'Cafe', 'Restaurant', 'Park', 'Gym', 'Grocery', 'Transit', 'Other'];

export function POIDiscovery({ places, onSelectPlace, isOpen, onClose }: POIDiscoveryProps) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = places;
    if (filter !== 'All') {
      result = result.filter(p =>
        filter === 'Other'
          ? !CATEGORY_FILTERS.includes(p.category)
          : p.category === filter
      );
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    return result.sort((a, b) => a.distance - b.distance);
  }, [places, filter, search]);

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-4 left-4 z-40 w-80 max-h-[60vh] glass-heavy rounded-2xl border border-white/10 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <h3 className="text-white font-semibold text-sm">Nearby Places</h3>
        <button onClick={onClose} className="text-white/50 hover:text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-2 border-b border-white/10">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search places..."
          className="w-full glass text-white text-sm px-3 py-1.5 rounded-lg outline-none placeholder:text-white/30"
        />
      </div>

      <div className="flex gap-1 p-2 overflow-x-auto border-b border-white/10 no-scrollbar">
        {CATEGORY_FILTERS.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition ${
              filter === cat ? 'bg-purple-500 text-white' : 'glass text-white/50 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.map(place => (
          <button
            key={place.id}
            onClick={() => onSelectPlace(place)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center text-lg flex-shrink-0">
              {CATEGORY_ICONS[place.category] || '📍'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{place.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-white/30 text-xs">{place.category}</span>
                {place.rating && (
                  <span className="text-yellow-400 text-xs">{'★'} {place.rating}</span>
                )}
              </div>
            </div>
            <span className="text-white/30 text-xs flex-shrink-0">{formatDistance(place.distance)}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-white/30 text-sm text-center py-4">No places found</p>
        )}
      </div>
    </div>
  );
}
