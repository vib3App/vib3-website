'use client';

import type { NearbyPlace } from '@/types/location';
import { formatDistance } from '@/utils/distance';

interface PlaceDetailsSheetProps {
  place: NearbyPlace | null;
  onClose: () => void;
  onSave: (place: NearbyPlace) => void;
  onShare: (place: NearbyPlace) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  Cafe: '☕', Restaurant: '🍽️', Park: '🌳', Gym: '💪',
  Grocery: '🛒', Bookstore: '📚', Library: '📖', Transit: '🚇',
  Bar: '🍸', Shopping: '🛍️', Hospital: '🏥', School: '🎓',
};

export function PlaceDetailsSheet({ place, onClose, onSave, onShare }: PlaceDetailsSheetProps) {
  if (!place) return null;

  const icon = CATEGORY_ICONS[place.category] || '📍';

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 md:left-auto md:right-4 md:bottom-4 md:w-96">
        <div className="glass-heavy rounded-t-2xl md:rounded-2xl border border-white/10 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl">
                {icon}
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{place.name}</h3>
                <p className="text-white/40 text-sm">{place.category}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white mt-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Details */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="text-white/60 text-sm">{formatDistance(place.distance)} away</span>
            </div>

            {place.rating && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={`text-sm ${star <= Math.floor(place.rating!) ? 'text-yellow-400' : 'text-white/20'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-white/60 text-sm">{place.rating}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-white/40 text-xs">
              <span>Lat: {place.latitude.toFixed(4)}</span>
              <span>Lng: {place.longitude.toFixed(4)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 p-4 pt-0">
            <button
              onClick={() => onSave(place)}
              className="flex-1 py-2.5 glass text-white text-sm font-medium rounded-xl hover:bg-white/10 transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Save
            </button>
            <button
              onClick={() => onShare(place)}
              className="flex-1 py-2.5 glass text-white text-sm font-medium rounded-xl hover:bg-white/10 transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
            <button
              onClick={() => {
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`,
                  '_blank'
                );
              }}
              className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-teal-500 text-white text-sm font-medium rounded-xl transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Directions
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
