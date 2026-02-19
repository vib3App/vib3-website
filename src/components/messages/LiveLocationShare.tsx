'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { websocketService } from '@/services/websocket';
import { logger } from '@/utils/logger';

interface LiveLocationShareProps {
  isSharing: boolean;
  onStartSharing: (durationMinutes: number) => void;
  onStopSharing: () => void;
  conversationId?: string;
  /** Current shared location from the other user */
  peerLocation?: { lat: number; lng: number; updatedAt: number } | null;
  peerUsername?: string;
}

const DURATION_OPTIONS = [
  { minutes: 15, label: '15 min' },
  { minutes: 60, label: '1 hour' },
  { minutes: 480, label: '8 hours' },
];

const LOCATION_UPDATE_INTERVAL = 10000; // 10 seconds

export function LiveLocationShare({
  isSharing, onStartSharing, onStopSharing, conversationId, peerLocation, peerUsername,
}: LiveLocationShareProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Gap #55: Actually emit location updates via WebSocket when sharing
  useEffect(() => {
    if (!isSharing || !conversationId) {
      // Stop watching when sharing ends
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start watching position and emitting via WebSocket
    const emitLocation = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      websocketService.send('location:share', {
        conversationId,
        lat: latitude,
        lng: longitude,
        accuracy,
        timestamp: Date.now(),
      });
      logger.debug('Emitted live location:', { latitude, longitude });
    };

    // Use watchPosition for continuous updates
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        emitLocation,
        (err) => logger.error('Geolocation error during sharing:', err.message),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );

      // Also send on an interval as a heartbeat
      intervalRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          emitLocation,
          () => {}, // Silently ignore interval errors
          { enableHighAccuracy: false, maximumAge: 10000, timeout: 5000 }
        );
      }, LOCATION_UPDATE_INTERVAL);
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Notify stop
      websocketService.send('location:stop', { conversationId });
    };
  }, [isSharing, conversationId]);

  // Track remaining time
  useEffect(() => {
    if (!isSharing) { setTimeRemaining(null); return; }
    const tick = () => {
      if (!endTimeRef.current) return;
      const remaining = Math.max(0, endTimeRef.current - Date.now());
      const mins = Math.ceil(remaining / 60000);
      setTimeRemaining(mins > 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`);
    };
    const id = setInterval(tick, 30000);
    tick();
    return () => clearInterval(id);
  }, [isSharing]);

  const handleStart = useCallback((minutes: number) => {
    endTimeRef.current = Date.now() + minutes * 60000;
    onStartSharing(minutes);
    setShowPicker(false);
  }, [onStartSharing]);

  return (
    <div className="space-y-2">
      {/* Share button */}
      {!isSharing ? (
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-2 px-3 py-2 glass rounded-xl text-white text-sm hover:bg-white/10 transition w-full"
        >
          <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Share Live Location
        </button>
      ) : (
        <div className="flex items-center justify-between px-3 py-2 bg-teal-500/20 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
            <span className="text-teal-400 text-sm">Sharing location</span>
            {timeRemaining && <span className="text-teal-400/60 text-xs">{timeRemaining} left</span>}
          </div>
          <button onClick={onStopSharing} className="text-red-400 text-xs hover:text-red-300">Stop</button>
        </div>
      )}

      {/* Duration picker */}
      {showPicker && (
        <div className="flex gap-2">
          {DURATION_OPTIONS.map(opt => (
            <button
              key={opt.minutes}
              onClick={() => handleStart(opt.minutes)}
              className="flex-1 px-3 py-2 glass text-white text-sm rounded-lg hover:bg-white/10 transition"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Peer's shared location */}
      {peerLocation && (
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 rounded-xl">
          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="text-purple-300 text-sm">
            {peerUsername} is sharing location
          </span>
          <a
            href={`https://maps.google.com/?q=${peerLocation.lat},${peerLocation.lng}`}
            target="_blank" rel="noopener noreferrer"
            className="text-purple-400 text-xs underline ml-auto"
          >
            Open Map
          </a>
        </div>
      )}
    </div>
  );
}
