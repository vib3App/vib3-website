'use client';

import { useState, useCallback } from 'react';

interface LocationPickerProps {
  location: string | null;
  onLocationChange: (location: string | null) => void;
}

export function LocationPicker({ location, onLocationChange }: LocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showInput, setShowInput] = useState(false);

  const detectLocation = useCallback(async () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });
      const { latitude, longitude } = pos.coords;
      // Reverse geocode via Nominatim (OSM)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=16`
      );
      const data = await res.json();
      const name = data.address?.city || data.address?.town || data.address?.village || data.display_name?.split(',')[0] || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      onLocationChange(name);
    } catch {
      onLocationChange(null);
    } finally {
      setIsLocating(false);
    }
  }, [onLocationChange]);

  return (
    <div>
      <label className="block text-white font-medium mb-2">Location</label>
      {location ? (
        <div className="flex items-center gap-2 p-3 glass-card rounded-xl">
          <svg className="w-5 h-5 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-white text-sm flex-1 truncate">{location}</span>
          <button onClick={() => onLocationChange(null)} className="text-white/40 hover:text-red-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={detectLocation}
            disabled={isLocating}
            className="flex-1 py-3 glass text-white/60 rounded-xl hover:bg-white/10 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {isLocating ? 'Detecting...' : 'Auto-detect'}
          </button>
          <button
            onClick={() => setShowInput(!showInput)}
            className="flex-1 py-3 glass text-white/60 rounded-xl hover:bg-white/10 text-sm"
          >
            Enter manually
          </button>
        </div>
      )}
      {showInput && !location && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && manualInput.trim()) { onLocationChange(manualInput.trim()); setShowInput(false); setManualInput(''); } }}
            placeholder="City, country..."
            className="flex-1 glass text-white px-4 py-2 rounded-xl outline-none placeholder:text-white/40 text-sm"
            autoFocus
          />
          <button
            onClick={() => { if (manualInput.trim()) { onLocationChange(manualInput.trim()); setShowInput(false); setManualInput(''); } }}
            className="px-4 py-2 glass text-white rounded-xl hover:bg-white/10 text-sm"
          >
            Set
          </button>
        </div>
      )}
    </div>
  );
}
