/**
 * Admin API service
 * Handles moderation, reports, and admin actions
 */
import { apiClient } from './client';

// Types
export interface ContentReport {
  _id: string;
  contentId: string;
  contentType: 'video' | 'comment' | 'user' | 'message';
  reason: string;
  description: string;
  reporterId: string;
  reporterIp?: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  action?: string;
  notes?: string;
}

export interface ReportStats {
  pending: number;
  reviewing: number;
  resolved: number;
  dismissed: number;
}

export interface DMCANotice {
  _id: string;
  claimantName: string;
  claimantEmail: string;
  contentUrl: string;
  originalWorkUrl?: string;
  description: string;
  status: 'pending' | 'processed' | 'rejected';
  createdAt: string;
}

export interface WithdrawalRequest {
  _id: string;
  userId: string;
  amount: number;
  method: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface FlaggedReporter {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
  unfoundedReportCount: number;
  unfoundedReports: Array<{ reportId: string; dismissedAt: string }>;
  createdAt: string;
}

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
  role?: string;
  isAdmin?: boolean;
  effectiveRole: 'owner' | 'admin' | 'moderator' | 'user';
  isVerified?: boolean;
  accountStatus?: string;
  warningCount?: number;
  unfoundedReportCount?: number;
  createdAt: string;
  lastLoginAt?: string;
}

export interface TeamMember extends AdminUser {
  roleChangedAt?: string;
  roleChangedBy?: string;
}

export interface UserStats {
  total: number;
  admins: number;
  moderators: number;
  banned: number;
  verified: number;
  regularUsers: number;
}

export type UserRole = 'user' | 'moderator' | 'admin';

export type ModerationAction = 'remove_content' | 'warn_user' | 'ban_user' | 'shadow_ban' | 'dismiss';

