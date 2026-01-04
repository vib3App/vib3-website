import { apiClient } from '../client';
import type { CollectionVideo, PaginatedResponse } from '@/types';
import { VideoResponse, transformVideo } from './types';

export const savedApi = {
  // Watch Later
  async getWatchLater(page = 1, limit = 20): Promise<PaginatedResponse<CollectionVideo>> {
    const { data } = await apiClient.get<{
      videos: Array<{ videoId: string; addedAt: string; video: VideoResponse }>;
      total: number; page: number; hasMore: boolean;
    }>('/collections/watch-later', { params: { page, limit } });

    return {
      items: data.videos.map(v => ({ videoId: v.videoId, addedAt: v.addedAt, video: transformVideo(v.video) })),
      total: data.total, page: data.page, hasMore: data.hasMore,
    };
  },

  async addToWatchLater(videoId: string): Promise<void> {
    await apiClient.post('/collections/watch-later', { videoId });
  },

  async removeFromWatchLater(videoId: string): Promise<void> {
    await apiClient.delete(`/collections/watch-later/${videoId}`);
  },

  async isInWatchLater(videoId: string): Promise<boolean> {
    const { data } = await apiClient.get<{ isInWatchLater: boolean }>(`/collections/watch-later/check/${videoId}`);
    return data.isInWatchLater;
  },

  // Saved Videos
  async getSavedVideos(page = 1, limit = 20): Promise<PaginatedResponse<CollectionVideo>> {
    const { data } = await apiClient.get<{
      videos: Array<{ videoId: string; addedAt: string; video: VideoResponse }>;
      total: number; page: number; hasMore: boolean;
    }>('/collections/saved', { params: { page, limit } });

    return {
      items: data.videos.map(v => ({ videoId: v.videoId, addedAt: v.addedAt, video: transformVideo(v.video) })),
      total: data.total, page: data.page, hasMore: data.hasMore,
    };
  },

  async saveVideo(videoId: string): Promise<void> {
    await apiClient.post('/collections/saved', { videoId });
  },

  async unsaveVideo(videoId: string): Promise<void> {
    await apiClient.delete(`/collections/saved/${videoId}`);
  },

  async isVideoSaved(videoId: string): Promise<boolean> {
    const { data } = await apiClient.get<{ isSaved: boolean }>(`/collections/saved/check/${videoId}`);
    return data.isSaved;
  },

  // Liked Videos
  async getLikedVideos(page = 1, limit = 20): Promise<PaginatedResponse<CollectionVideo>> {
    const { data } = await apiClient.get<{
      videos: Array<{ videoId: string; addedAt: string; video: VideoResponse }>;
      total: number; page: number; hasMore: boolean;
    }>('/collections/liked', { params: { page, limit } });

    return {
      items: data.videos.map(v => ({ videoId: v.videoId, addedAt: v.addedAt, video: transformVideo(v.video) })),
      total: data.total, page: data.page, hasMore: data.hasMore,
    };
  },

  // Watch History
  async getWatchHistory(page = 1, limit = 20): Promise<PaginatedResponse<CollectionVideo & { watchedAt: string; progress: number }>> {
    const { data } = await apiClient.get<{
      videos: Array<{ videoId: string; watchedAt: string; progress: number; video: VideoResponse }>;
      total: number; page: number; hasMore: boolean;
    }>('/collections/history', { params: { page, limit } });

    return {
      items: data.videos.map(v => ({
        videoId: v.videoId, addedAt: v.watchedAt, watchedAt: v.watchedAt,
        progress: v.progress, video: transformVideo(v.video),
      })),
      total: data.total, page: data.page, hasMore: data.hasMore,
    };
  },

  async clearWatchHistory(): Promise<void> {
    await apiClient.delete('/collections/history');
  },

  async removeFromHistory(videoId: string): Promise<void> {
    await apiClient.delete(`/collections/history/${videoId}`);
  },
};
