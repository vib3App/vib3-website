/**
 * Admin API service
 * Re-exports from refactored admin module
 */
export { adminApi } from './admin/index';
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
} from './admin/index';
