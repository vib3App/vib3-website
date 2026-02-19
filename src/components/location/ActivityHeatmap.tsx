'use client';

import { useMemo } from 'react';
import type { HeatmapPoint } from '@/types/location';

interface ActivityHeatmapProps {
  points: HeatmapPoint[];
  myLocation: { lat: number; lng: number } | null;
  visible: boolean;
}

function getPosition(
  lat: number, lng: number,
  center: { lat: number; lng: number },
  zoom: number
) {
  const scale = zoom * 1000;
  const dx = (lng - center.lng) * scale;
  const dy = (center.lat - lat) * scale;
  return {
    x: Math.max(-10, Math.min(110, 50 + dx)),
    y: Math.max(-10, Math.min(110, 50 + dy)),
  };
}

function intensityToColor(intensity: number): string {
  if (intensity > 0.7) return 'rgba(239, 68, 68, 0.5)';  // red
  if (intensity > 0.5) return 'rgba(249, 115, 22, 0.45)'; // orange
  if (intensity > 0.3) return 'rgba(234, 179, 8, 0.4)';   // yellow
  return 'rgba(34, 197, 94, 0.3)';                         // green
}

export function ActivityHeatmap({ points, myLocation, visible }: ActivityHeatmapProps) {
  const rendered = useMemo(() => {
    if (!myLocation || points.length === 0) return [];
    return points.map((point, i) => {
      const pos = getPosition(point.latitude, point.longitude, myLocation, 1);
      const size = 20 + point.intensity * 40;
      const color = intensityToColor(point.intensity);

      return (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none transition-opacity duration-500"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            width: `${size}px`,
            height: `${size}px`,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${color}, transparent 70%)`,
            filter: 'blur(8px)',
          }}
        />
      );
    });
  }, [points, myLocation]);

  if (!visible || !myLocation || points.length === 0) return null;

  return (
    <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
      {rendered}
    </div>
  );
}
