/**
 * Time Capsule API service
 *
 * Backend endpoints available:
 * - /capsules/my - User's own capsules (can filter by status=locked or status=unlocked)
 * - /capsules/public/discover - Public unlocked capsules
 * - /capsules/feed - Capsules viewable by user (public + friends' unlocked capsules)
 */
import { apiClient } from './client';
import type {
  TimeCapsule,
  CreateCapsuleInput,
  CapsuleReveal,
} from '@/types/capsule';

export const capsuleApi = {
  /**
   * Get upcoming capsule reveals (public discover)
   * Uses /capsules/public/discover for public unlocked capsules
   */
  async getUpcomingCapsules(page = 1, limit = 20): Promise<{ capsules: TimeCapsule[]; hasMore: boolean }> {
    try {
      const { data } = await apiClient.get<{ capsules: TimeCapsule[]; pagination?: { pages: number; page: number } }>('/capsules/public/discover', {
        params: { page, limit },
      });
      return {
        capsules: data.capsules || [],
        hasMore: data.pagination ? data.pagination.page < data.pagination.pages : false,
      };
    } catch (error) {
      console.error('Error fetching upcoming capsules:', error);
      return { capsules: [], hasMore: false };
    }
  },

  /**
   * Get recently unlocked capsules (feed)
   * Uses /capsules/feed for capsules viewable by current user
   */
  async getUnlockedCapsules(page = 1, limit = 20): Promise<{ capsules: TimeCapsule[]; hasMore: boolean }> {
    try {
      const { data } = await apiClient.get<{ capsules: TimeCapsule[]; pagination?: { pages: number; page: number } }>('/capsules/feed', {
        params: { page, limit },
      });
      return {
        capsules: data.capsules || [],
        hasMore: data.pagination ? data.pagination.page < data.pagination.pages : false,
      };
    } catch (error) {
      console.error('Error fetching unlocked capsules:', error);
      return { capsules: [], hasMore: false };
    }
  },

  /**
   * Get my capsules (created by me)
   */
  async getMyCapsules(): Promise<TimeCapsule[]> {
    try {
      const { data } = await apiClient.get<{ capsules: TimeCapsule[] }>('/capsules/my');
      return data.capsules || [];
    } catch (error) {
      console.error('Error fetching my capsules:', error);
      return [];
    }
  },

  /**
   * Get capsules sent to me (from feed - includes friends' capsules)
   * Uses /capsules/feed which includes capsules shared with the user
   */
  async getReceivedCapsules(): Promise<TimeCapsule[]> {
    try {
      const { data } = await apiClient.get<{ capsules: TimeCapsule[] }>('/capsules/feed', {
        params: { limit: 50 },
      });
      return data.capsules || [];
    } catch (error) {
      console.error('Error fetching received capsules:', error);
      return [];
    }
  },

  /**
   * Get a single capsule
   */
  async getCapsule(capsuleId: string): Promise<TimeCapsule> {
    const { data } = await apiClient.get<{ capsule: TimeCapsule }>(`/capsules/${capsuleId}`);
    return data.capsule;
  },

  /**
   * Create a new time capsule
   */
  async createCapsule(input: Omit<CreateCapsuleInput, 'videoFile'>): Promise<TimeCapsule> {
    const { data } = await apiClient.post<{ capsule: TimeCapsule }>('/capsules', input);
    return data.capsule;
  },

  /**
   * Update a capsule (only before unlock)
   */
  async updateCapsule(
    capsuleId: string,
    updates: Partial<CreateCapsuleInput>
  ): Promise<TimeCapsule> {
    const { data } = await apiClient.patch<{ capsule: TimeCapsule }>(`/capsules/${capsuleId}`, updates);
    return data.capsule;
  },

  /**
   * Delete a capsule (only before unlock)
   */
  async deleteCapsule(capsuleId: string): Promise<void> {
    await apiClient.delete(`/capsules/${capsuleId}`);
  },

  /**
   * Subscribe to capsule unlock notification
   */
  async subscribeToCapsule(
    capsuleId: string,
    options?: { notifyEmail?: boolean; notifyPush?: boolean }
  ): Promise<void> {
    await apiClient.post(`/capsules/${capsuleId}/subscribe`, options);
  },

  /**
   * Unsubscribe from capsule
   */
  async unsubscribeFromCapsule(capsuleId: string): Promise<void> {
    await apiClient.delete(`/capsules/${capsuleId}/subscribe`);
  },

  /**
   * Get featured capsule reveals
   */
  async getFeaturedReveals(): Promise<CapsuleReveal[]> {
    try {
      const { data } = await apiClient.get<{ reveals: CapsuleReveal[] }>('/capsules/featured');
      return data.reveals || [];
    } catch {
      // Endpoint may not exist
      return [];
    }
  },

  /**
   * Like a capsule (when unlocked)
   */
  async likeCapsule(capsuleId: string): Promise<void> {
    await apiClient.post(`/capsules/${capsuleId}/like`);
  },

  /**
   * Unlike a capsule
   */
  async unlikeCapsule(capsuleId: string): Promise<void> {
    await apiClient.delete(`/capsules/${capsuleId}/like`);
  },
};
