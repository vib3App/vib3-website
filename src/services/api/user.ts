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
   * Uses /videos/user/:userId endpoint for proper server-side filtering
   */
  async getUserVideos(userId: string, page: number = 1, limit: number = 100): Promise<UserVideosResponse> {
    try {
      // Use the backend's videos/user endpoint which properly filters by user
      const { data } = await apiClient.get<{ videos?: Array<Video & { _id?: string }> }>(`/videos/user/${userId}`, {
        params: { page, limit }
      });

      // Transform _id to id for consistency
      const videos = (data.videos || []).map(v => ({
        ...v,
        id: v.id || v._id || '',
      }));

      return { videos };
    } catch (error) {
      console.error('Failed to fetch user videos:', error);
      return { videos: [] };
    }
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
   * Get friends (mutual followers - people you follow who also follow you)
   */
  async getFriends(limit: number = 50): Promise<Array<{
    id: string;
    username: string;
    displayName?: string;
    avatar?: string;
    bio?: string;
  }>> {
    const { data } = await apiClient.get<{ friends: Array<{
      id: string;
      username: string;
      displayName?: string;
      avatar?: string;
      bio?: string;
    }> }>('/users/friends', {
      params: { limit }
    });
    return data.friends || [];
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
    try {
      const { data } = await apiClient.get<string[] | { followedUserIds: string[] }>('/user/followed-users');
      // Backend returns array directly, handle both formats for compatibility
      if (Array.isArray(data)) {
        return data;
      }
      return data.followedUserIds || [];
    } catch (error) {
      console.error('Failed to get followed users:', error);
      return [];
    }
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

  /**
   * Update user profile
   */
  async updateProfile(updates: {
    displayName?: string;
    bio?: string;
    profilePicture?: string;
  }): Promise<UserProfile> {
    const { data } = await apiClient.put<UserProfile>('/user/profile', updates);
    return data;
  },

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(formData: FormData): Promise<{ url: string }> {
    const { data } = await apiClient.post<{ url: string }>('/user/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Get user's followers
   */
  async getFollowers(userId: string, page = 1, limit = 20): Promise<{ users: UserProfile[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ users: UserProfile[]; hasMore: boolean }>(
      `/users/${userId}/followers`,
      { params: { page, limit } }
    );
    return data;
  },

  /**
   * Get users that a user is following
   */
  async getFollowing(userId: string, page = 1, limit = 20): Promise<{ users: UserProfile[]; hasMore: boolean }> {
    try {
      // Backend returns { following: [ids...] } - just IDs, not full user objects
      const { data } = await apiClient.get<{ following: string[]; users?: UserProfile[] }>(
        `/users/${userId}/following`,
        { params: { page, limit } }
      );

      // If backend returns full users (future), use those
      if (data.users) {
        return { users: data.users, hasMore: false };
      }

      // Otherwise fetch user details for each ID
      const followingIds = data.following || [];
      if (followingIds.length === 0) {
        return { users: [], hasMore: false };
      }

      // Fetch user details for each following ID (limit to avoid too many requests)
      const userPromises = followingIds.slice(0, limit).map(async (id) => {
        try {
          return await this.getProfile(id);
        } catch {
          return null;
        }
      });

      const usersRaw = await Promise.all(userPromises);
      const users = usersRaw.filter((u): u is UserProfile => u !== null);

      return { users, hasMore: followingIds.length > limit };
    } catch (error) {
      console.error('Failed to get following:', error);
      return { users: [], hasMore: false };
    }
  },

  /**
   * Get user's liked videos
   */
  async getLikedVideos(userId: string, page = 1, limit = 20): Promise<UserVideosResponse> {
    const { data } = await apiClient.get<UserVideosResponse>(`/users/${userId}/liked-videos`, {
      params: { page, limit },
    });
    return data;
  },

  /**
   * Block a user
   */
  async blockUser(userId: string): Promise<void> {
    await apiClient.post(`/users/${userId}/block`);
  },

  /**
   * Unblock a user
   */
  async unblockUser(userId: string): Promise<void> {
    await apiClient.post(`/users/${userId}/unblock`);
  },

  /**
   * Report a user
   */
  async reportUser(userId: string, reason: string): Promise<void> {
    await apiClient.post(`/users/${userId}/report`, { reason });
  },
};
