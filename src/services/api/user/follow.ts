import { apiClient } from '../client';
import type { UserProfile } from './types';
import { profileApi } from './profile';
import { logger } from '@/utils/logger';

// In-memory cache for followed users to prevent N+1 API calls.
// The social store also caches, but this protects direct followApi.isFollowing callers.
let followedUsersCache: string[] | null = null;
let followedUsersCacheTime = 0;
const FOLLOWED_CACHE_TTL = 60_000; // 1 minute

export const followApi = {
  async followUser(userId: string): Promise<{ following: boolean }> {
    await apiClient.post<{ message: string }>(`/users/${userId}/follow`);
    // Invalidate cache so next isFollowing check is fresh
    followedUsersCache = null;
    return { following: true };
  },

  async unfollowUser(userId: string): Promise<{ following: boolean }> {
    await apiClient.post<{ message: string }>(`/users/${userId}/unfollow`);
    // Invalidate cache so next isFollowing check is fresh
    followedUsersCache = null;
    return { following: false };
  },

  async toggleFollow(userId: string, currentlyFollowing: boolean): Promise<{ following: boolean }> {
    if (currentlyFollowing) {
      return this.unfollowUser(userId);
    }
    return this.followUser(userId);
  },

  async getFollowedUsers(): Promise<string[]> {
    // Return cached result if still valid
    if (followedUsersCache && Date.now() - followedUsersCacheTime < FOLLOWED_CACHE_TTL) {
      return followedUsersCache;
    }

    try {
      const { data } = await apiClient.get<string[] | { followedUserIds: string[] }>('/user/followed-users');
      const result = Array.isArray(data) ? data : (data.followedUserIds || []);
      followedUsersCache = result;
      followedUsersCacheTime = Date.now();
      return result;
    } catch (error) {
      logger.error('Failed to get followed users:', error);
      return [];
    }
  },

  async isFollowing(userId: string): Promise<boolean> {
    try {
      const followedUsers = await this.getFollowedUsers();
      return followedUsers.includes(userId);
    } catch {
      return false;
    }
  },

  /** Clear the in-memory followed-users cache (e.g. on logout) */
  clearCache() {
    followedUsersCache = null;
    followedUsersCacheTime = 0;
  },

  async getFollowers(userId: string, page = 1, limit = 20): Promise<{ users: UserProfile[]; hasMore: boolean }> {
    const { data } = await apiClient.get<{ users: UserProfile[]; hasMore: boolean }>(
      `/users/${userId}/followers`,
      { params: { page, limit } }
    );
    return data;
  },

  async getFollowing(userId: string, page = 1, limit = 20): Promise<{ users: UserProfile[]; hasMore: boolean }> {
    try {
      const { data } = await apiClient.get<{ following: string[]; users?: UserProfile[] }>(
        `/users/${userId}/following`,
        { params: { page, limit } }
      );

      if (data.users) {
        return { users: data.users, hasMore: false };
      }

      const followingIds = data.following || [];
      if (followingIds.length === 0) {
        return { users: [], hasMore: false };
      }

      const userPromises = followingIds.slice(0, limit).map(async (id) => {
        try {
          return await profileApi.getProfile(id);
        } catch {
          return null;
        }
      });

      const usersRaw = await Promise.all(userPromises);
      const users = usersRaw.filter((u): u is UserProfile => u !== null);

      return { users, hasMore: followingIds.length > limit };
    } catch (error) {
      logger.error('Failed to get following:', error);
      return { users: [], hasMore: false };
    }
  },
};
