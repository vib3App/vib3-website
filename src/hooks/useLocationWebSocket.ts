'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { websocketService } from '@/services/websocket';
import type { FriendLocation } from '@/types/location';
import { logger } from '@/utils/logger';

interface LocationWebSocketOptions {
  enabled: boolean;
  onFriendUpdate: (friend: FriendLocation) => void;
  onFriendDisconnect?: (userId: string) => void;
  myLocation: { lat: number; lng: number } | null;
  ghostMode: boolean;
}

interface LocationWSStatus {
  isConnected: boolean;
  lastUpdateTime: string | null;
  updateCount: number;
}

const EMIT_INTERVAL_MS = 15000; // Max 1 update per 15 seconds
const MIN_MOVEMENT_DEG = 0.00005; // ~5m threshold

/**
 * Hook for real-time bidirectional location sharing via WebSocket.
 *
 * Gap #51 enhancements:
 * - Uses navigator.geolocation.watchPosition for continuous GPS updates
 * - Throttles outgoing location:update to max 1 per 15 seconds
 * - Sends accuracy data alongside lat/lng
 * - Listens for both 'location:update' and 'location:friend_update'
 */
export function useLocationWebSocket({
  enabled,
  onFriendUpdate,
  onFriendDisconnect,
  myLocation,
  ghostMode,
}: LocationWebSocketOptions): LocationWSStatus {
  const [status, setStatus] = useState<LocationWSStatus>({
    isConnected: false,
    lastUpdateTime: null,
    updateCount: 0,
  });

  const emitIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastEmittedRef = useRef<{ lat: number; lng: number; time: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const latestPositionRef = useRef<{ lat: number; lng: number; accuracy: number } | null>(null);

  // Incoming friend location handler (shared between both event channels)
  const handleIncoming = useCallback((data: unknown) => {
    const loc = data as FriendLocation & { type?: string };

    // Handle disconnect events
    if (loc.type === 'disconnect' && onFriendDisconnect) {
      onFriendDisconnect(loc.userId);
      return;
    }

    // Validate required fields
    if (loc.userId && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
      onFriendUpdate(loc);
      setStatus(prev => ({
        ...prev,
        lastUpdateTime: new Date().toISOString(),
        updateCount: prev.updateCount + 1,
      }));
    }
  }, [onFriendUpdate, onFriendDisconnect]);

  // Listen for incoming friend location updates on both channels
  useEffect(() => {
    if (!enabled) return;

    const unsub1 = websocketService.onLocationUpdate(handleIncoming);
    const unsub2 = websocketService.on('location:friend_update', handleIncoming);

    return () => { unsub1(); unsub2(); };
  }, [enabled, handleIncoming]);

  // Track connection state
  useEffect(() => {
    if (!enabled) {
      setStatus(prev => ({ ...prev, isConnected: false }));
      return;
    }

    const unsub = websocketService.onConnectionChange((connected) => {
      setStatus(prev => ({ ...prev, isConnected: connected }));
    });

    setStatus(prev => ({ ...prev, isConnected: websocketService.isConnected() }));
    return unsub;
  }, [enabled]);

  // Gap #51: Use watchPosition for continuous GPS updates
  useEffect(() => {
    if (!enabled || ghostMode || !navigator.geolocation) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        latestPositionRef.current = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
      },
      (err) => logger.error('Geolocation watch error:', err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, ghostMode]);

  // Emit our location (throttled to EMIT_INTERVAL_MS)
  const emitLocation = useCallback(() => {
    const pos = latestPositionRef.current || (myLocation ? { lat: myLocation.lat, lng: myLocation.lng, accuracy: 0 } : null);
    if (!pos || ghostMode || !enabled) return;

    // Skip if we haven't moved enough since last emit
    if (lastEmittedRef.current) {
      const dLat = Math.abs(pos.lat - lastEmittedRef.current.lat);
      const dLng = Math.abs(pos.lng - lastEmittedRef.current.lng);
      const timeDiff = Date.now() - lastEmittedRef.current.time;
      if (dLat < MIN_MOVEMENT_DEG && dLng < MIN_MOVEMENT_DEG && timeDiff < EMIT_INTERVAL_MS) return;
    }

    websocketService.send('location:update', {
      latitude: pos.lat,
      longitude: pos.lng,
      accuracy: pos.accuracy,
      timestamp: new Date().toISOString(),
    });
    lastEmittedRef.current = { lat: pos.lat, lng: pos.lng, time: Date.now() };
  }, [myLocation, ghostMode, enabled]);

  useEffect(() => {
    if (!enabled || ghostMode) {
      if (emitIntervalRef.current) {
        clearInterval(emitIntervalRef.current);
        emitIntervalRef.current = null;
      }
      return;
    }

    // Emit immediately, then on interval
    emitLocation();
    emitIntervalRef.current = setInterval(emitLocation, EMIT_INTERVAL_MS);

    return () => {
      if (emitIntervalRef.current) {
        clearInterval(emitIntervalRef.current);
        emitIntervalRef.current = null;
      }
    };
  }, [enabled, ghostMode, emitLocation]);

  useEffect(() => {
    if (enabled) {
      logger.info(`Location WebSocket: connected=${status.isConnected}, updates=${status.updateCount}`);
    }
  }, [enabled, status.isConnected, status.updateCount]);

  return status;
}
