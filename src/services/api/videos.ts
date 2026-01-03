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
    const response = await apiClient.get('/discover/for-you', { params });
    return response.data;
  },

  /**
   * Get a single video by ID
   */
  async getVideo(id: string): Promise<Video> {
    const response = await apiClient.get(`/videos/${id}`);
    return response.data;
  },

  /**
   * Like a video
   */
  async likeVideo(id: string): Promise<{ liked: boolean; likeCount: number }> {
    const response = await apiClient.post(`/videos/${id}/like`);
    return response.data;
  },

  /**
   * Unlike a video
   */
  async unlikeVideo(id: string): Promise<{ liked: boolean; likeCount: number }> {
    const response = await apiClient.delete(`/videos/${id}/like`);
    return response.data;
  },

  /**
   * Record a video view
   */
  async recordView(id: string, watchTime: number): Promise<void> {
    await apiClient.post(`/videos/${id}/view`, { watchTime });
  },

  /**
   * Get user's videos
   * Uses /videos/user/:userId which returns a raw array
   */
  async getUserVideos(userId: string, cursor?: string): Promise<VideoFeedResponse> {
    const params = cursor ? { cursor } : {};
    const response = await apiClient.get(`/videos/user/${userId}`, { params });
    // Backend returns raw array, normalize to VideoFeedResponse format
    const data = response.data;
    if (Array.isArray(data)) {
      return {
        videos: data,
        hasMore: data.length >= 10,
      };
    }
    return data;
  },

  /**
   * Search videos
   */
  async searchVideos(query: string, cursor?: string): Promise<VideoFeedResponse> {
    const params = { q: query, ...(cursor ? { cursor } : {}) };
    const response = await apiClient.get('/search/videos', { params });
    return response.data;
  },
};
