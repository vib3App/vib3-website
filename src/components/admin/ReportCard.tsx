'use client';

import Image from 'next/image';
import type { ContentReport, ModerationAction } from '@/services/api';

interface ReportUser {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
  unfoundedReportCount?: number;
  warningCount?: number;
}

interface ReportWithUsers extends ContentReport {
  reporter?: ReportUser;
  reportedUser?: ReportUser;
}

interface ReportCardProps {
  report: ReportWithUsers;
  actionLoading: boolean;
  onAction: (reportId: string, action: ModerationAction, notes?: string) => void;
}

const ACTION_COLORS: Record<ModerationAction, string> = {
  dismiss: 'bg-neutral-600 hover:bg-neutral-500',
  warn_user: 'bg-yellow-600 hover:bg-yellow-500',
  remove_content: 'bg-orange-600 hover:bg-orange-500',
  shadow_ban: 'bg-purple-600 hover:bg-purple-500',
  ban_user: 'bg-red-600 hover:bg-red-500',
};

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  hate_speech: 'Hate Speech',
  violence: 'Violence',
  nudity: 'Nudity/Sexual Content',
  harassment: 'Harassment',
  misinformation: 'Misinformation',
  copyright: 'Copyright Violation',
  other: 'Other',
};

export function ReportCard({ report, actionLoading, onAction }: ReportCardProps) {
  const isActionable = report.status === 'pending' || report.status === 'reviewing';

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <ReportHeader report={report} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <UserInfoCard label="REPORTER" user={report.reporter} fallbackId={report.reporterId} warningType="unfounded" />
        <UserInfoCard label="REPORTED USER" user={report.reportedUser} fallbackId={report.contentId} warningType="warning" />
      </div>
      <ReportDetails report={report} />
      {isActionable ? (
        <ActionButtons reportId={report._id} loading={actionLoading} onAction={onAction} />
      ) : (
        <ResolvedInfo report={report} />
      )}
    </div>
  );
}

function ReportHeader({ report }: { report: ReportWithUsers }) {
  const statusColors: Record<string, string> = {
    pending: 'bg-orange-500/20 text-orange-400',
    reviewing: 'bg-blue-500/20 text-blue-400',
    resolved: 'bg-green-500/20 text-green-400',
  };

  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[report.status] || 'bg-neutral-500/20 text-neutral-400'}`}>
          {report.status.toUpperCase()}
        </div>
        <span className="text-neutral-400 text-sm">
          {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString()}
        </span>
      </div>
      <div className="px-3 py-1 bg-neutral-800 rounded-full text-sm text-white">{report.contentType}</div>
    </div>
  );
}

function UserInfoCard({ label, user, fallbackId, warningType }: { label: string; user?: ReportUser; fallbackId: string; warningType: 'unfounded' | 'warning' }) {
  const warningCount = warningType === 'unfounded' ? user?.unfoundedReportCount : user?.warningCount;
  const warningLabel = warningType === 'unfounded' ? 'unfounded reports' : 'previous warnings';
  const warningColor = warningType === 'unfounded' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400';

  return (
    <div className="bg-neutral-800/50 rounded-lg p-4">
      <p className="text-neutral-400 text-sm mb-2">{label}</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center">
          {user?.profilePicture ? (
            <Image src={user.profilePicture} alt={(user.username || "User") + "'s avatar"} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <span className="text-white font-medium">{user?.username?.[0]?.toUpperCase() || '?'}</span>
          )}
        </div>
        <div>
          <p className="text-white font-medium">{user?.username || 'Unknown User'}</p>
          <p className="text-neutral-400 text-sm">{user?.email || fallbackId}</p>
        </div>
      </div>
      {(warningCount || 0) > 0 && (
        <div className={`mt-2 px-2 py-1 ${warningColor} rounded text-xs`}>{warningCount} {warningLabel}</div>
      )}
    </div>
  );
}

function ReportDetails({ report }: { report: ReportWithUsers }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-neutral-400 text-sm">Reason:</span>
        <span className="px-2 py-1 bg-red-500/20 rounded text-red-400 text-sm">{REASON_LABELS[report.reason] || report.reason}</span>
      </div>
      {report.description && (
        <div className="bg-neutral-800/50 rounded-lg p-4">
          <p className="text-neutral-400 text-sm mb-1">Description:</p>
          <p className="text-white">{report.description}</p>
        </div>
      )}
    </div>
  );
}

function ActionButtons({ reportId, loading, onAction }: { reportId: string; loading: boolean; onAction: (id: string, action: ModerationAction, notes?: string) => void }) {
  const actions: { action: ModerationAction; label: string }[] = [
    { action: 'dismiss', label: 'Reject (Unfounded)' },
    { action: 'warn_user', label: 'Warn User' },
    { action: 'remove_content', label: 'Remove Content' },
    { action: 'shadow_ban', label: 'Shadow Ban' },
    { action: 'ban_user', label: 'Ban User' },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map(({ action, label }) => (
        <button
          key={action}
          onClick={() => onAction(reportId, action, action === 'dismiss' ? 'Allegation unfounded' : undefined)}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${ACTION_COLORS[action]} disabled:opacity-50`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ResolvedInfo({ report }: { report: ReportWithUsers }) {
  return (
    <div className="text-neutral-400 text-sm">
      Resolved by {report.reviewedBy} on {report.reviewedAt && new Date(report.reviewedAt).toLocaleDateString()}
      {report.action && ` - Action: ${report.action}`}
    </div>
  );
}
