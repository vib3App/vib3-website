'use client';

import type { FriendLocation } from '@/types/location';
import { calculateDistanceMeters, formatDistance, calculateBearing } from '@/utils/distance';

interface DistanceOverlayProps {
  friends: FriendLocation[];
  myLocation: { lat: number; lng: number } | null;
  visible: boolean;
}

function bearingToDirection(bearing: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return dirs[index];
}

function getPosition(
  lat: number, lng: number,
  center: { lat: number; lng: number }
) {
  const dx = (lng - center.lng) * 1000;
  const dy = (center.lat - lat) * 1000;
  return {
    x: Math.max(5, Math.min(95, 50 + dx)),
    y: Math.max(5, Math.min(95, 50 + dy)),
  };
}

export function DistanceOverlay({ friends, myLocation, visible }: DistanceOverlayProps) {
  if (!visible || !myLocation) return null;

  return (
    <div className="absolute inset-0 z-[15] pointer-events-none overflow-hidden">
      {friends.map(friend => {
        const distance = calculateDistanceMeters(
          myLocation.lat, myLocation.lng,
          friend.latitude, friend.longitude
        );
        const bearing = calculateBearing(
          myLocation.lat, myLocation.lng,
          friend.latitude, friend.longitude
        );
        const direction = bearingToDirection(bearing);
        const pos = getPosition(friend.latitude, friend.longitude, myLocation);

        return (
          <div
            key={`dist-${friend.userId}`}
            className="absolute transform -translate-x-1/2"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, marginTop: '-28px' }}
          >
            <div className="bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 whitespace-nowrap">
              <span className="text-white/80 text-[10px] font-mono">{formatDistance(distance)}</span>
              <span className="text-purple-400 text-[10px]">{direction}</span>
            </div>
          </div>
        );
      })}

      {/* Distance lines from center to each friend */}
      <svg className="absolute inset-0 w-full h-full">
        {friends.map(friend => {
          const pos = getPosition(friend.latitude, friend.longitude, myLocation);
          return (
            <line
              key={`line-${friend.userId}`}
              x1="50%"
              y1="50%"
              x2={`${pos.x}%`}
              y2={`${pos.y}%`}
              stroke="rgba(168, 85, 247, 0.15)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          );
        })}
      </svg>
    </div>
  );
}
