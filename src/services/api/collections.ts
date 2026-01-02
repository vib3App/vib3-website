/**
 * Collections API service
 * Handles playlists, watch later, saved videos, liked videos, watch history
 */
import { apiClient } from './client';
import type {
  Collection,
  CollectionVideo,
  CreatePlaylistInput,
  UpdatePlaylistInput,
  CollectionType
} from '@/types';
import type { Video, PaginatedResponse } from '@/types';

interface VideoResponse {
  _id: string;
  userId: string;
  username: string;
  profilePicture?: string;
  videoUrl: string;
  hlsUrl?: string;
  thumbnailUrl?: string;
  caption: string;
  hashtags: string[];
  duration: number;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  sharesCount: number;
  isPublic: boolean;
  createdAt: string;
}

function transformVideo(data: VideoResponse): Video {
  return {
    id: data._id,
    userId: data.userId,
    username: data.username,
    userAvatar: data.profilePicture,
    videoUrl: data.hlsUrl || data.videoUrl,
    thumbnailUrl: data.thumbnailUrl,
    caption: data.caption,
    hashtags: data.hashtags || [],
    duration: data.duration,
    likesCount: data.likesCount || 0,
    commentsCount: data.commentsCount || 0,
    viewsCount: data.viewsCount || 0,
    sharesCount: data.sharesCount || 0,
    isPublic: data.isPublic,
    createdAt: data.createdAt,
  };
}

