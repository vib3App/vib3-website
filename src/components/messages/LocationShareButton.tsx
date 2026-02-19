'use client';

import { useState, useCallback } from 'react';

interface LocationShareButtonProps {
  onSendLocation: (lat: number, lng: number, address?: string) => void;
}

/** Button that gets current location and sends it as a message */
export function LocationShareButton({ onSendLocation }: LocationShareButtonProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleClick = useCallback(async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let address: string | undefined;

        // Try reverse geocoding
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await resp.json();
          if (data.display_name) {
            // Shorten the address
            const parts = data.display_name.split(',').slice(0, 3);
            address = parts.join(',').trim();
          }
        } catch {
          // Geocoding failed, use coords only
        }

        onSendLocation(latitude, longitude, address);
        setIsGettingLocation(false);
      },
      () => {
        setIsGettingLocation(false);
        alert('Unable to get your location. Please check permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onSendLocation]);

  return (
    <button
      onClick={handleClick}
      disabled={isGettingLocation}
      className="text-white/50 hover:text-white disabled:opacity-30 transition-colors"
      title="Send location"
    >
      {isGettingLocation ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
    </button>
  );
}
