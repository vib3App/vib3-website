'use client';

import { useEffect, useRef, useState } from 'react';

export type ActivityType = 'stationary' | 'walking' | 'biking' | 'driving';

interface ActivityDetectorProps {
  onActivityChange: (activity: ActivityType) => void;
  enabled: boolean;
}

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  stationary: '🧍',
  walking: '🚶',
  biking: '🚴',
  driving: '🚗',
};

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  stationary: 'Stationary',
  walking: 'Walking',
  biking: 'Biking',
  driving: 'Driving',
};

function inferActivity(speedMps: number): ActivityType {
  if (speedMps < 0.5) return 'stationary';
  if (speedMps < 2.5) return 'walking'; // ~9 km/h
  if (speedMps < 8) return 'biking';    // ~29 km/h
  return 'driving';
}

export function ActivityDetector({ onActivityChange, enabled }: ActivityDetectorProps) {
  const [activity, setActivity] = useState<ActivityType>('stationary');
  const [speed, setSpeed] = useState(0);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const spd = pos.coords.speed ?? 0;
        setSpeed(spd);
        const detected = inferActivity(spd);
        setActivity(prev => {
          if (prev !== detected) {
            onActivityChange(detected);
          }
          return detected;
        });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [enabled, onActivityChange]);

  if (!enabled) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full">
      <span className="text-lg">{ACTIVITY_ICONS[activity]}</span>
      <span className="text-white text-sm font-medium">{ACTIVITY_LABELS[activity]}</span>
      <span className="text-white/40 text-xs">{(speed * 3.6).toFixed(1)} km/h</span>
    </div>
  );
}
