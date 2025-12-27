/**
 * User API service
 * Handles user operations: follow, profile, etc.
 */
import { apiClient } from './client';

export const userApi = {
  /**
   * Follow a user
   */
  async followUser(userId: string): Promise<{ following: boolean }> {
    const { data } = await apiClient.post<{ message: string }>(`/users/${userId}/follow`);
    return { following: true };
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(userId: string): Promise<{ following: boolean }> {
    const { data } = await apiClient.post<{ message: string }>(`/users/${userId}/unfollow`);
    return { following: false };
  },

  /**
   * Toggle follow status
   */
  async toggleFollow(userId: string, currentlyFollowing: boolean): Promise<{ following: boolean }> {
    if (currentlyFollowing) {
      return this.unfollowUser(userId);
    }
    return this.followUser(userId);
  },

  /**
   * Get user's followed user IDs
   */
  async getFollowedUsers(): Promise<string[]> {
    const { data } = await apiClient.get<{ followedUserIds: string[] }>('/user/followed-users');
    return data.followedUserIds || [];
  },
};
