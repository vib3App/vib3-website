'use client';

import type { TicketmasterEvent } from '@/types/location';

interface EventMarkersProps {
  events: TicketmasterEvent[];
  myLocation: { lat: number; lng: number } | null;
  visible: boolean;
  onSelectEvent: (event: TicketmasterEvent) => void;
}

const EVENT_TYPE_ICONS: Record<string, string> = {
  music: '🎵', comedy: '😂', festival: '🎉', conference: '💼',
  art: '🎨', sports: '⚽', theater: '🎭', family: '👨‍👩‍👧',
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

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function EventMarkers({ events, myLocation, visible, onSelectEvent }: EventMarkersProps) {
  if (!visible || !myLocation || events.length === 0) return null;

  return (
    <div className="absolute inset-0 z-[8] pointer-events-none overflow-hidden">
      {events.map(event => {
        const pos = getPosition(event.venue.latitude, event.venue.longitude, myLocation);
        const icon = EVENT_TYPE_ICONS[event.type] || '🎫';

        return (
          <div
            key={event.id}
            className="absolute -translate-x-1/2 -translate-y-full pointer-events-auto cursor-pointer z-[8]"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            onClick={() => onSelectEvent(event)}
          >
            <div className="flex flex-col items-center group">
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-teal-500/30 backdrop-blur-sm border border-teal-400/30 flex items-center justify-center text-lg group-hover:scale-110 transition-transform shadow-lg">
                  {icon}
                </div>
                {/* Date badge */}
                <div className="absolute -bottom-1 -right-1 bg-teal-500 text-white text-[8px] font-bold px-1 rounded-sm">
                  {formatShortDate(event.startDate)}
                </div>
              </div>
              <span className="text-white/80 text-[10px] mt-1 drop-shadow-lg max-w-[80px] truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {event.name}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
