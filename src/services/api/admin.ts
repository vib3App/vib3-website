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
    const { data } = await apiClient.get('/content/admin/reports', { params });
    return data;
  },

  /**
   * Get report statistics
   */
  async getReportStats(): Promise<ReportStats> {
    const { data } = await apiClient.get('/content/admin/reports/stats');
    return data;
  },

  /**
   * Take moderation action on a report
   */
  async takeAction(reportId: string, action: ModerationAction, notes?: string): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.post(`/content/admin/reports/${reportId}/action`, {
      action,
      notes,
    });
    return data;
  },

  /**
   * Ban a user directly
   */
  async banUser(userId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.post(`/content/admin/user/${userId}/ban`, { reason });
    return data;
  },

  /**
   * Warn a user directly
   */
  async warnUser(userId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.post(`/content/admin/user/${userId}/warn`, { reason });
    return data;
  },

  // ============ DMCA ============

  /**
   * Get DMCA notices
   */
  async getDMCANotices(): Promise<{ notices: DMCANotice[] }> {
    const { data } = await apiClient.get('/dmca/admin/notices');
    return data;
  },

  /**
   * Get DMCA statistics
   */
  async getDMCAStats(): Promise<{ pending: number; processed: number; rejected: number }> {
    const { data } = await apiClient.get('/dmca/admin/stats');
    return data;
  },

  /**
   * Process a DMCA notice
   */
  async processDMCA(noticeId: string, action: 'approve' | 'reject', notes?: string): Promise<{ success: boolean }> {
    const { data } = await apiClient.post(`/dmca/admin/process/${noticeId}`, { action, notes });
    return data;
  },

  // ============ Withdrawals ============

  /**
   * Get pending withdrawal requests
   */
  async getPendingWithdrawals(): Promise<{ withdrawals: WithdrawalRequest[] }> {
    const { data } = await apiClient.get('/balance/admin/withdrawals/pending');
    return data;
  },

  /**
   * Get all withdrawals
   */
  async getAllWithdrawals(): Promise<{ withdrawals: WithdrawalRequest[] }> {
    const { data } = await apiClient.get('/balance/admin/withdrawals');
    return data;
  },

  /**
   * Approve a withdrawal
   */
  async approveWithdrawal(withdrawalId: string): Promise<{ success: boolean }> {
    const { data } = await apiClient.post(`/balance/admin/withdrawals/${withdrawalId}/approve`);
    return data;
  },

  /**
   * Reject a withdrawal
   */
  async rejectWithdrawal(withdrawalId: string, reason?: string): Promise<{ success: boolean }> {
    const { data } = await apiClient.post(`/balance/admin/withdrawals/${withdrawalId}/reject`, { reason });
    return data;
  },

  // ============ Flagged Reporters ============

  /**
   * Get users flagged for multiple unfounded reports
   */
  async getFlaggedReporters(): Promise<{ users: FlaggedReporter[]; count: number }> {
    const { data } = await apiClient.get('/content/admin/flagged-reporters');
    return data;
  },

  /**
   * Clear flagged status for a user after review
   */
  async clearFlaggedStatus(userId: string): Promise<{ success: boolean }> {
    const { data } = await apiClient.post(`/content/admin/flagged-reporters/${userId}/clear`);
    return data;
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
    const { data } = await apiClient.get('/admin/users', { params });
    return data;
  },

  /**
   * Get single user details
   */
  async getUser(userId: string): Promise<{ user: AdminUser }> {
    const { data } = await apiClient.get(`/admin/users/${userId}`);
    return data;
  },

  /**
   * Change a user's role
   */
  async changeUserRole(userId: string, role: UserRole): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.post(`/admin/users/${userId}/role`, { role });
    return data;
  },

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    const { data } = await apiClient.get('/admin/stats/users');
    return data;
  },

  /**
   * Get team members (admins & moderators)
   */
  async getTeam(): Promise<{ team: TeamMember[] }> {
    const { data } = await apiClient.get('/admin/team');
    return data;
  },
};
