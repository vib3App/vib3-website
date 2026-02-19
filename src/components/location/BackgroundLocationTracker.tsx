'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface BackgroundLocationTrackerProps {
  enabled: boolean;
  onLocationUpdate: (lat: number, lng: number) => void;
  intervalMs?: number;
}

export function BackgroundLocationTracker({
  enabled,
  onLocationUpdate,
  intervalMs = 30000,
}: BackgroundLocationTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityRef = useRef(true);

  const fetchPosition = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => onLocationUpdate(pos.coords.latitude, pos.coords.longitude),
      () => {},
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 }
    );
  }, [onLocationUpdate]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsTracking(false);
      return;
    }

    // Track even when tab is not focused using setInterval
    // (navigator.geolocation.watchPosition pauses in background on most browsers)
    fetchPosition();
    intervalRef.current = setInterval(fetchPosition, intervalMs);
    setIsTracking(true);

    // Also listen for visibility changes to immediately update on tab focus
    const handleVisibility = () => {
      visibilityRef.current = !document.hidden;
      if (!document.hidden) fetchPosition();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
      setIsTracking(false);
    };
  }, [enabled, intervalMs, fetchPosition]);

  if (!enabled || !isTracking) return null;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 rounded-full">
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      <span className="text-green-400 text-xs">Location active</span>
    </div>
  );
}
