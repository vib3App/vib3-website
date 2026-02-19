'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { locationApi } from '@/services/api/location';
import { websocketService } from '@/services/websocket';
import { useAuthStore } from '@/stores/authStore';
import type {
  FriendLocation, LocationCircle, Meetup, Geofence, SavedPlace,
  LocationSettings, NearbyPlace, TicketmasterEvent, HeatmapPoint,
  FriendInteraction, MapCameraState,
} from '@/types/location';
import { generateMockEvents, generateMockHeatmapPoints, generateMockPOIs } from '@/utils/locationMockData';
import { logger } from '@/utils/logger';

const defaultSettings: LocationSettings = {
  ghostMode: false,
  shareWithCirclesOnly: false,
  proximityAlerts: true,
  proximityRadius: 500,
  markerStyle: 'default',
  markerSize: 'medium',
  showActivityOnMarker: true,
  mapStyle: 'dark',
  showHeatmap: false,
  showPOIs: false,
  showEvents: false,
};

const defaultCamera: MapCameraState = {
  centerLat: 0,
  centerLng: 0,
  zoom: 14,
  tilt: 0,
  bearing: 0,
};

export function useLocationMap() {
  const { isAuthenticated } = useAuthStore();
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [friends, setFriends] = useState<FriendLocation[]>([]);
  const [circles, setCircles] = useState<LocationCircle[]>([]);
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [settings, setSettings] = useState<LocationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCircle, setSelectedCircle] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // New state for gaps 70-82
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [events, setEvents] = useState<TicketmasterEvent[]>([]);
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPoint[]>([]);
  const [interactions, setInteractions] = useState<FriendInteraction[]>([]);
  const [camera, setCamera] = useState<MapCameraState>(defaultCamera);

  // Get user's location
  useEffect(() => {
    if (!isAuthenticated || !navigator.geolocation) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMyLocation({ lat: latitude, lng: longitude });
        if (!settings.ghostMode) {
          locationApi.updateMyLocation(latitude, longitude).catch(() => {});
        }
      },
      (err) => logger.error('Geolocation error:', err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isAuthenticated, settings.ghostMode]);

  // Load all data
  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [friendsData, circlesData, meetupsData, geofencesData, savedData, settingsData] = await Promise.all([
        locationApi.getFriendLocations(),
        locationApi.getCircles(),
        locationApi.getMeetups(),
        locationApi.getGeofences(),
        locationApi.getSavedPlaces(),
        locationApi.getLocationSettings().catch(() => defaultSettings),
      ]);
      setFriends(friendsData);
      setCircles(circlesData);
      setMeetups(meetupsData);
      setGeofences(geofencesData);
      setSavedPlaces(savedData);
      setSettings({ ...defaultSettings, ...settingsData });

      // Load interactions
      locationApi.getInteractions().then(setInteractions).catch(() => {});
    } catch (err) {
      logger.error('Failed to load location data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { loadData(); }, [loadData]);

  // Load POIs, events, heatmap when location is available
  useEffect(() => {
    if (!myLocation) return;

    // POIs: try API first, fallback to mock
    locationApi.getNearbyPlaces(myLocation.lat, myLocation.lng)
      .then(setNearbyPlaces)
      .catch(() => setNearbyPlaces(generateMockPOIs(myLocation.lat, myLocation.lng)));

    // Events: try API first, fallback to mock
    locationApi.getNearbyEvents(myLocation.lat, myLocation.lng)
      .then(setEvents)
      .catch(() => setEvents(generateMockEvents(myLocation.lat, myLocation.lng)));

    // Heatmap: try API first, fallback to mock
    locationApi.getActivityHeatmap(myLocation.lat, myLocation.lng)
      .then(setHeatmapPoints)
      .catch(() => setHeatmapPoints(generateMockHeatmapPoints(myLocation.lat, myLocation.lng)));

    // Sync camera center
    setCamera(prev => ({
      ...prev,
      centerLat: myLocation.lat,
      centerLng: myLocation.lng,
    }));
  }, [myLocation?.lat, myLocation?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for real-time location updates
  useEffect(() => {
    const unsub = websocketService.onLocationUpdate((data: FriendLocation) => {
      setFriends(prev => {
        const idx = prev.findIndex(f => f.userId === data.userId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...data };
          return updated;
        }
        return [...prev, data];
      });
    });
    return unsub;
  }, []);

  // Ghost mode toggle
  const toggleGhostMode = useCallback(async () => {
    const newVal = !settings.ghostMode;
    setSettings(prev => ({ ...prev, ghostMode: newVal }));
    try {
      await locationApi.updateLocationSettings({ ghostMode: newVal });
    } catch (err) {
      logger.error('Failed to toggle ghost mode:', err);
      setSettings(prev => ({ ...prev, ghostMode: !newVal }));
    }
  }, [settings.ghostMode]);

  // Update settings (for map settings panel)
  const updateSettings = useCallback(async (update: Partial<LocationSettings>) => {
    setSettings(prev => ({ ...prev, ...update }));
    try {
      await locationApi.updateLocationSettings(update);
    } catch (err) {
      logger.error('Failed to update settings:', err);
    }
  }, []);

  // Meetup CRUD
  const createMeetup = useCallback(async (input: { title: string; latitude: number; longitude: number; address?: string; scheduledAt: string }) => {
    const meetup = await locationApi.createMeetup(input);
    setMeetups(prev => [meetup, ...prev]);
    return meetup;
  }, []);

  const deleteMeetup = useCallback(async (meetupId: string) => {
    await locationApi.deleteMeetup(meetupId);
    setMeetups(prev => prev.filter(m => m.id !== meetupId));
  }, []);

  // Geofence CRUD
  const createGeofence = useCallback(async (input: { name: string; latitude: number; longitude: number; radius: number; type: 'enter' | 'exit' | 'both' }) => {
    const geofence = await locationApi.createGeofence(input);
    setGeofences(prev => [geofence, ...prev]);
    return geofence;
  }, []);

  const deleteGeofence = useCallback(async (geofenceId: string) => {
    await locationApi.deleteGeofence(geofenceId);
    setGeofences(prev => prev.filter(g => g.id !== geofenceId));
  }, []);

  // Saved places CRUD
  const savePlace = useCallback(async (input: { name: string; address: string; latitude: number; longitude: number; category?: string }) => {
    const place = await locationApi.savePlace(input);
    setSavedPlaces(prev => [place, ...prev]);
    return place;
  }, []);

  const deleteSavedPlace = useCallback(async (placeId: string) => {
    await locationApi.deleteSavedPlace(placeId);
    setSavedPlaces(prev => prev.filter(p => p.id !== placeId));
  }, []);

  // Toggle favorite friend (Gap 72)
  const toggleFavoriteFriend = useCallback(async (userId: string) => {
    // Optimistic update
    setFriends(prev => prev.map(f =>
      f.userId === userId ? { ...f, isFavorite: !f.isFavorite } : f
    ));
    try {
      await locationApi.toggleFavoriteFriend(userId);
    } catch (err) {
      // Revert on failure
      setFriends(prev => prev.map(f =>
        f.userId === userId ? { ...f, isFavorite: !f.isFavorite } : f
      ));
      logger.error('Failed to toggle favorite:', err);
    }
  }, []);

  // Track interaction (Gap 80)
  const trackInteraction = useCallback(async (
    friendUserId: string,
    type: FriendInteraction['type'],
    location?: { latitude: number; longitude: number }
  ) => {
    try {
      const interaction = await locationApi.trackInteraction(friendUserId, type, location);
      setInteractions(prev => [interaction, ...prev]);
      return interaction;
    } catch (err) {
      logger.error('Failed to track interaction:', err);
      return null;
    }
  }, []);

  // Camera control (Gap 78)
  const updateCamera = useCallback((update: Partial<MapCameraState>) => {
    setCamera(prev => ({ ...prev, ...update }));
  }, []);

  const recenterCamera = useCallback(() => {
    if (myLocation) {
      setCamera(prev => ({
        ...prev,
        centerLat: myLocation.lat,
        centerLng: myLocation.lng,
      }));
    }
  }, [myLocation]);

  const filteredFriends = selectedCircle
    ? friends.filter(f => {
        const circle = circles.find(c => c.id === selectedCircle);
        return circle?.members.includes(f.userId);
      })
    : friends;

  return {
    myLocation,
    friends: filteredFriends,
    allFriends: friends,
    circles,
    meetups,
    geofences,
    savedPlaces,
    settings,
    isLoading,
    selectedCircle,
    setSelectedCircle,
    loadData,
    toggleGhostMode,
    updateSettings,
    createMeetup,
    deleteMeetup,
    createGeofence,
    deleteGeofence,
    savePlace,
    deleteSavedPlace,
    // New returns for gaps 70-82
    nearbyPlaces,
    events,
    heatmapPoints,
    interactions,
    camera,
    updateCamera,
    recenterCamera,
    toggleFavoriteFriend,
    trackInteraction,
  };
}
