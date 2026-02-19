'use client';

import type { NearbyPlace } from '@/types/location';

interface POIMarkersProps {
  places: NearbyPlace[];
  myLocation: { lat: number; lng: number } | null;
  visible: boolean;
  onSelectPlace: (place: NearbyPlace) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  Cafe: '☕', Restaurant: '🍽️', Park: '🌳', Gym: '💪',
  Grocery: '🛒', Bookstore: '📚', Library: '📖', Transit: '🚇',
  Bar: '🍸', Shopping: '🛍️', Hospital: '🏥', School: '🎓',
};

function getPosition(
  lat: number, lng: number,
  center: { lat: number; lng: number }
) {
  const dx = (lng - center.lng) * 1000;
  const dy = (center.lat - lat) * 1000;
  return {
    x: Math.max(5, Math.min(95, 50 + dx)),
    y: Math.max(5, Math.min(95, 50 + dy)),
  };
}

export function POIMarkers({ places, myLocation, visible, onSelectPlace }: POIMarkersProps) {
  if (!visible || !myLocation || places.length === 0) return null;

  return (
    <div className="absolute inset-0 z-[6] pointer-events-none overflow-hidden">
      {places.map(place => {
        const pos = getPosition(place.latitude, place.longitude, myLocation);
        const icon = CATEGORY_ICONS[place.category] || '📍';

        return (
          <div
            key={place.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            onClick={() => onSelectPlace(place)}
          >
            <div className="group flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-sm group-hover:scale-125 transition-transform shadow">
                {icon}
              </div>
              <span className="text-white/60 text-[9px] mt-0.5 drop-shadow-lg max-w-[60px] truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {place.name}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
