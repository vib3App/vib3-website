import { apiClient } from '../client';
import type { ContentReport, ReportStats, DMCANotice, WithdrawalRequest, FlaggedReporter, ModerationAction } from './types';
import { logger } from '@/utils/logger';

export const moderationApi = {
  async getReports(params?: { limit?: number; skip?: number; status?: string }): Promise<{ reports: ContentReport[]; count: number }> {
    try {
      const { data } = await apiClient.get('/content/admin/reports', { params });
      return data;
    } catch (error) {
      logger.error('Failed to get reports:', error);
      return { reports: [], count: 0 };
    }
  },

  async getReportStats(): Promise<ReportStats> {
    try {
      const { data } = await apiClient.get('/content/admin/reports/stats');
      return data;
    } catch (error) {
      logger.error('Failed to get report stats:', error);
      return { pending: 0, reviewing: 0, resolved: 0, dismissed: 0 };
    }
  },

  async takeAction(reportId: string, action: ModerationAction, notes?: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await apiClient.post(`/content/admin/reports/${reportId}/action`, { action, notes });
      return data;
    } catch (error) {
      logger.error('Failed to take action:', error);
      return { success: false, message: 'Failed to take action' };
    }
  },

  async banUser(userId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await apiClient.post(`/content/admin/user/${userId}/ban`, { reason });
      return data;
    } catch (error) {
      logger.error('Failed to ban user:', error);
      return { success: false, message: 'Failed to ban user' };
    }
  },

  async warnUser(userId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await apiClient.post(`/content/admin/user/${userId}/warn`, { reason });
      return data;
    } catch (error) {
      logger.error('Failed to warn user:', error);
      return { success: false, message: 'Failed to warn user' };
    }
  },

  async getDMCANotices(): Promise<{ notices: DMCANotice[] }> {
    try {
      const { data } = await apiClient.get('/dmca/admin/notices');
      return data;
    } catch (error) {
      logger.error('Failed to get DMCA notices:', error);
      return { notices: [] };
    }
  },

  async getDMCAStats(): Promise<{ pending: number; processed: number; rejected: number }> {
    try {
      const { data } = await apiClient.get('/dmca/admin/stats');
      return data;
    } catch (error) {
      logger.error('Failed to get DMCA stats:', error);
      return { pending: 0, processed: 0, rejected: 0 };
    }
  },

  async processDMCA(noticeId: string, action: 'approve' | 'reject', notes?: string): Promise<{ success: boolean }> {
    try {
      const { data } = await apiClient.post(`/dmca/admin/process/${noticeId}`, { action, notes });
      return data;
    } catch (error) {
      logger.error('Failed to process DMCA:', error);
      return { success: false };
    }
  },

  async getPendingWithdrawals(): Promise<{ withdrawals: WithdrawalRequest[] }> {
    try {
      const { data } = await apiClient.get('/balance/admin/withdrawals/pending');
      return data;
    } catch (error) {
      logger.error('Failed to get pending withdrawals:', error);
      return { withdrawals: [] };
    }
  },

  async getAllWithdrawals(): Promise<{ withdrawals: WithdrawalRequest[] }> {
    try {
      const { data } = await apiClient.get('/balance/admin/withdrawals');
      return data;
    } catch (error) {
      logger.error('Failed to get withdrawals:', error);
      return { withdrawals: [] };
    }
  },

  async approveWithdrawal(withdrawalId: string): Promise<{ success: boolean }> {
    try {
      const { data } = await apiClient.post(`/balance/admin/withdrawals/${withdrawalId}/approve`);
      return data;
    } catch (error) {
      logger.error('Failed to approve withdrawal:', error);
      return { success: false };
    }
  },

  async rejectWithdrawal(withdrawalId: string, reason?: string): Promise<{ success: boolean }> {
    try {
      const { data } = await apiClient.post(`/balance/admin/withdrawals/${withdrawalId}/reject`, { reason });
      return data;
    } catch (error) {
      logger.error('Failed to reject withdrawal:', error);
      return { success: false };
    }
  },

  async getFlaggedReporters(): Promise<{ users: FlaggedReporter[]; count: number }> {
    try {
      const { data } = await apiClient.get('/content/admin/flagged-reporters');
      return data;
    } catch (error) {
      logger.error('Failed to get flagged reporters:', error);
      return { users: [], count: 0 };
    }
  },

  async clearFlaggedStatus(userId: string): Promise<{ success: boolean }> {
    try {
      const { data } = await apiClient.post(`/content/admin/flagged-reporters/${userId}/clear`);
      return data;
    } catch (error) {
      logger.error('Failed to clear flagged status:', error);
      return { success: false };
    }
  },
};
