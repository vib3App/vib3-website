import { apiClient } from './client';
import type { Sound, MusicTrack, MusicCategory, OriginalSound } from '@/types/sound';
import type { Video } from '@/types';
import { logger } from '@/utils/logger';

interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  page: number;
  total?: number;
}

export const soundsApi = {
  // Search sounds
  async searchSounds(query: string): Promise<Sound[]> {
    try {
      const response = await apiClient.get('/search/sounds', { params: { q: query } });
      return response.data.sounds || [];
    } catch (error) {
      logger.error('Failed to search sounds:', error);
      return [];
    }
  },

  // Get trending music
  async getTrending(page = 1, limit = 20): Promise<PaginatedResponse<MusicTrack>> {
    try {
      const response = await apiClient.get('/music/trending', { params: { page, limit } });
      return {
        data: response.data.tracks || response.data || [],
        hasMore: response.data.hasMore ?? false,
        page,
      };
    } catch (error) {
      logger.error('Failed to get trending music:', error);
      return { data: [], hasMore: false, page };
    }
  },

  // Search music
  async searchMusic(query: string, page = 1, limit = 20): Promise<PaginatedResponse<MusicTrack>> {
    try {
      const response = await apiClient.get('/music/search', { params: { q: query, page, limit } });
      return {
        data: response.data.tracks || response.data || [],
        hasMore: response.data.hasMore ?? false,
        page,
      };
    } catch (error) {
      logger.error('Failed to search music:', error);
      return { data: [], hasMore: false, page };
    }
  },

  // Get music by category
  async getByCategory(category: MusicCategory, page = 1, limit = 20): Promise<PaginatedResponse<MusicTrack>> {
    try {
      const response = await apiClient.get(`/music/category/${encodeURIComponent(category)}`, {
        params: { page, limit },
      });
      return {
        data: response.data.tracks || response.data || [],
        hasMore: response.data.hasMore ?? false,
        page,
      };
    } catch (error) {
      logger.error('Failed to get music by category:', error);
      return { data: [], hasMore: false, page };
    }
  },

  // Get saved music
  async getSaved(): Promise<MusicTrack[]> {
    try {
      const response = await apiClient.get('/music/saved');
      return response.data.tracks || response.data || [];
    } catch (error) {
      logger.error('Failed to get saved music:', error);
      return [];
    }
  },

  // Save/unsave music
  async saveTrack(trackId: string): Promise<boolean> {
    try {
      await apiClient.post(`/music/save/${trackId}`);
      return true;
    } catch (error) {
      logger.error('Failed to save track:', error);
      return false;
    }
  },

  // Get track details
  async getTrack(trackId: string): Promise<MusicTrack | null> {
    try {
      const response = await apiClient.get(`/music/track/${trackId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get track:', error);
      return null;
    }
  },

  // Get videos using a sound
  async getVideosBySound(soundId: string, page = 1, limit = 20): Promise<PaginatedResponse<Video>> {
    try {
      const response = await apiClient.get(`/sounds/${soundId}/videos`, { params: { page, limit } });
      return {
        data: response.data.videos || response.data || [],
        hasMore: response.data.hasMore ?? false,
        page,
      };
    } catch (error) {
      logger.error('Failed to get videos by sound:', error);
      return { data: [], hasMore: false, page };
    }
  },

  // Favorite/unfavorite sound
  async favoriteSound(soundId: string): Promise<boolean> {
    try {
      await apiClient.post(`/sounds/${soundId}/favorite`);
      return true;
    } catch (error) {
      logger.error('Failed to favorite sound:', error);
      return false;
    }
  },

  async unfavoriteSound(soundId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/sounds/${soundId}/favorite`);
      return true;
    } catch (error) {
      logger.error('Failed to unfavorite sound:', error);
      return false;
    }
  },

  // Original sounds
  async getTrendingOriginalSounds(page = 1, limit = 20): Promise<PaginatedResponse<OriginalSound>> {
    try {
      const response = await apiClient.get('/music/sounds/trending', { params: { page, limit } });
      return {
        data: response.data.sounds || response.data || [],
        hasMore: response.data.hasMore ?? false,
        page,
      };
    } catch (error) {
      logger.error('Failed to get trending original sounds:', error);
      return { data: [], hasMore: false, page };
    }
  },

  async searchOriginalSounds(query: string, page = 1, limit = 20): Promise<PaginatedResponse<OriginalSound>> {
    try {
      const response = await apiClient.get('/music/sounds/search', { params: { q: query, page, limit } });
      return {
        data: response.data.sounds || response.data || [],
        hasMore: response.data.hasMore ?? false,
        page,
      };
    } catch (error) {
      logger.error('Failed to search original sounds:', error);
      return { data: [], hasMore: false, page };
    }
  },

  async getOriginalSound(soundId: string): Promise<OriginalSound | null> {
    try {
      const response = await apiClient.get(`/music/sounds/${soundId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get original sound:', error);
      return null;
    }
  },

  async saveOriginalSound(soundId: string): Promise<boolean> {
    try {
      await apiClient.post(`/music/sounds/${soundId}/save`);
      return true;
    } catch (error) {
      logger.error('Failed to save original sound:', error);
      return false;
    }
  },

  async useSound(soundId: string): Promise<boolean> {
    try {
      await apiClient.post(`/music/sounds/${soundId}/use`);
      return true;
    } catch (error) {
      logger.error('Failed to mark sound as used:', error);
      return false;
    }
  },

  async getMySounds(page = 1, limit = 20): Promise<PaginatedResponse<OriginalSound>> {
    try {
      const response = await apiClient.get('/music/sounds/my', { params: { page, limit } });
      return {
        data: response.data.sounds || response.data || [],
        hasMore: response.data.hasMore ?? false,
        page,
      };
    } catch (error) {
      logger.error('Failed to get my sounds:', error);
      return { data: [], hasMore: false, page };
    }
  },

  async getSavedSounds(page = 1, limit = 20): Promise<PaginatedResponse<OriginalSound>> {
    try {
      const response = await apiClient.get('/music/sounds/saved', { params: { page, limit } });
      return {
        data: response.data.sounds || response.data || [],
        hasMore: response.data.hasMore ?? false,
        page,
      };
    } catch (error) {
      logger.error('Failed to get saved sounds:', error);
      return { data: [], hasMore: false, page };
    }
  },

  // Report music
  async reportTrack(trackId: string, reason: string, details?: string): Promise<boolean> {
    try {
      await apiClient.post('/music/report', { trackId, reason, details });
      return true;
    } catch (error) {
      logger.error('Failed to report track:', error);
      return false;
    }
  },
};
