export interface FriendLocation {
  userId: string;
  username: string;
  avatar?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  lastUpdated: string;
  isOnline: boolean;
  status?: string;
  activityStatus?: 'idle' | 'moving' | 'stationary';
  isFavorite?: boolean;
  interactionCount?: number;
  lastInteraction?: string;
}

export interface LocationCircle {
  id: string;
  name: string;
  color: string;
  members: string[];
  creatorId: string;
  createdAt: string;
}

export interface Meetup {
  id: string;
  title: string;
  location: { latitude: number; longitude: number; address?: string };
  creatorId: string;
  creatorUsername: string;
  attendees: string[];
  scheduledAt: string;
  createdAt: string;
}

export interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  distance: number;
  rating?: number;
}

export interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  type: 'enter' | 'exit' | 'both';
}

export interface SavedPlace {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category?: string;
  createdAt: string;
}

export interface ProximityAlert {
  id: string;
  userId: string;
  username: string;
  distance: number;
  timestamp: string;
}

export interface LocationSettings {
  ghostMode: boolean;
  shareWithCirclesOnly: boolean;
  proximityAlerts: boolean;
  proximityRadius: number;
  markerStyle?: 'default' | 'minimal' | 'avatar' | 'bubble';
  markerSize?: 'small' | 'medium' | 'large';
  showActivityOnMarker?: boolean;
  mapStyle?: 'dark' | 'satellite' | 'terrain' | 'light';
  showHeatmap?: boolean;
  showPOIs?: boolean;
  showEvents?: boolean;
}

export interface TicketmasterEvent {
  id: string;
  name: string;
  type: string;
  url?: string;
  imageUrl?: string;
  startDate: string;
  venue: {
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
  };
  priceRange?: { min: number; max: number; currency: string };
  category?: string;
}

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  intensity: number;
}

export interface FriendInteraction {
  id: string;
  friendUserId: string;
  friendUsername: string;
  type: 'wave' | 'meetup' | 'nearby' | 'message' | 'reaction';
  timestamp: string;
  location?: { latitude: number; longitude: number };
}

export interface MapCameraState {
  centerLat: number;
  centerLng: number;
  zoom: number;
  tilt: number;
  bearing: number;
}
