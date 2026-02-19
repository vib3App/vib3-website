'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import {
  LocationMap, LocationSidebar, CreateCircleModal, GhostModeToggle,
  ActivityDetector, BackgroundLocationTracker, MapEmojiReactions,
  POIDiscovery, PlaceDetailsSheet, EventDetailsSheet,
  MapCameraControls, MapSettingsPanel, FriendInteractionTracker,
  MeetupRSVP, ActivityIndicator,
} from '@/components/location';
import { GhostModeBanner } from '@/components/location/GhostModeToggle';
import { useLocationMap } from '@/hooks/useLocationMap';
import { useLocationWebSocket } from '@/hooks/useLocationWebSocket';
import { locationApi } from '@/services/api/location';
import { useAuthStore } from '@/stores/authStore';
import { logger } from '@/utils/logger';
import type { NearbyPlace, TicketmasterEvent } from '@/types/location';

export default function LocationPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const {
    myLocation, friends, circles, meetups, geofences, savedPlaces, settings,
    isLoading, selectedCircle, setSelectedCircle, loadData,
    toggleGhostMode, updateSettings, createMeetup, deleteMeetup,
    createGeofence, deleteGeofence, savePlace, deleteSavedPlace,
    nearbyPlaces, events, heatmapPoints, interactions,
    camera, updateCamera, recenterCamera,
    toggleFavoriteFriend, trackInteraction,
  } = useLocationMap();

  // UI state
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCreateCircle, setShowCreateCircle] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<{ userId: string; username: string } | null>(null);
  const [currentActivity, setCurrentActivity] = useState<string>('stationary');
  const [showPOIPanel, setShowPOIPanel] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TicketmasterEvent | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showInteractions, setShowInteractions] = useState(false);
  const [showDistances, setShowDistances] = useState(false);

  // WebSocket for real-time updates (Gap 82)
  const wsStatus = useLocationWebSocket({
    enabled: isAuthenticated && !settings.ghostMode,
    onFriendUpdate: useCallback(() => {
      // Updates are already handled by useLocationMap's websocket listener
    }, []),
    myLocation,
    ghostMode: settings.ghostMode,
  });

  const handleLocationUpdate = useCallback((lat: number, lng: number) => {
    locationApi.updateMyLocation(lat, lng).catch(err => {
      logger.error('Failed to update location:', err);
    });
  }, []);

  const handleFriendSelect = useCallback((friend: { userId: string; username: string }) => {
    setSelectedFriend(friend);
    trackInteraction(friend.userId, 'nearby', myLocation ? { latitude: myLocation.lat, longitude: myLocation.lng } : undefined);
  }, [trackInteraction, myLocation]);

  if (!isAuthVerified) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login?redirect=/location');
    return null;
  }

  const handleCreateCircle = async (name: string, color: string) => {
    try {
      await locationApi.createCircle(name, color, []);
      loadData();
    } catch (err) {
      logger.error('Failed to create circle:', err);
    }
  };

  const handleSavePOI = (place: NearbyPlace) => {
    savePlace({
      name: place.name,
      address: `${place.category} - ${place.distance}m away`,
      latitude: place.latitude,
      longitude: place.longitude,
      category: place.category,
    });
    setSelectedPlace(null);
  };

  const handleSharePOI = (place: NearbyPlace) => {
    if (navigator.share) {
      navigator.share({
        title: place.name,
        text: `Check out ${place.name} (${place.category})`,
        url: `https://www.google.com/maps?q=${place.latitude},${place.longitude}`,
      }).catch(() => {});
    }
    setSelectedPlace(null);
  };

  return (
    <div className="h-screen flex flex-col">
      <TopNav />
      <div className="flex-1 relative pt-16 md:pt-16">
        {/* Map header */}
        <div className="absolute top-20 md:top-20 left-4 right-4 z-30 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white drop-shadow-lg glass px-4 py-2 rounded-full flex items-center gap-2">
            Location Map
            {wsStatus.isConnected && (
              <span className="w-2 h-2 bg-green-400 rounded-full" title="Real-time connected" />
            )}
          </h1>
          <div className="flex gap-2 flex-wrap justify-end">
            <ActivityDetector enabled={!settings.ghostMode} onActivityChange={setCurrentActivity} />
            <GhostModeToggle enabled={settings.ghostMode} onToggle={toggleGhostMode} />
            <button
              onClick={() => setShowDistances(!showDistances)}
              className={`glass px-3 py-2 rounded-full text-sm transition ${
                showDistances ? 'text-purple-400 ring-1 ring-purple-500/50' : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
              title="Toggle distance lines"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button
              onClick={() => setShowPOIPanel(!showPOIPanel)}
              className={`glass px-3 py-2 rounded-full text-sm transition ${
                showPOIPanel ? 'text-teal-400 ring-1 ring-teal-500/50' : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
              title="Nearby places"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </button>
            <button
              onClick={() => setShowInteractions(true)}
              className="glass px-3 py-2 rounded-full text-white/50 text-sm hover:text-white hover:bg-white/10 transition"
              title="Interaction history"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="glass px-3 py-2 rounded-full text-white/50 text-sm hover:text-white hover:bg-white/10 transition"
              title="Map settings"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="glass px-4 py-2 rounded-full text-white text-sm hover:bg-white/10 transition"
            >
              Friends ({friends.length})
            </button>
          </div>
        </div>

        {/* Gap #52: Ghost mode active banner */}
        <GhostModeBanner enabled={settings.ghostMode} />

        {/* Map with all overlays */}
        <LocationMap
          friends={friends}
          myLocation={myLocation}
          className="w-full h-full"
          onFriendSelect={handleFriendSelect}
          settings={settings}
          nearbyPlaces={nearbyPlaces}
          events={events}
          heatmapPoints={heatmapPoints}
          camera={camera}
          showDistances={showDistances}
          onSelectPlace={setSelectedPlace}
          onSelectEvent={setSelectedEvent}
        />

        {/* Map camera controls (Gap 78) */}
        <MapCameraControls
          camera={camera}
          onCameraChange={updateCamera}
          onRecenter={recenterCamera}
        />

        {/* POI discovery panel (Gap 71) */}
        <POIDiscovery
          places={nearbyPlaces}
          onSelectPlace={setSelectedPlace}
          isOpen={showPOIPanel}
          onClose={() => setShowPOIPanel(false)}
        />

        {/* Sidebar */}
        <LocationSidebar
          friends={friends}
          circles={circles}
          selectedCircle={selectedCircle}
          onSelectCircle={setSelectedCircle}
          onCreateCircle={() => setShowCreateCircle(true)}
          meetups={meetups}
          onCreateMeetup={createMeetup}
          onDeleteMeetup={deleteMeetup}
          geofences={geofences}
          onCreateGeofence={createGeofence}
          onDeleteGeofence={deleteGeofence}
          savedPlaces={savedPlaces}
          onSavePlace={savePlace}
          onDeletePlace={deleteSavedPlace}
          myLocation={myLocation}
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          onToggleFavorite={toggleFavoriteFriend}
          onSelectFriend={handleFriendSelect}
        />

        {/* Map emoji reactions */}
        {selectedFriend && (
          <div className="absolute bottom-6 left-4 z-30">
            <MapEmojiReactions
              targetUserId={selectedFriend.userId}
              targetUsername={selectedFriend.username}
              onReact={(reaction, userId) => {
                trackInteraction(userId, 'reaction', myLocation ? { latitude: myLocation.lat, longitude: myLocation.lng } : undefined);
                logger.info('Map reaction sent:', reaction, 'to', userId);
                setSelectedFriend(null);
              }}
            />
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50">
            <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Background location tracking */}
      <BackgroundLocationTracker
        enabled={!settings.ghostMode}
        onLocationUpdate={handleLocationUpdate}
      />

      {/* Modals and sheets */}
      <CreateCircleModal isOpen={showCreateCircle} onClose={() => setShowCreateCircle(false)} onCreate={handleCreateCircle} />
      <PlaceDetailsSheet place={selectedPlace} onClose={() => setSelectedPlace(null)} onSave={handleSavePOI} onShare={handleSharePOI} />
      <EventDetailsSheet event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      <MapSettingsPanel settings={settings} onUpdateSettings={updateSettings} isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <FriendInteractionTracker interactions={interactions} isOpen={showInteractions} onClose={() => setShowInteractions(false)} />
    </div>
  );
}
