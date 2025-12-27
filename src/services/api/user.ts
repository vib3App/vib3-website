/**
 * User API service
 * Handles user operations: follow, profile, etc.
 */
import { apiClient } from './client';
import type { User, Video } from '@/types';

interface UserProfile {
  _id: string;
  username: string;
  displayName?: string;
  email?: string;
  profilePicture?: string;
  bio?: string;
  isVerified?: boolean;
  createdAt?: string;
  stats: {
    followers: number;
    following: number;
    likes: number;
    videos: number;
  };
}

interface UserVideosResponse {
  videos: Video[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export const userApi = {
  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const { data } = await apiClient.get<UserProfile>(`/users/${userId}`);
    return data;
  },

  /**
   * Get current user's profile
   */
  async getMyProfile(): Promise<UserProfile> {
    const { data } = await apiClient.get<UserProfile>('/user/profile');
    return data;
  },

  /**
   * Get user's videos
   */
  async getUserVideos(userId: string, page: number = 1, limit: number = 20): Promise<UserVideosResponse> {
    const { data } = await apiClient.get<UserVideosResponse>(`/videos`, {
      params: { userId, page, limit }
    });
    return data;
  },

  /**
   * Get current user's videos
   */
  async getMyVideos(page: number = 1, limit: number = 20): Promise<UserVideosResponse> {
    const { data } = await apiClient.get<UserVideosResponse>('/user/videos', {
      params: { page, limit }
    });
    return data;
  },

  /**
   * Search users
   */
  async searchUsers(query: string, limit: number = 20): Promise<UserProfile[]> {
    const { data } = await apiClient.get<{ users: UserProfile[] }>('/users/search', {
      params: { q: query, limit }
    });
    return data.users || [];
  },

  /**
   * Follow a user
   */
  async followUser(userId: string): Promise<{ following: boolean }> {
    await apiClient.post<{ message: string }>(`/users/${userId}/follow`);
    return { following: true };
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(userId: string): Promise<{ following: boolean }> {
    await apiClient.post<{ message: string }>(`/users/${userId}/unfollow`);
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

  /**
   * Check if following a user
   */
  async isFollowing(userId: string): Promise<boolean> {
    try {
      const followedUsers = await this.getFollowedUsers();
      return followedUsers.includes(userId);
    } catch {
      return false;
    }
  },
};
