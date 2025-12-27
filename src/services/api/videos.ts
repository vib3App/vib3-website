/**
 * Video API service
 * All video-related API calls in one place
 */
import { apiClient } from './client';
import type { Video, VideoFeedResponse } from '@/types';

export const videoApi = {
  /**
   * Get For You feed videos
   */
  async getForYouFeed(cursor?: string): Promise<VideoFeedResponse> {
    const params = cursor ? { cursor } : {};
    const response = await apiClient.get('/api/discover/for-you', { params });
    return response.data;
  },

  /**
   * Get a single video by ID
   */
  async getVideo(id: string): Promise<Video> {
    const response = await apiClient.get(`/api/videos/${id}`);
    return response.data;
  },

  /**
   * Like a video
   */
  async likeVideo(id: string): Promise<{ liked: boolean; likeCount: number }> {
    const response = await apiClient.post(`/api/videos/${id}/like`);
    return response.data;
  },

  /**
   * Unlike a video
   */
  async unlikeVideo(id: string): Promise<{ liked: boolean; likeCount: number }> {
    const response = await apiClient.delete(`/api/videos/${id}/like`);
    return response.data;
  },

  /**
   * Record a video view
   */
  async recordView(id: string, watchTime: number): Promise<void> {
    await apiClient.post(`/api/videos/${id}/view`, { watchTime });
  },

  /**
   * Get user's videos
   */
  async getUserVideos(userId: string, cursor?: string): Promise<VideoFeedResponse> {
    const params = cursor ? { cursor } : {};
    const response = await apiClient.get(`/api/users/${userId}/videos`, { params });
    return response.data;
  },

  /**
   * Search videos
   */
  async searchVideos(query: string, cursor?: string): Promise<VideoFeedResponse> {
    const params = { q: query, ...(cursor ? { cursor } : {}) };
    const response = await apiClient.get('/api/search/videos', { params });
    return response.data;
  },
};
