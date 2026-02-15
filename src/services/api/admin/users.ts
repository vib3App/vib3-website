import { apiClient } from '../client';
import type { AdminUser, TeamMember, UserStats, UserRole } from './types';
import { logger } from '@/utils/logger';

export const adminUsersApi = {
  async getUsers(params?: { search?: string; role?: string; limit?: number; skip?: number }): Promise<{ users: AdminUser[]; total: number }> {
    try {
      const { data } = await apiClient.get('/admin/users', { params });
      return data;
    } catch (error) {
      logger.error('Failed to get users:', error);
      return { users: [], total: 0 };
    }
  },

  async getUser(userId: string): Promise<{ user: AdminUser } | null> {
    try {
      const { data } = await apiClient.get(`/admin/users/${userId}`);
      return data;
    } catch (error) {
      logger.error('Failed to get user:', error);
      return null;
    }
  },

  async changeUserRole(userId: string, role: UserRole): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await apiClient.post(`/admin/users/${userId}/role`, { role });
      return data;
    } catch (error) {
      logger.error('Failed to change user role:', error);
      return { success: false, message: 'Failed to change role' };
    }
  },

  async getUserStats(): Promise<UserStats> {
    try {
      const { data } = await apiClient.get('/admin/stats/users');
      return data;
    } catch (error) {
      logger.error('Failed to get user stats:', error);
      return { total: 0, admins: 0, moderators: 0, banned: 0, verified: 0, regularUsers: 0 };
    }
  },

  async getTeam(): Promise<{ team: TeamMember[] }> {
    try {
      const { data } = await apiClient.get('/admin/team');
      return data;
    } catch (error) {
      logger.error('Failed to get team:', error);
      return { team: [] };
    }
  },
};
