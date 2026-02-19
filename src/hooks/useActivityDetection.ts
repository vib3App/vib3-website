'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { logger } from '@/utils/logger';

export type ActivityStatus = 'stationary' | 'walking' | 'driving';

interface ActivityDetectionOptions {
  enabled: boolean;
  onActivityChange?: (activity: ActivityStatus) => void;
}

/**
 * Gap #55: Activity Detection
 *
 * Uses Device Motion API (if available) to detect activity,
 * with fallback to GPS speed:
 * - < 1 m/s = stationary
 * - 1-3 m/s = walking
 * - > 10 m/s = driving
 */
export function useActivityDetection({ enabled, onActivityChange }: ActivityDetectionOptions) {
  const [activity, setActivity] = useState<ActivityStatus>('stationary');
  const [speed, setSpeed] = useState(0);
  const watchIdRef = useRef<number | null>(null);
  const motionSamplesRef = useRef<number[]>([]);
  const motionListenerRef = useRef<((e: DeviceMotionEvent) => void) | null>(null);

  const classifyFromSpeed = useCallback((speedMps: number): ActivityStatus => {
    if (speedMps < 1) return 'stationary';
    if (speedMps <= 3) return 'walking';
    return 'driving'; // > 10 m/s threshold relaxed to catch biking/driving
  }, []);

  const classifyFromMotion = useCallback((magnitude: number): ActivityStatus => {
    // Acceleration magnitude thresholds (m/s^2)
    if (magnitude < 1.5) return 'stationary';
    if (magnitude < 5) return 'walking';
    return 'driving';
  }, []);

  const updateActivity = useCallback((newActivity: ActivityStatus) => {
    setActivity((prev) => {
      if (prev !== newActivity) {
        onActivityChange?.(newActivity);
        return newActivity;
      }
      return prev;
    });
  }, [onActivityChange]);

  // Try Device Motion API first
  useEffect(() => {
    if (!enabled) return;

    const hasDeviceMotion = typeof DeviceMotionEvent !== 'undefined';
    if (!hasDeviceMotion) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.x == null || acc.y == null || acc.z == null) return;

      // Remove gravity (~9.8) to get user acceleration magnitude
      const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2) - 9.8;
      const absMag = Math.abs(magnitude);

      motionSamplesRef.current.push(absMag);
      if (motionSamplesRef.current.length > 20) {
        motionSamplesRef.current.shift();
      }

      // Average over samples for stability
      const avg = motionSamplesRef.current.reduce((a, b) => a + b, 0) / motionSamplesRef.current.length;
      updateActivity(classifyFromMotion(avg));
    };

    motionListenerRef.current = handleMotion;
    window.addEventListener('devicemotion', handleMotion);

    return () => {
      if (motionListenerRef.current) {
        window.removeEventListener('devicemotion', motionListenerRef.current);
        motionListenerRef.current = null;
      }
      motionSamplesRef.current = [];
    };
  }, [enabled, classifyFromMotion, updateActivity]);

  // Fallback: GPS speed
  useEffect(() => {
    if (!enabled || !navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const gpsSpeed = pos.coords.speed ?? 0;
        setSpeed(gpsSpeed);

        // Only use GPS classification if we don't have device motion data
        if (motionSamplesRef.current.length < 5) {
          updateActivity(classifyFromSpeed(gpsSpeed));
        }
      },
      (err) => logger.error('Activity detection GPS error:', err.message),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, classifyFromSpeed, updateActivity]);

  return { activity, speed };
}
