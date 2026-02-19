'use client';

import type { FriendLocation, LocationSettings, NearbyPlace, TicketmasterEvent, HeatmapPoint, MapCameraState } from '@/types/location';
import { AnimatedFriendPin } from './AnimatedFriendPin';
import { ActivityHeatmap } from './ActivityHeatmap';
import { DistanceOverlay } from './DistanceOverlay';
import { EventMarkers } from './EventMarkers';
import { POIMarkers } from './POIMarkers';

interface LocationMapProps {
  friends: FriendLocation[];
  myLocation: { lat: number; lng: number } | null;
  className?: string;
  onFriendSelect?: (friend: { userId: string; username: string }) => void;
  settings?: LocationSettings;
  // Overlay data
  nearbyPlaces?: NearbyPlace[];
  events?: TicketmasterEvent[];
  heatmapPoints?: HeatmapPoint[];
  camera?: MapCameraState;
  showDistances?: boolean;
  onSelectPlace?: (place: NearbyPlace) => void;
  onSelectEvent?: (event: TicketmasterEvent) => void;
}

const MAP_STYLE_BG: Record<string, string> = {
  dark: 'bg-neutral-900',
  satellite: 'bg-emerald-950',
  terrain: 'bg-amber-950',
  light: 'bg-neutral-200',
};

const GRID_COLORS: Record<string, string> = {
  dark: 'rgba(255,255,255,0.1)',
  satellite: 'rgba(100,200,150,0.1)',
  terrain: 'rgba(200,180,100,0.1)',
  light: 'rgba(0,0,0,0.08)',
};

export function LocationMap({
  friends, myLocation, className, onFriendSelect, settings,
  nearbyPlaces, events, heatmapPoints, camera,
  showDistances, onSelectPlace, onSelectEvent,
}: LocationMapProps) {
  const mapStyle = settings?.mapStyle || 'dark';
  const zoom = camera?.zoom || 14;

  const getPosition = (lat: number, lng: number) => {
    const center = myLocation || { lat: 0, lng: 0 };
    const scale = zoom * (1000 / 14); // normalize to zoom 14
    const dx = (lng - center.lng) * scale;
    const dy = (center.lat - lat) * scale;
    return {
      x: Math.max(5, Math.min(95, 50 + dx)),
      y: Math.max(5, Math.min(95, 50 + dy)),
    };
  };

  const bgClass = MAP_STYLE_BG[mapStyle] || MAP_STYLE_BG.dark;
  const gridColor = GRID_COLORS[mapStyle] || GRID_COLORS.dark;
  const gridSize = Math.max(20, 40 * (zoom / 14));

  return (
    <div className={`relative ${bgClass} overflow-hidden ${className || ''}`}
      style={{
        transform: camera?.tilt ? `perspective(1000px) rotateX(${camera.tilt}deg)` : undefined,
        transformOrigin: 'center center',
      }}
    >
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
        transform: camera?.bearing ? `rotate(${camera.bearing}deg)` : undefined,
      }} />

      {/* Heatmap overlay (Gap 70) */}
      <ActivityHeatmap
        points={heatmapPoints || []}
        myLocation={myLocation}
        visible={settings?.showHeatmap === true}
      />

      {/* POI markers (Gap 71) */}
      {onSelectPlace && (
        <POIMarkers
          places={nearbyPlaces || []}
          myLocation={myLocation}
          visible={settings?.showPOIs === true}
          onSelectPlace={onSelectPlace}
        />
      )}

      {/* Event markers (Gap 77) */}
      {onSelectEvent && (
        <EventMarkers
          events={events || []}
          myLocation={myLocation}
          visible={settings?.showEvents === true}
          onSelectEvent={onSelectEvent}
        />
      )}

      {/* Distance overlay (Gap 73) */}
      <DistanceOverlay
        friends={friends}
        myLocation={myLocation}
        visible={showDistances === true}
      />

      {/* My location */}
      {myLocation && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg shadow-blue-500/50" />
          <div className="absolute inset-0 bg-blue-500/30 rounded-full animate-ping" />
        </div>
      )}

      {/* Friend pins (Gap 76 animated + Gap 81 enhanced markers) */}
      {friends.map(friend => {
        const pos = getPosition(friend.latitude, friend.longitude);
        return (
          <div
            key={friend.userId}
            className="absolute -translate-x-1/2 -translate-y-full z-10 cursor-pointer"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            onClick={() => onFriendSelect?.({ userId: friend.userId, username: friend.username })}
          >
            <AnimatedFriendPin
              friend={friend}
              settings={settings ? {
                markerStyle: settings.markerStyle,
                markerSize: settings.markerSize,
                showActivityOnMarker: settings.showActivityOnMarker,
              } : undefined}
            />
          </div>
        );
      })}

      {/* Empty state */}
      {friends.length === 0 && !myLocation && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 text-white/10 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-white/30">Enable location to see friends nearby</p>
          </div>
        </div>
      )}
    </div>
  );
}
