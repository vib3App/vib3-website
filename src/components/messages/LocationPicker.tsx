'use client';

import { useState, useCallback } from 'react';

interface LocationPickerProps {
  onSend: (lat: number, lng: number, address?: string) => void;
  onClose: () => void;
}

export function LocationPicker({ onSend, onClose }: LocationPickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let address: string | undefined;

        // Reverse geocode
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await resp.json();
          if (data.display_name) {
            address = data.display_name.split(',').slice(0, 3).join(',').trim();
          }
        } catch {
          // Geocoding failed, use coords only
        }

        setLocation({ lat: latitude, lng: longitude, address });
        setIsLoading(false);
      },
      (err) => {
        setError(err.message || 'Unable to get your location');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleConfirm = useCallback(() => {
    if (location) {
      onSend(location.lat, location.lng, location.address);
    }
  }, [location, onSend]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass-heavy rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-white font-medium text-sm">Share Location</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {!location && !isLoading && !error && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 glass rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-white/50 text-sm text-center">
                Share your current location in this conversation
              </p>
              <button
                onClick={getCurrentLocation}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full text-white text-sm font-medium hover:from-purple-600 hover:to-teal-600 transition-colors"
              >
                Get My Location
              </button>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-8 h-8 border-2 border-white/30 border-t-teal-400 rounded-full animate-spin" />
              <p className="text-white/50 text-sm">Getting your location...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-red-400 text-sm text-center">{error}</p>
              <button
                onClick={getCurrentLocation}
                className="px-4 py-2 glass rounded-full text-white text-sm hover:bg-white/10"
              >
                Try Again
              </button>
            </div>
          )}

          {location && (
            <div className="space-y-4">
              <div className="glass rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium">
                      {location.address || 'Current Location'}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={getCurrentLocation}
                  className="flex-1 py-2.5 glass rounded-full text-white/70 text-sm hover:bg-white/10 transition-colors"
                >
                  Refresh
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full text-white text-sm font-medium hover:from-purple-600 hover:to-teal-600 transition-colors"
                >
                  Send Location
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