export const adminApi = {
  // ============ Content Moderation ============

  /**
   * Get pending content reports
   */
  async getReports(params?: {
    limit?: number;
    skip?: number;
    status?: string;
  }): Promise<{ reports: ContentReport[]; count: number }> {
    try {
      const { data } = await apiClient.get('/content/admin/reports', { params });
      return data;
    } catch (error) {
      console.error('Failed to get reports:', error);
      return { reports: [], count: 0 };
    }
  },

  /**
   * Get report statistics
   */
  async getReportStats(): Promise<ReportStats> {
    try {
      const { data } = await apiClient.get('/content/admin/reports/stats');
      return data;
    } catch (error) {
      console.error('Failed to get report stats:', error);
      return { pending: 0, reviewing: 0, resolved: 0, dismissed: 0 };
    }
  },

  /**
   * Take moderation action on a report
   */
  async takeAction(reportId: string, action: ModerationAction, notes?: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await apiClient.post(`/content/admin/reports/${reportId}/action`, {
        action,
        notes,
      });
      return data;
    } catch (error) {
      console.error('Failed to take action:', error);
      return { success: false, message: 'Failed to take action' };
    }
  },

  /**
   * Ban a user directly
   */
  async banUser(userId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await apiClient.post(`/content/admin/user/${userId}/ban`, { reason });
      return data;
    } catch (error) {
      console.error('Failed to ban user:', error);
      return { success: false, message: 'Failed to ban user' };
    }
  },

  /**
   * Warn a user directly
   */
  async warnUser(userId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await apiClient.post(`/content/admin/user/${userId}/warn`, { reason });
      return data;
    } catch (error) {
      console.error('Failed to warn user:', error);
      return { success: false, message: 'Failed to warn user' };
    }
  },

  // ============ DMCA ============

  /**
   * Get DMCA notices
   */
  async getDMCANotices(): Promise<{ notices: DMCANotice[] }> {
    try {
      const { data } = await apiClient.get('/dmca/admin/notices');
      return data;
    } catch (error) {
      console.error('Failed to get DMCA notices:', error);
      return { notices: [] };
    }
  },

  /**
   * Get DMCA statistics
   */
  async getDMCAStats(): Promise<{ pending: number; processed: number; rejected: number }> {
    try {
      const { data } = await apiClient.get('/dmca/admin/stats');
      return data;
    } catch (error) {
      console.error('Failed to get DMCA stats:', error);
      return { pending: 0, processed: 0, rejected: 0 };
    }
  },

  /**
   * Process a DMCA notice
   */
  async processDMCA(noticeId: string, action: 'approve' | 'reject', notes?: string): Promise<{ success: boolean }> {
    try {
      const { data } = await apiClient.post(`/dmca/admin/process/${noticeId}`, { action, notes });
      return data;
    } catch (error) {
      console.error('Failed to process DMCA:', error);
      return { success: false };
    }
  },

  // ============ Withdrawals ============

  /**
   * Get pending withdrawal requests
   */
  async getPendingWithdrawals(): Promise<{ withdrawals: WithdrawalRequest[] }> {
    try {
      const { data } = await apiClient.get('/balance/admin/withdrawals/pending');
      return data;
    } catch (error) {
      console.error('Failed to get pending withdrawals:', error);
      return { withdrawals: [] };
    }
  },

  /**
   * Get all withdrawals
   */
  async getAllWithdrawals(): Promise<{ withdrawals: WithdrawalRequest[] }> {
    try {
      const { data } = await apiClient.get('/balance/admin/withdrawals');
      return data;
    } catch (error) {
      console.error('Failed to get withdrawals:', error);
      return { withdrawals: [] };
    }
  },

  /**
   * Approve a withdrawal
   */
  async approveWithdrawal(withdrawalId: string): Promise<{ success: boolean }> {
    try {
      const { data } = await apiClient.post(`/balance/admin/withdrawals/${withdrawalId}/approve`);
      return data;
    } catch (error) {
      console.error('Failed to approve withdrawal:', error);
      return { success: false };
    }
  },

  /**
   * Reject a withdrawal
   */
  async rejectWithdrawal(withdrawalId: string, reason?: string): Promise<{ success: boolean }> {
    try {
      const { data } = await apiClient.post(`/balance/admin/withdrawals/${withdrawalId}/reject`, { reason });
      return data;
    } catch (error) {
      console.error('Failed to reject withdrawal:', error);
      return { success: false };
    }
  },

  // ============ Flagged Reporters ============

  /**
   * Get users flagged for multiple unfounded reports
   */
  async getFlaggedReporters(): Promise<{ users: FlaggedReporter[]; count: number }> {
    try {
      const { data } = await apiClient.get('/content/admin/flagged-reporters');
      return data;
    } catch (error) {
      console.error('Failed to get flagged reporters:', error);
      return { users: [], count: 0 };
    }
  },

  /**
   * Clear flagged status for a user after review
   */
  async clearFlaggedStatus(userId: string): Promise<{ success: boolean }> {
    try {
      const { data } = await apiClient.post(`/content/admin/flagged-reporters/${userId}/clear`);
      return data;
    } catch (error) {
      console.error('Failed to clear flagged status:', error);
      return { success: false };
    }
  },

  // ============ User Management ============

  /**
   * Search and list users
   */
  async getUsers(params?: {
    search?: string;
    role?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ users: AdminUser[]; total: number }> {
    try {
      const { data } = await apiClient.get('/admin/users', { params });
      return data;
    } catch (error) {
      console.error('Failed to get users:', error);
      return { users: [], total: 0 };
    }
  },

  /**
   * Get single user details
   */
  async getUser(userId: string): Promise<{ user: AdminUser } | null> {
    try {
      const { data } = await apiClient.get(`/admin/users/${userId}`);
      return data;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  },

  /**
   * Change a user's role
   */
  async changeUserRole(userId: string, role: UserRole): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await apiClient.post(`/admin/users/${userId}/role`, { role });
      return data;
    } catch (error) {
      console.error('Failed to change user role:', error);
      return { success: false, message: 'Failed to change role' };
    }
  },

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const { data } = await apiClient.get('/admin/stats/users');
      return data;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return { total: 0, admins: 0, moderators: 0, banned: 0, verified: 0, regularUsers: 0 };
    }
  },

  /**
   * Get team members (admins & moderators)
   */
  async getTeam(): Promise<{ team: TeamMember[] }> {
    try {
      const { data } = await apiClient.get('/admin/team');
      return data;
    } catch (error) {
      console.error('Failed to get team:', error);
      return { team: [] };
    }
  },
};

