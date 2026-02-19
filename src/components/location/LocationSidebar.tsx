'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MeetupPanel } from './MeetupPanel';
import { GeofencePanel } from './GeofencePanel';
import { SavedPlacesPanel } from './SavedPlacesPanel';
import { FavoriteFriends } from './FavoriteFriends';
import type { FriendLocation, LocationCircle, Meetup, Geofence, SavedPlace } from '@/types/location';
import { calculateDistanceMeters, formatDistance } from '@/utils/distance';

type SidebarTab = 'friends' | 'meetups' | 'geofences' | 'places';

interface LocationSidebarProps {
  friends: FriendLocation[];
  circles: LocationCircle[];
  selectedCircle: string | null;
  onSelectCircle: (circleId: string | null) => void;
  onCreateCircle: () => void;
  meetups: Meetup[];
  onCreateMeetup: (input: { title: string; latitude: number; longitude: number; address?: string; scheduledAt: string }) => Promise<Meetup>;
  onDeleteMeetup: (id: string) => Promise<void>;
  geofences: Geofence[];
  onCreateGeofence: (input: { name: string; latitude: number; longitude: number; radius: number; type: 'enter' | 'exit' | 'both' }) => Promise<Geofence>;
  onDeleteGeofence: (id: string) => Promise<void>;
  savedPlaces: SavedPlace[];
  onSavePlace: (input: { name: string; address: string; latitude: number; longitude: number; category?: string }) => Promise<SavedPlace>;
  onDeletePlace: (id: string) => Promise<void>;
  myLocation: { lat: number; lng: number } | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite?: (userId: string) => void;
  onSelectFriend?: (friend: { userId: string; username: string }) => void;
}

const tabs: { id: SidebarTab; label: string }[] = [
  { id: 'friends', label: 'Friends' },
  { id: 'meetups', label: 'Meetups' },
  { id: 'geofences', label: 'Zones' },
  { id: 'places', label: 'Saved' },
];

export function LocationSidebar(props: LocationSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('friends');

  if (!props.isOpen) return null;

  return (
    <div className="absolute top-0 right-0 bottom-0 w-80 z-40 glass-heavy border-l border-white/10 overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-white font-semibold">Location</h2>
        <button onClick={props.onClose} className="text-white/50 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-medium transition ${
              activeTab === tab.id ? 'text-purple-400 border-b-2 border-purple-400' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === 'friends' && (
          <FriendsTab
            friends={props.friends}
            circles={props.circles}
            selectedCircle={props.selectedCircle}
            onSelectCircle={props.onSelectCircle}
            onCreateCircle={props.onCreateCircle}
            myLocation={props.myLocation}
            onToggleFavorite={props.onToggleFavorite}
            onSelectFriend={props.onSelectFriend}
          />
        )}
        {activeTab === 'meetups' && (
          <MeetupPanel
            meetups={props.meetups}
            onCreateMeetup={props.onCreateMeetup}
            onDeleteMeetup={props.onDeleteMeetup}
            myLocation={props.myLocation}
          />
        )}
        {activeTab === 'geofences' && (
          <GeofencePanel
            geofences={props.geofences}
            onCreateGeofence={props.onCreateGeofence}
            onDeleteGeofence={props.onDeleteGeofence}
            myLocation={props.myLocation}
          />
        )}
        {activeTab === 'places' && (
          <SavedPlacesPanel
            places={props.savedPlaces}
            onSavePlace={props.onSavePlace}
            onDeletePlace={props.onDeletePlace}
            myLocation={props.myLocation}
          />
        )}
      </div>
    </div>
  );
}

function FriendsTab({ friends, circles, selectedCircle, onSelectCircle, onCreateCircle, myLocation, onToggleFavorite, onSelectFriend }: {
  friends: FriendLocation[];
  circles: LocationCircle[];
  selectedCircle: string | null;
  onSelectCircle: (id: string | null) => void;
  onCreateCircle: () => void;
  myLocation: { lat: number; lng: number } | null;
  onToggleFavorite?: (userId: string) => void;
  onSelectFriend?: (friend: { userId: string; username: string }) => void;
}) {
  return (
    <>
      {/* Favorites section (Gap 72) */}
      {onToggleFavorite && onSelectFriend && (
        <FavoriteFriends
          friends={friends}
          myLocation={myLocation}
          onToggleFavorite={onToggleFavorite}
          onSelectFriend={onSelectFriend}
        />
      )}

      {/* Circles filter */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white/50 text-sm font-medium">Circles</h3>
          <button onClick={onCreateCircle} className="text-purple-400 text-sm hover:text-purple-300">+ New</button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSelectCircle(null)}
            className={`px-3 py-1.5 text-xs rounded-full transition ${!selectedCircle ? 'bg-purple-500 text-white' : 'glass text-white/50 hover:text-white'}`}
          >
            All
          </button>
          {circles.map(circle => (
            <button
              key={circle.id}
              onClick={() => onSelectCircle(circle.id === selectedCircle ? null : circle.id)}
              className={`px-3 py-1.5 text-xs rounded-full transition flex items-center gap-1 ${
                circle.id === selectedCircle ? 'bg-purple-500 text-white' : 'glass text-white/50 hover:text-white'
              }`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: circle.color }} />
              {circle.name}
            </button>
          ))}
        </div>
      </div>

      {/* Friends list with distance (Gap 73) and favorite toggle (Gap 72) */}
      <h3 className="text-white/50 text-sm font-medium mb-3">Nearby ({friends.length})</h3>
      <div className="space-y-2">
        {friends.map(friend => {
          const dist = myLocation
            ? calculateDistanceMeters(myLocation.lat, myLocation.lng, friend.latitude, friend.longitude)
            : null;

          return (
            <div key={friend.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition group">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {friend.avatar ? (
                    <Image src={friend.avatar} alt={friend.username} width={40} height={40} className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                      {friend.username[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                {friend.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-900" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">@{friend.username}</p>
                <p className="text-white/30 text-xs">
                  {friend.activityStatus === 'moving' ? 'Moving' : friend.status || (friend.isOnline ? 'Online' : 'Offline')}
                  {dist !== null && ` · ${formatDistance(dist)}`}
                </p>
              </div>
              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(friend.userId)}
                  className={`opacity-0 group-hover:opacity-100 transition text-lg ${
                    friend.isFavorite ? 'text-yellow-400 !opacity-100' : 'text-white/20 hover:text-yellow-400'
                  }`}
                  title={friend.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {friend.isFavorite ? '★' : '☆'}
                </button>
              )}
            </div>
          );
        })}
        {friends.length === 0 && (
          <p className="text-white/30 text-sm text-center py-4">No friends sharing location</p>
        )}
      </div>
    </>
  );
}
