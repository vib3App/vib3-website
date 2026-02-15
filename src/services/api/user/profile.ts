import { apiClient } from '../client';
import type { UserProfile } from './types';

export const profileApi = {
  async getProfile(userId: string): Promise<UserProfile> {
    const { data } = await apiClient.get<UserProfile>(`/users/${userId}`);
    return data;
  },

  async getMyProfile(): Promise<UserProfile> {
    const { data } = await apiClient.get<{ user?: UserProfile } & UserProfile>('/user/profile');
    const profile = data.user || data;

    if (!profile.stats) {
      profile.stats = {
        followers: profile.followers ?? profile.followersCount ?? 0,
        following: profile.following ?? profile.followingCount ?? 0,
        likes: profile.totalLikes ?? 0,
        videos: profile.videoCount ?? 0,
      };
    }

    return profile;
  },

  async updateProfile(updates: {
    displayName?: string;
    bio?: string;
    profilePicture?: string;
  }): Promise<UserProfile> {
    const { data } = await apiClient.put<UserProfile>('/user/profile', updates);
    return data;
  },

  async uploadProfilePicture(formData: FormData): Promise<{ url: string }> {
    const { data } = await apiClient.post<{ url: string }>('/user/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
