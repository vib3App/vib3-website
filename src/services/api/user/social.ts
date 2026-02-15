import { apiClient } from '../client';
import type { UserProfile, BlockedUser, Friend } from './types';

export const socialApi = {
  async searchUsers(query: string, limit: number = 20): Promise<UserProfile[]> {
    const { data } = await apiClient.get<{ users: UserProfile[] }>('/users/search', {
      params: { q: query, limit }
    });
    return data.users || [];
  },

  async getFriends(limit: number = 50): Promise<Friend[]> {
    const { data } = await apiClient.get<{ friends: Friend[] }>('/users/friends', {
      params: { limit }
    });
    return data.friends || [];
  },

  async blockUser(userId: string): Promise<void> {
    await apiClient.post(`/users/${userId}/block`);
  },

  async unblockUser(userId: string): Promise<void> {
    await apiClient.post(`/users/${userId}/unblock`);
  },

  async reportUser(userId: string, reason: string): Promise<void> {
    await apiClient.post(`/users/${userId}/report`, { reason });
  },

  async getBlockedUsers(page = 1, limit = 50): Promise<{ users: BlockedUser[]; hasMore: boolean }> {
    try {
      const { data } = await apiClient.get<{ users: BlockedUser[]; hasMore: boolean }>('/user/blocked', {
        params: { page, limit },
      });
      return data;
    } catch {
      return { users: [], hasMore: false };
    }
  },
};
