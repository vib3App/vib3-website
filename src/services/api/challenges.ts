/**
 * Challenges API service
 */
import { apiClient } from './client';
import type {
  Challenge,
  CreateChallengeInput,
  UpdateChallengeInput,
  ChallengesListResponse,
  ChallengeCategory,
} from '@/types/challenge';
import type { Video } from '@/types/video';

export const challengesApi = {
  /**
   * Get list of challenges with optional filters
   */
  async getChallenges(options?: {
    category?: ChallengeCategory | 'all';
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ChallengesListResponse> {
    const { data } = await apiClient.get<ChallengesListResponse>('/challenges', {
      params: {
        category: options?.category === 'all' ? undefined : options?.category,
        status: options?.status,
        page: options?.page || 1,
        limit: options?.limit || 20,
      },
    });
    return data;
  },

  /**
   * Get featured challenges
   */
  async getFeaturedChallenges(): Promise<Challenge[]> {
    const { data } = await apiClient.get<{ challenges: Challenge[] }>('/challenges/featured');
    return data.challenges;
  },

  /**
   * Get a single challenge by ID
   */
  async getChallenge(challengeId: string): Promise<Challenge> {
    const { data } = await apiClient.get<{ challenge: Challenge }>(`/challenges/${challengeId}`);
    return data.challenge;
  },

  /**
   * Create a new challenge
   */
  async createChallenge(input: CreateChallengeInput): Promise<Challenge> {
    const { data } = await apiClient.post<{ challenge: Challenge }>('/challenges', input);
    return data.challenge;
  },

  /**
   * Update a challenge (only creator can update)
   */
  async updateChallenge(challengeId: string, updates: UpdateChallengeInput): Promise<Challenge> {
    const { data } = await apiClient.put<{ challenge: Challenge }>(`/challenges/${challengeId}`, updates);
    return data.challenge;
  },

  /**
   * Delete a challenge (only creator can delete)
   */
  async deleteChallenge(challengeId: string): Promise<void> {
    await apiClient.delete(`/challenges/${challengeId}`);
  },

  /**
   * Join a challenge
   */
  async joinChallenge(challengeId: string): Promise<void> {
    await apiClient.post(`/challenges/${challengeId}/join`);
  },

  /**
   * Leave a challenge
   */
  async leaveChallenge(challengeId: string): Promise<void> {
    await apiClient.post(`/challenges/${challengeId}/leave`);
  },

  /**
   * Get videos for a challenge
   */
  async getChallengeVideos(
    challengeId: string,
    options?: { page?: number; limit?: number; sort?: 'recent' | 'popular' }
  ): Promise<{ videos: Video[]; total: number; hasMore: boolean }> {
    const { data } = await apiClient.get<{ videos: Video[]; total: number; hasMore: boolean }>(
      `/challenges/${challengeId}/videos`,
      {
        params: {
          page: options?.page || 1,
          limit: options?.limit || 20,
          sort: options?.sort || 'popular',
        },
      }
    );
    return data;
  },

  /**
   * Get my challenges (created by me)
   */
  async getMyChallenges(): Promise<Challenge[]> {
    const { data } = await apiClient.get<{ challenges: Challenge[] }>('/challenges/user/my');
    return data.challenges;
  },

  /**
   * Get available categories
   */
  async getCategories(): Promise<{ id: string; label: string; count: number }[]> {
    const { data } = await apiClient.get<{ categories: { id: string; label: string; count: number }[] }>(
      '/challenges/meta/categories'
    );
    return data.categories;
  },
};
