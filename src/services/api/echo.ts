import { apiClient } from './client';
import type { Video } from '@/types';
import { logger } from '@/utils/logger';

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
      logger.error('Failed to get echoes:', error);
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
      logger.error('Failed to create echo:', error);
      return null;
    }
  },

  // Compose a side-by-side echo. The backend's POST /api/echo/compose runs
  // FFmpeg server-side to combine the original + the user's recording into a
  // single video, saves it, and returns the new video id + URL.
  async composeEcho(params: {
    originalVideoId: string;
    userVideo: Blob;
    layout?: 'sideBySide' | 'topBottom' | 'pictureInPicture';
    userOnLeft?: boolean;
    audioMix?: 'both' | 'original' | 'user';
    description?: string;
    hashtags?: string[];
  }): Promise<{ videoId: string; videoUrl?: string } | null> {
    try {
      const form = new FormData();
      form.append('userVideo', params.userVideo, 'echo.mp4');
      form.append('originalVideoId', params.originalVideoId);
      form.append('layout', params.layout ?? 'sideBySide');
      form.append('userOnLeft', String(params.userOnLeft ?? true));
      form.append('audioMix', params.audioMix ?? 'both');
      if (params.description) form.append('description', params.description);
      if (params.hashtags && params.hashtags.length > 0) {
        form.append('hashtags', params.hashtags.join(','));
      }
      const response = await apiClient.post('/echo/compose', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to compose echo:', error);
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
      logger.error('Failed to get user echoes:', error);
      return { echoes: [], hasMore: false };
    }
  },

  // Delete an echo
  async deleteEcho(echoId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/echoes/${echoId}`);
      return true;
    } catch (error) {
      logger.error('Failed to delete echo:', error);
      return false;
    }
  },
};
