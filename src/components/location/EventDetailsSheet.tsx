'use client';

import type { TicketmasterEvent } from '@/types/location';

interface EventDetailsSheetProps {
  event: TicketmasterEvent | null;
  onClose: () => void;
}

const EVENT_TYPE_ICONS: Record<string, string> = {
  music: '🎵', comedy: '😂', festival: '🎉', conference: '💼',
  art: '🎨', sports: '⚽', theater: '🎭', family: '👨‍👩‍👧',
};

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function EventDetailsSheet({ event, onClose }: EventDetailsSheetProps) {
  if (!event) return null;

  const icon = EVENT_TYPE_ICONS[event.type] || '🎫';

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 md:left-auto md:right-4 md:bottom-4 md:w-96">
        <div className="glass-heavy rounded-t-2xl md:rounded-2xl border border-white/10 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center text-2xl">
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-lg truncate">{event.name}</h3>
                <p className="text-white/40 text-sm">{event.category || event.type}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white mt-1 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Details */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-white/60 text-sm">{formatEventDate(event.startDate)}</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <div>
                <span className="text-white/60 text-sm">{event.venue.name}</span>
                {event.venue.address && (
                  <p className="text-white/30 text-xs">{event.venue.address}{event.venue.city ? `, ${event.venue.city}` : ''}</p>
                )}
              </div>
            </div>

            {event.priceRange && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white/60 text-sm">
                  ${event.priceRange.min} - ${event.priceRange.max} {event.priceRange.currency}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 p-4 pt-0">
            <button
              onClick={() => {
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${event.venue.latitude},${event.venue.longitude}`,
                  '_blank'
                );
              }}
              className="flex-1 py-2.5 glass text-white text-sm font-medium rounded-xl hover:bg-white/10 transition"
            >
              Directions
            </button>
            {event.url && event.url !== '#' ? (
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-teal-500 text-white text-sm font-medium rounded-xl text-center"
              >
                Get Tickets
              </a>
            ) : (
              <button className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-teal-500 text-white text-sm font-medium rounded-xl">
                Get Tickets
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