export const collectionsApi = {
  /**
   * Get all collections for current user
   * DISABLED: Backend doesn't support this endpoint yet (returns 404)
   */
  async getCollections(_type?: CollectionType): Promise<Collection[]> {
    // Backend doesn't have /collections endpoint for web - skip the API call entirely
    // This prevents 404 errors and potential re-render loops
    return [];
  },

  /**
   * Get a specific collection by ID
   */
  async getCollection(collectionId: string): Promise<Collection> {
    const { data } = await apiClient.get<{ collection: Collection }>(`/collections/${collectionId}`);
    return data.collection;
  },

  /**
   * Get videos in a collection
   */
  async getCollectionVideos(
    collectionId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<CollectionVideo>> {
    const { data } = await apiClient.get<{
      videos: Array<{ videoId: string; addedAt: string; note?: string; video: VideoResponse }>;
      total: number;
      page: number;
      hasMore: boolean;
    }>(`/collections/${collectionId}/videos`, {
      params: { page, limit },
    });

    return {
      items: data.videos.map(v => ({
        videoId: v.videoId,
        addedAt: v.addedAt,
        note: v.note,
        video: transformVideo(v.video),
      })),
      total: data.total,
      page: data.page,
      hasMore: data.hasMore,
    };
  },

  /**
   * Create a new playlist
   */
  async createPlaylist(input: CreatePlaylistInput): Promise<Collection> {
    const { data } = await apiClient.post<{ collection: Collection }>('/collections/playlists', input);
    return data.collection;
  },

  /**
   * Update a playlist
   */
  async updatePlaylist(playlistId: string, input: UpdatePlaylistInput): Promise<Collection> {
    const { data } = await apiClient.patch<{ collection: Collection }>(
      `/collections/playlists/${playlistId}`,
      input
    );
    return data.collection;
  },

  /**
   * Delete a playlist
   */
  async deletePlaylist(playlistId: string): Promise<void> {
    await apiClient.delete(`/collections/playlists/${playlistId}`);
  },

  /**
   * Add video to collection
   */
  async addToCollection(collectionId: string, videoId: string, note?: string): Promise<void> {
    await apiClient.post(`/collections/${collectionId}/videos`, { videoId, note });
  },

  /**
   * Remove video from collection
   */
  async removeFromCollection(collectionId: string, videoId: string): Promise<void> {
    await apiClient.delete(`/collections/${collectionId}/videos/${videoId}`);
  },

  /**
   * Reorder videos in collection
   */
  async reorderVideos(collectionId: string, videoIds: string[]): Promise<void> {
    await apiClient.put(`/collections/${collectionId}/reorder`, { videoIds });
  },

  // ========== Watch Later ==========

  /**
   * Get watch later list
   */
  async getWatchLater(page = 1, limit = 20): Promise<PaginatedResponse<CollectionVideo>> {
    const { data } = await apiClient.get<{
      videos: Array<{ videoId: string; addedAt: string; video: VideoResponse }>;
      total: number;
      page: number;
      hasMore: boolean;
    }>('/collections/watch-later', { params: { page, limit } });

    return {
      items: data.videos.map(v => ({
        videoId: v.videoId,
        addedAt: v.addedAt,
        video: transformVideo(v.video),
      })),
      total: data.total,
      page: data.page,
      hasMore: data.hasMore,
    };
  },

  /**
   * Add to watch later
   */
  async addToWatchLater(videoId: string): Promise<void> {
    await apiClient.post('/collections/watch-later', { videoId });
  },

  /**
   * Remove from watch later
   */
  async removeFromWatchLater(videoId: string): Promise<void> {
    await apiClient.delete(`/collections/watch-later/${videoId}`);
  },

  /**
   * Check if video is in watch later
   */
  async isInWatchLater(videoId: string): Promise<boolean> {
    const { data } = await apiClient.get<{ isInWatchLater: boolean }>(
      `/collections/watch-later/check/${videoId}`
    );
    return data.isInWatchLater;
  },

  // ========== Saved Videos ==========

  /**
   * Get saved videos
   */
  async getSavedVideos(page = 1, limit = 20): Promise<PaginatedResponse<CollectionVideo>> {
    const { data } = await apiClient.get<{
      videos: Array<{ videoId: string; addedAt: string; video: VideoResponse }>;
      total: number;
      page: number;
      hasMore: boolean;
    }>('/collections/saved', { params: { page, limit } });

    return {
      items: data.videos.map(v => ({
        videoId: v.videoId,
        addedAt: v.addedAt,
        video: transformVideo(v.video),
      })),
      total: data.total,
      page: data.page,
      hasMore: data.hasMore,
    };
  },

  /**
   * Save a video
   */
  async saveVideo(videoId: string): Promise<void> {
    await apiClient.post('/collections/saved', { videoId });
  },

  /**
   * Unsave a video
   */
  async unsaveVideo(videoId: string): Promise<void> {
    await apiClient.delete(`/collections/saved/${videoId}`);
  },

  /**
   * Check if video is saved
   */
  async isVideoSaved(videoId: string): Promise<boolean> {
    const { data } = await apiClient.get<{ isSaved: boolean }>(
      `/collections/saved/check/${videoId}`
    );
    return data.isSaved;
  },

  // ========== Liked Videos ==========

  /**
   * Get liked videos
   */
  async getLikedVideos(page = 1, limit = 20): Promise<PaginatedResponse<CollectionVideo>> {
    const { data } = await apiClient.get<{
      videos: Array<{ videoId: string; addedAt: string; video: VideoResponse }>;
      total: number;
      page: number;
      hasMore: boolean;
    }>('/collections/liked', { params: { page, limit } });

    return {
      items: data.videos.map(v => ({
        videoId: v.videoId,
        addedAt: v.addedAt,
        video: transformVideo(v.video),
      })),
      total: data.total,
      page: data.page,
      hasMore: data.hasMore,
    };
  },

  // ========== Watch History ==========

  /**
   * Get watch history
   */
  async getWatchHistory(page = 1, limit = 20): Promise<PaginatedResponse<CollectionVideo & { watchedAt: string; progress: number }>> {
    const { data } = await apiClient.get<{
      videos: Array<{ videoId: string; watchedAt: string; progress: number; video: VideoResponse }>;
      total: number;
      page: number;
      hasMore: boolean;
    }>('/collections/history', { params: { page, limit } });

    return {
      items: data.videos.map(v => ({
        videoId: v.videoId,
        addedAt: v.watchedAt,
        watchedAt: v.watchedAt,
        progress: v.progress,
        video: transformVideo(v.video),
      })),
      total: data.total,
      page: data.page,
      hasMore: data.hasMore,
    };
  },

  /**
   * Clear watch history
   */
  async clearWatchHistory(): Promise<void> {
    await apiClient.delete('/collections/history');
  },

  /**
   * Remove single item from history
   */
  async removeFromHistory(videoId: string): Promise<void> {
    await apiClient.delete(`/collections/history/${videoId}`);
  },

  // ========== Helpers ==========

  /**
   * Get which playlists a video is in
   */
  async getVideoPlaylists(videoId: string): Promise<Collection[]> {
    const { data } = await apiClient.get<{ playlists: Collection[] }>(
      `/videos/${videoId}/playlists`
    );
    return data.playlists;
  },

  /**
   * Add video to multiple playlists at once
   */
  async addToPlaylists(videoId: string, playlistIds: string[]): Promise<void> {
    await apiClient.post(`/videos/${videoId}/playlists`, { playlistIds });
  },
};
