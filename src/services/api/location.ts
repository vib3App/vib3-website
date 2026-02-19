import { apiClient } from '@/services/api/client';
import type {
  FriendLocation, LocationCircle, Meetup, NearbyPlace, Geofence,
  SavedPlace, LocationSettings, TicketmasterEvent, HeatmapPoint, FriendInteraction,
} from '@/types/location';

export const locationApi = {
  async getFriendLocations(): Promise<FriendLocation[]> {
    const { data } = await apiClient.get('/locations/friends');
    return data.locations || data || [];
  },

  async updateMyLocation(latitude: number, longitude: number): Promise<void> {
    await apiClient.post('/locations/update', { latitude, longitude });
  },

  async getCircles(): Promise<LocationCircle[]> {
    const { data } = await apiClient.get('/locations/circles');
    return data.circles || data || [];
  },

  async createCircle(name: string, color: string, memberIds: string[]): Promise<LocationCircle> {
    const { data } = await apiClient.post('/locations/circles', { name, color, memberIds });
    return data;
  },

  async deleteCircle(circleId: string): Promise<void> {
    await apiClient.delete(`/locations/circles/${circleId}`);
  },

  async addToCircle(circleId: string, userId: string): Promise<void> {
    await apiClient.post(`/locations/circles/${circleId}/members`, { userId });
  },

  async removeFromCircle(circleId: string, userId: string): Promise<void> {
    await apiClient.delete(`/locations/circles/${circleId}/members/${userId}`);
  },

  async getNearbyPlaces(latitude: number, longitude: number, radius?: number): Promise<NearbyPlace[]> {
    const { data } = await apiClient.get('/locations/nearby', { params: { latitude, longitude, radius } });
    return data.places || data || [];
  },

  async getMeetups(): Promise<Meetup[]> {
    const { data } = await apiClient.get('/locations/meetups');
    return data.meetups || data || [];
  },

  async createMeetup(input: { title: string; latitude: number; longitude: number; address?: string; scheduledAt: string }): Promise<Meetup> {
    const { data } = await apiClient.post('/locations/meetups', input);
    return data;
  },

  async deleteMeetup(meetupId: string): Promise<void> {
    await apiClient.delete(`/locations/meetups/${meetupId}`);
  },

  // Geofences
  async getGeofences(): Promise<Geofence[]> {
    const { data } = await apiClient.get('/locations/geofences');
    return data.geofences || data || [];
  },

  async createGeofence(input: { name: string; latitude: number; longitude: number; radius: number; type: 'enter' | 'exit' | 'both' }): Promise<Geofence> {
    const { data } = await apiClient.post('/locations/geofences', input);
    return data;
  },

  async deleteGeofence(geofenceId: string): Promise<void> {
    await apiClient.delete(`/locations/geofences/${geofenceId}`);
  },

  // Ghost mode & settings
  async getLocationSettings(): Promise<LocationSettings> {
    const { data } = await apiClient.get('/locations/settings');
    return data.settings || data;
  },

  async updateLocationSettings(settings: Partial<LocationSettings>): Promise<LocationSettings> {
    const { data } = await apiClient.patch('/locations/settings', settings);
    return data.settings || data;
  },

  // Saved places
  async getSavedPlaces(): Promise<SavedPlace[]> {
    const { data } = await apiClient.get('/locations/saved-places');
    return data.places || data || [];
  },

  async savePlace(input: { name: string; address: string; latitude: number; longitude: number; category?: string }): Promise<SavedPlace> {
    const { data } = await apiClient.post('/locations/saved-places', input);
    return data;
  },

  async deleteSavedPlace(placeId: string): Promise<void> {
    await apiClient.delete(`/locations/saved-places/${placeId}`);
  },

  // Favorites
  async toggleFavoriteFriend(userId: string): Promise<{ isFavorite: boolean }> {
    const { data } = await apiClient.post(`/locations/friends/${userId}/favorite`);
    return data;
  },

  async getFavoriteFriends(): Promise<string[]> {
    const { data } = await apiClient.get('/locations/friends/favorites');
    return data.favorites || data || [];
  },

  // Activity heatmap
  async getActivityHeatmap(latitude: number, longitude: number, radius?: number): Promise<HeatmapPoint[]> {
    const { data } = await apiClient.get('/locations/heatmap', { params: { latitude, longitude, radius } });
    return data.points || data || [];
  },

  // Events
  async getNearbyEvents(latitude: number, longitude: number, radius?: number): Promise<TicketmasterEvent[]> {
    const { data } = await apiClient.get('/locations/events', { params: { latitude, longitude, radius } });
    return data.events || data || [];
  },

  // Interactions
  async trackInteraction(friendUserId: string, type: FriendInteraction['type'], location?: { latitude: number; longitude: number }): Promise<FriendInteraction> {
    const { data } = await apiClient.post('/locations/interactions', { friendUserId, type, location });
    return data;
  },

  async getInteractions(friendUserId?: string): Promise<FriendInteraction[]> {
    const params = friendUserId ? { friendUserId } : {};
    const { data } = await apiClient.get('/locations/interactions', { params });
    return data.interactions || data || [];
  },
};
