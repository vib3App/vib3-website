import { apiClient } from './client';
import type { Achievement, AchievementStats, LeaderboardEntry } from '@/types/achievement';

interface UserAchievementsResponse {
  achievements: Achievement[];
  stats?: AchievementStats;
}

export const achievementsApi = {
  // Get all achievement definitions
  async getAllAchievements(): Promise<Achievement[]> {
    try {
      const response = await apiClient.get('/api/achievements');
      return response.data.achievements || response.data || [];
    } catch (error) {
      console.error('Failed to get achievements:', error);
      return [];
    }
  },

  // Get current user's achievements
  async getUserAchievements(): Promise<UserAchievementsResponse> {
    try {
      const response = await apiClient.get('/api/achievements/user');
      return {
        achievements: response.data.achievements || [],
        stats: response.data.stats,
      };
    } catch (error) {
      console.error('Failed to get user achievements:', error);
      return { achievements: [] };
    }
  },

  // Get another user's achievements (public)
  async getOtherUserAchievements(userId: string): Promise<UserAchievementsResponse> {
    try {
      const response = await apiClient.get(`/api/achievements/user/${userId}`);
      return {
        achievements: response.data.achievements || [],
        stats: response.data.stats,
      };
    } catch (error) {
      console.error('Failed to get other user achievements:', error);
      return { achievements: [] };
    }
  },

  // Check for newly unlocked achievements
  async checkAchievements(): Promise<Achievement[]> {
    try {
      const response = await apiClient.post('/api/achievements/check');
      return response.data.newlyUnlocked || [];
    } catch (error) {
      console.error('Failed to check achievements:', error);
      return [];
    }
  },

  // Get XP leaderboard
  async getLeaderboard(limit = 50, offset = 0): Promise<LeaderboardEntry[]> {
    try {
      const response = await apiClient.get('/api/achievements/leaderboard', {
        params: { limit, offset },
      });
      return response.data.entries || response.data || [];
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      return [];
    }
  },
};
