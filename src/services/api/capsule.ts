/**
 * Time Capsule API service
 */
import { apiClient } from './client';
import type {
  TimeCapsule,
  CreateCapsuleInput,
  CapsuleReveal,
} from '@/types/capsule';

export const capsuleApi = {
  /**
   * Get upcoming capsule reveals
   */
  async getUpcomingCapsules(page = 1, limit = 20): Promise<{ capsules: TimeCapsule[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ capsules: TimeCapsule[]; hasMore: boolean }>('/capsules/upcoming', {
      params: { page, limit },
    });
    return data;
  },

  /**
   * Get recently unlocked capsules
   */
  async getUnlockedCapsules(page = 1, limit = 20): Promise<{ capsules: TimeCapsule[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ capsules: TimeCapsule[]; hasMore: boolean }>('/capsules/unlocked', {
      params: { page, limit },
    });
    return data;
  },

  /**
   * Get my capsules (created by me)
   */
  async getMyCapsules(): Promise<TimeCapsule[]> {
    const { data } = await apiClient.get<{ capsules: TimeCapsule[] }>('/capsules/my');
    return data.capsules;
  },

  /**
   * Get capsules sent to me
   */
  async getReceivedCapsules(): Promise<TimeCapsule[]> {
    const { data } = await apiClient.get<{ capsules: TimeCapsule[] }>('/capsules/received');
    return data.capsules;
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
    const { data } = await apiClient.get<{ reveals: CapsuleReveal[] }>('/capsules/featured');
    return data.reveals;
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
