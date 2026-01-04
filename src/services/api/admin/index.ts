import { moderationApi } from './moderation';
import { adminUsersApi } from './users';

export const adminApi = {
  // Content Moderation
  getReports: moderationApi.getReports,
  getReportStats: moderationApi.getReportStats,
  takeAction: moderationApi.takeAction,
  banUser: moderationApi.banUser,
  warnUser: moderationApi.warnUser,

  // DMCA
  getDMCANotices: moderationApi.getDMCANotices,
  getDMCAStats: moderationApi.getDMCAStats,
  processDMCA: moderationApi.processDMCA,

  // Withdrawals
  getPendingWithdrawals: moderationApi.getPendingWithdrawals,
  getAllWithdrawals: moderationApi.getAllWithdrawals,
  approveWithdrawal: moderationApi.approveWithdrawal,
  rejectWithdrawal: moderationApi.rejectWithdrawal,

  // Flagged Reporters
  getFlaggedReporters: moderationApi.getFlaggedReporters,
  clearFlaggedStatus: moderationApi.clearFlaggedStatus,

  // User Management
  getUsers: adminUsersApi.getUsers,
  getUser: adminUsersApi.getUser,
  changeUserRole: adminUsersApi.changeUserRole,
  getUserStats: adminUsersApi.getUserStats,
  getTeam: adminUsersApi.getTeam,
};

export type {
  ContentReport,
  ReportStats,
  DMCANotice,
  WithdrawalRequest,
  FlaggedReporter,
  AdminUser,
  TeamMember,
  UserStats,
  UserRole,
  ModerationAction,
} from './types';
