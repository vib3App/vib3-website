import { apiClient } from './client';
import type { Video } from '@/types';

export interface Echo {
  id: string;
  originalVideoId: string;
  responseVideoId: string;
  responseVideo: Video;
  createdAt: string;
}

export const echoApi = {
  // Get echoes (responses) for a video
  async getEchoes(videoId: string, page = 1, limit = 20): Promise<{ echoes: Echo[]; hasMore: boolean }> {
    try {
      const response = await apiClient.get(`/videos/${videoId}/echoes`, {
        params: { page, limit },
      });
      return {
        echoes: response.data.echoes || [],
        hasMore: response.data.hasMore ?? false,
      };
    } catch (error) {
      console.error('Failed to get echoes:', error);
      return { echoes: [], hasMore: false };
    }
  },

  // Create an echo response
  async createEcho(originalVideoId: string, responseVideoId: string): Promise<Echo | null> {
    try {
      const response = await apiClient.post('/echoes', {
        originalVideoId,
        responseVideoId,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create echo:', error);
      return null;
    }
  },

  // Get user's echo responses
  async getUserEchoes(userId?: string, page = 1, limit = 20): Promise<{ echoes: Echo[]; hasMore: boolean }> {
    try {
      const endpoint = userId ? `/users/${userId}/echoes` : '/me/echoes';
      const response = await apiClient.get(endpoint, { params: { page, limit } });
      return {
        echoes: response.data.echoes || [],
        hasMore: response.data.hasMore ?? false,
      };
    } catch (error) {
      console.error('Failed to get user echoes:', error);
      return { echoes: [], hasMore: false };
    }
  },

  // Delete an echo
  async deleteEcho(echoId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/echoes/${echoId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete echo:', error);
      return false;
    }
  },
};
