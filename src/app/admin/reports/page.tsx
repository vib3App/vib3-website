'use client';

import { useEffect, useState } from 'react';
import { adminApi, type ContentReport, type ModerationAction } from '@/services/api';
import { useToastStore } from '@/stores/toastStore';
import { ReportCard } from '@/components/admin';
import { logger } from '@/utils/logger';

interface ReportWithUsers extends ContentReport {
  reporter?: { _id: string; username: string; email: string; profilePicture?: string; unfoundedReportCount?: number };
  reportedUser?: { _id: string; username: string; email: string; profilePicture?: string; warningCount?: number };
}

export default function ReportsPage() {
  const addToast = useToastStore(s => s.addToast);
  const [reports, setReports] = useState<ReportWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const loadUserDetails = async (userId: string) => {
      const result = await adminApi.getUser(userId);
      return result?.user;
    };
    const load = async () => {
      try {
        setLoading(true);
        const { reports: reportsList } = await adminApi.getReports({ status: statusFilter });
        const reportsWithUsers = await Promise.all(
          reportsList.map(async (report) => {
            const [reporter, reportedUser] = await Promise.all([
              loadUserDetails(report.reporterId),
              loadUserDetails(report.contentId),
            ]);
            return { ...report, reporter, reportedUser };
          })
        );
        if (!cancelled) {
          setReports(reportsWithUsers);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load reports');
        }
        logger.error(err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [statusFilter, refreshKey]);

  const handleAction = async (reportId: string, action: ModerationAction, notes?: string) => {
    setActionLoading(true);
    try {
      await adminApi.takeAction(reportId, action, notes);
      setRefreshKey(k => k + 1);
      addToast(`Action "${action}" completed successfully`, 'success');
    } catch (err) {
      logger.error('Action failed:', err);
      addToast('Failed to take action. Please try again.');
    } finally {
      setActionLoading(false);
    }
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
      <PageHeader statusFilter={statusFilter} onFilterChange={setStatusFilter} />
      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">{error}</div>}
      {reports.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
          <p className="text-neutral-400">No {statusFilter} reports found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard key={report._id} report={report} actionLoading={actionLoading} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
}

function PageHeader({ statusFilter, onFilterChange }: { statusFilter: string; onFilterChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-white">Content Reports</h1>
        <p className="text-neutral-400 mt-1">Review and take action on user reports</p>
      </div>
      <select
        value={statusFilter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white"
      >
        <option value="pending">Pending</option>
        <option value="reviewing">Reviewing</option>
        <option value="resolved">Resolved</option>
        <option value="dismissed">Dismissed</option>
      </select>
    </div>
  );
}
