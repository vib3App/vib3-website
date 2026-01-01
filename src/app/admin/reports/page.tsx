'use client';

import { useEffect, useState } from 'react';
import { adminApi, type ContentReport, type ModerationAction } from '@/services/api';

interface ReportWithUsers extends ContentReport {
  reporter?: {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
    unfoundedReportCount?: number;
  };
  reportedUser?: {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
    warningCount?: number;
  };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportWithUsers | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const { reports: reportsList } = await adminApi.getReports({ status: statusFilter });

      // Load user details for each report
      const reportsWithUsers = await Promise.all(
        reportsList.map(async (report) => {
          const [reporter, reportedUser] = await Promise.all([
            loadUserDetails(report.reporterId),
            loadUserDetails(report.contentId), // For user reports, contentId is the user
          ]);
          return { ...report, reporter, reportedUser };
        })
      );

      setReports(reportsWithUsers);
    } catch (err) {
      setError('Failed to load reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (userId: string) => {
    try {
      const { user } = await adminApi.getUser(userId);
      return user;
    } catch {
      return undefined;
    }
  };

  const handleAction = async (reportId: string, action: ModerationAction, notes?: string) => {
    setActionLoading(true);
    try {
      await adminApi.takeAction(reportId, action, notes);

      // Refresh reports
      await loadReports();
      setSelectedReport(null);

      // Show success message
      alert(`Action "${action}" completed successfully. Notifications sent.`);
    } catch (err) {
      console.error('Action failed:', err);
      alert('Failed to take action. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getActionColor = (action: ModerationAction) => {
    switch (action) {
      case 'dismiss':
        return 'bg-neutral-600 hover:bg-neutral-500';
      case 'warn_user':
        return 'bg-yellow-600 hover:bg-yellow-500';
      case 'remove_content':
        return 'bg-orange-600 hover:bg-orange-500';
      case 'shadow_ban':
        return 'bg-purple-600 hover:bg-purple-500';
      case 'ban_user':
        return 'bg-red-600 hover:bg-red-500';
      default:
        return 'bg-neutral-600';
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      spam: 'Spam',
      hate_speech: 'Hate Speech',
      violence: 'Violence',
      nudity: 'Nudity/Sexual Content',
      harassment: 'Harassment',
      misinformation: 'Misinformation',
      copyright: 'Copyright Violation',
      other: 'Other',
    };
    return labels[reason] || reason;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white text-xl">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Content Reports</h1>
          <p className="text-neutral-400 mt-1">Review and take action on user reports</p>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white"
        >
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {reports.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
          <p className="text-neutral-400">No {statusFilter} reports found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
            >
              {/* Report Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    report.status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                    report.status === 'reviewing' ? 'bg-blue-500/20 text-blue-400' :
                    report.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                    'bg-neutral-500/20 text-neutral-400'
                  }`}>
                    {report.status.toUpperCase()}
                  </div>
                  <span className="text-neutral-400 text-sm">
                    {new Date(report.createdAt).toLocaleDateString()} at{' '}
                    {new Date(report.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="px-3 py-1 bg-neutral-800 rounded-full text-sm text-white">
                  {report.contentType}
                </div>
              </div>

              {/* Reporter & Reported User */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Reporter Info */}
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <p className="text-neutral-400 text-sm mb-2">REPORTER</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center">
                      {report.reporter?.profilePicture ? (
                        <img
                          src={report.reporter.profilePicture}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {report.reporter?.username?.[0]?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {report.reporter?.username || 'Unknown User'}
                      </p>
                      <p className="text-neutral-400 text-sm">
                        {report.reporter?.email || report.reporterId}
                      </p>
                    </div>
                  </div>
                  {(report.reporter?.unfoundedReportCount || 0) > 0 && (
                    <div className="mt-2 px-2 py-1 bg-red-500/20 rounded text-red-400 text-xs">
                      {report.reporter?.unfoundedReportCount} unfounded reports
                    </div>
                  )}
                </div>

                {/* Reported User Info */}
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <p className="text-neutral-400 text-sm mb-2">REPORTED USER</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center">
                      {report.reportedUser?.profilePicture ? (
                        <img
                          src={report.reportedUser.profilePicture}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {report.reportedUser?.username?.[0]?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {report.reportedUser?.username || 'Unknown User'}
                      </p>
                      <p className="text-neutral-400 text-sm">
                        {report.reportedUser?.email || report.contentId}
                      </p>
                    </div>
                  </div>
                  {(report.reportedUser?.warningCount || 0) > 0 && (
                    <div className="mt-2 px-2 py-1 bg-yellow-500/20 rounded text-yellow-400 text-xs">
                      {report.reportedUser?.warningCount} previous warnings
                    </div>
                  )}
                </div>
              </div>

              {/* Report Details */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-neutral-400 text-sm">Reason:</span>
                  <span className="px-2 py-1 bg-red-500/20 rounded text-red-400 text-sm">
                    {getReasonLabel(report.reason)}
                  </span>
                </div>
                {report.description && (
                  <div className="bg-neutral-800/50 rounded-lg p-4">
                    <p className="text-neutral-400 text-sm mb-1">Description:</p>
                    <p className="text-white">{report.description}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {report.status === 'pending' || report.status === 'reviewing' ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleAction(report._id, 'dismiss', 'Allegation unfounded')}
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${getActionColor('dismiss')} disabled:opacity-50`}
                  >
                    Reject (Unfounded)
                  </button>
                  <button
                    onClick={() => handleAction(report._id, 'warn_user')}
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${getActionColor('warn_user')} disabled:opacity-50`}
                  >
                    Warn User
                  </button>
                  <button
                    onClick={() => handleAction(report._id, 'remove_content')}
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${getActionColor('remove_content')} disabled:opacity-50`}
                  >
                    Remove Content
                  </button>
                  <button
                    onClick={() => handleAction(report._id, 'shadow_ban')}
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${getActionColor('shadow_ban')} disabled:opacity-50`}
                  >
                    Shadow Ban
                  </button>
                  <button
                    onClick={() => handleAction(report._id, 'ban_user')}
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${getActionColor('ban_user')} disabled:opacity-50`}
                  >
                    Ban User
                  </button>
                </div>
              ) : (
                <div className="text-neutral-400 text-sm">
                  Resolved by {report.reviewedBy} on{' '}
                  {report.reviewedAt && new Date(report.reviewedAt).toLocaleDateString()}
                  {report.action && ` - Action: ${report.action}`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
