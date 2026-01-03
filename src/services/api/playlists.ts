/**
 * Playlists API service
 * Handles playlist CRUD operations
 */

import { apiClient } from './client';
import type {
  Playlist,
  PlaylistType,
  CreatePlaylistPayload,
  UpdatePlaylistPayload,
} from '@/types/playlist';
import type { Video } from '@/types';

interface PlaylistResponse {
  _id: string;
  name: string;
  description: string;
  userId: string;
  videoIds: string[];
  thumbnailUrl?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  videoCount: number;
  totalDuration: number;
  type: PlaylistType;
  tags: string[];
  coverImageUrl?: string;
  isCollaborative: boolean;
  collaborators: string[];
}

function transformPlaylist(data: PlaylistResponse): Playlist {
  return {
    id: data._id,
    name: data.name,
    description: data.description,
    userId: data.userId,
    videoIds: data.videoIds || [],
    thumbnailUrl: data.thumbnailUrl,
    isPrivate: data.isPrivate,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    videoCount: data.videoCount || 0,
    totalDuration: data.totalDuration || 0,
    type: data.type || 'custom',
    tags: data.tags || [],
    coverImageUrl: data.coverImageUrl,
    isCollaborative: data.isCollaborative || false,
    collaborators: data.collaborators || [],
  };
}

export const playlistsApi = {
  /**
   * Get user's playlists
   */
  async getUserPlaylists(userId?: string): Promise<Playlist[]> {
    try {
      const endpoint = userId ? `/playlists/user/${userId}` : '/playlists';
      const { data } = await apiClient.get<{ playlists: PlaylistResponse[] }>(endpoint);
      return (data.playlists || []).map(transformPlaylist);
    } catch (error) {
      console.warn('Failed to get playlists:', error);
      return [];
    }
  },

  /**
   * Get a single playlist by ID
   */
  async getPlaylist(playlistId: string): Promise<Playlist | null> {
    try {
      const { data } = await apiClient.get<{ playlist: PlaylistResponse }>(
        `/playlists/${playlistId}`
      );
      return transformPlaylist(data.playlist);
    } catch (error) {
      console.error('Failed to get playlist:', error);
      return null;
    }
  },

  /**
   * Create a new playlist
   */
  async createPlaylist(payload: CreatePlaylistPayload): Promise<Playlist | null> {
    try {
      const { data } = await apiClient.post<{ playlist: PlaylistResponse }>(
        '/playlists',
        {
          name: payload.name,
          description: payload.description || '',
          type: payload.type || 'custom',
          isPrivate: payload.isPrivate ?? false,
          tags: payload.tags || [],
          coverImageUrl: payload.coverImageUrl,
        }
      );
      return transformPlaylist(data.playlist);
    } catch (error) {
      console.error('Failed to create playlist:', error);
      return null;
    }
  },

  /**
   * Update a playlist
   */
  async updatePlaylist(
    playlistId: string,
    payload: UpdatePlaylistPayload
  ): Promise<boolean> {
    try {
      await apiClient.put(`/playlists/${playlistId}`, payload);
      return true;
    } catch (error) {
      console.error('Failed to update playlist:', error);
      return false;
    }
  },

  /**
   * Delete a playlist
   */
  async deletePlaylist(playlistId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/playlists/${playlistId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      return false;
    }
  },

  /**
   * Get videos in a playlist
   */
  async getPlaylistVideos(playlistId: string): Promise<Video[]> {
    try {
      const { data } = await apiClient.get<{ videos: Video[] }>(
        `/playlists/${playlistId}/videos`
      );
      return data.videos || [];
    } catch (error) {
      console.error('Failed to get playlist videos:', error);
      return [];
    }
  },

  /**
   * Add a video to a playlist
   */
  async addVideoToPlaylist(playlistId: string, videoId: string): Promise<boolean> {
    try {
      await apiClient.post(`/playlists/${playlistId}/videos`, { videoId });
      return true;
    } catch (error) {
      console.error('Failed to add video to playlist:', error);
      return false;
    }
  },

  /**
   * Remove a video from a playlist
   */
  async removeVideoFromPlaylist(
    playlistId: string,
    videoId: string
  ): Promise<boolean> {
    try {
      await apiClient.delete(`/playlists/${playlistId}/videos/${videoId}`);
      return true;
    } catch (error) {
      console.error('Failed to remove video from playlist:', error);
      return false;
    }
  },

  /**
   * Reorder videos in a playlist
   */
  async reorderPlaylistVideos(
    playlistId: string,
    videoIds: string[]
  ): Promise<boolean> {
    try {
      await apiClient.put(`/playlists/${playlistId}/reorder`, { videoIds });
      return true;
    } catch (error) {
      console.error('Failed to reorder playlist:', error);
      return false;
    }
  },

  /**
   * Get Watch Later playlist
   */
  async getWatchLater(): Promise<Playlist | null> {
    try {
      const { data } = await apiClient.get<{ playlist: PlaylistResponse }>(
        '/playlists/watch-later'
      );
      return transformPlaylist(data.playlist);
    } catch (error) {
      console.warn('Failed to get watch later:', error);
      return null;
    }
  },

  /**
   * Add to Watch Later
   */
  async addToWatchLater(videoId: string): Promise<boolean> {
    try {
      await apiClient.post('/playlists/watch-later', { videoId });
      return true;
    } catch (error) {
      console.error('Failed to add to watch later:', error);
      return false;
    }
  },

  /**
   * Remove from Watch Later
   */
  async removeFromWatchLater(videoId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/playlists/watch-later/${videoId}`);
      return true;
    } catch (error) {
      console.error('Failed to remove from watch later:', error);
      return false;
    }
  },
};
