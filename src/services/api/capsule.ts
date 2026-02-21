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
import { logger } from '@/utils/logger';

interface BackendCapsule {
  id?: string;
  _id?: string;
  userId?: string;
  creatorId?: string;
  creatorUsername?: string;
  username?: string;
  creatorAvatar?: string;
  profilePicture?: string;
  title?: string;
  description?: string;
  message?: string;
  coverImageUrl?: string;
  videoUrl?: string;
  mediaUrl?: string;
  mediaType?: string;
  thumbnailUrl?: string;
  status?: string;
  isUnlocked?: boolean;
  unlockAt?: string;
  unlockedAt?: string;
  createdAt?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean;
  recipientType?: string;
  isPrivate?: boolean;
  recipientIds?: string[];
  recipientUsernames?: string[];
  previewEnabled?: boolean;
  previewSeconds?: number;
  notifyOnUnlock?: boolean;
}

function transformCapsule(c: BackendCapsule): TimeCapsule {
  const isUnlocked = c.isUnlocked || c.status === 'unlocked';
  let status: TimeCapsule['status'] = 'sealed';
  if (isUnlocked) status = 'unlocked';
  else if (c.status === 'unlocking') status = 'unlocking';
  else if (c.status === 'expired') status = 'expired';

  // Extract title from message (first line)
  const messageParts = (c.message || '').split('\n\n');
  const title = messageParts[0] || c.title || 'Untitled';
  const description = messageParts.slice(1).join('\n\n') || c.description;

  return {
    id: c.id || c._id || '',
    creatorId: c.userId || c.creatorId || '',
    creatorUsername: c.creatorUsername || c.username || 'Unknown',
    creatorAvatar: c.creatorAvatar || c.profilePicture,
    title,
    description,
    coverImageUrl: c.coverImageUrl || (c.mediaType === 'image' ? c.mediaUrl : undefined),
    videoUrl: isUnlocked ? (c.videoUrl || (c.mediaType === 'video' ? c.mediaUrl : undefined)) : undefined,
    thumbnailUrl: c.thumbnailUrl,
    status,
    unlockAt: c.unlockAt || '',
    unlockedAt: c.unlockedAt,
    createdAt: c.createdAt || '',
    viewCount: c.viewCount || 0,
    likeCount: c.likeCount || 0,
    commentCount: c.commentCount || 0,
    isLiked: c.isLiked || false,
    isPrivate: c.recipientType === 'friends' || c.recipientType === 'self' || c.isPrivate || false,
    recipientIds: c.recipientIds,
    recipientUsernames: c.recipientUsernames,
    previewEnabled: c.previewEnabled || false,
    previewSeconds: c.previewSeconds,
    notifyOnUnlock: c.notifyOnUnlock ?? true,
  };
}

export const capsuleApi = {
  /**
   * Get upcoming capsule reveals (public discover)
   * Uses /capsules/public/discover for public unlocked capsules
   */
  async getUpcomingCapsules(page = 1, limit = 20): Promise<{ capsules: TimeCapsule[]; hasMore: boolean }> {
    try {
      const { data } = await apiClient.get<{ capsules: BackendCapsule[]; pagination?: { pages: number; page: number } }>('/capsules/public/discover', {
        params: { page, limit },
      });
      return {
        capsules: (data.capsules || []).map(transformCapsule),
        hasMore: data.pagination ? data.pagination.page < data.pagination.pages : false,
      };
    } catch (error) {
      logger.error('Error fetching upcoming capsules:', error);
      return { capsules: [], hasMore: false };
    }
  },

  /**
   * Get recently unlocked capsules (feed)
   * Uses /capsules/feed for capsules viewable by current user
   */
  async getUnlockedCapsules(page = 1, limit = 20): Promise<{ capsules: TimeCapsule[]; hasMore: boolean }> {
    try {
      const { data } = await apiClient.get<{ capsules: BackendCapsule[]; pagination?: { pages: number; page: number } }>('/capsules/feed', {
        params: { page, limit },
      });
      return {
        capsules: (data.capsules || []).map(transformCapsule),
        hasMore: data.pagination ? data.pagination.page < data.pagination.pages : false,
      };
    } catch (error) {
      logger.error('Error fetching unlocked capsules:', error);
      return { capsules: [], hasMore: false };
    }
  },

  /**
   * Get my capsules (created by me)
   */
  async getMyCapsules(): Promise<TimeCapsule[]> {
    try {
      const { data } = await apiClient.get<{ capsules: BackendCapsule[] }>('/capsules/my');
      return (data.capsules || []).map(transformCapsule);
    } catch (error) {
      logger.error('Error fetching my capsules:', error);
      return [];
    }
  },

  /**
   * Get capsules sent to me (from feed - includes friends' capsules)
   * Uses /capsules/feed which includes capsules shared with the user
   */
  async getReceivedCapsules(): Promise<TimeCapsule[]> {
    try {
      const { data } = await apiClient.get<{ capsules: BackendCapsule[] }>('/capsules/feed', {
        params: { limit: 50 },
      });
      return (data.capsules || []).map(transformCapsule);
    } catch (error) {
      logger.error('Error fetching received capsules:', error);
      return [];
    }
  },

  /**
   * Get a single capsule
   */
  async getCapsule(capsuleId: string): Promise<TimeCapsule> {
    const { data } = await apiClient.get<{ capsule: BackendCapsule }>(`/capsules/${capsuleId}`);
    return transformCapsule(data.capsule);
  },

  /**
   * Create a new time capsule
   */
  async createCapsule(input: Omit<CreateCapsuleInput, 'videoFile'>): Promise<TimeCapsule> {
    // Map frontend fields to backend format
    const recipientType = input.isPrivate
      ? (input.recipientIds && input.recipientIds.length > 0 ? 'friends' : 'self')
      : 'public';

    const payload = {
      message: [input.title, input.description].filter(Boolean).join('\n\n'),
      unlockAt: input.unlockAt,
      recipientType,
      recipientIds: input.recipientIds || [],
      mediaUrl: input.videoUrl || input.coverImageUrl,
      mediaType: input.videoUrl ? 'video' : (input.coverImageUrl ? 'image' : null),
    };

    const { data } = await apiClient.post<{ capsule: BackendCapsule }>('/capsules', payload);
    return transformCapsule(data.capsule);
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
