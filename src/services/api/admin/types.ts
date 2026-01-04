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
