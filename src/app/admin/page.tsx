'use client';

import { useEffect, useState } from 'react';
import { adminApi, type ReportStats } from '@/services/api';
import Link from 'next/link';
import { logger } from '@/utils/logger';

interface DashboardStats {
  reports: ReportStats;
  dmca: { pending: number; processed: number; rejected: number };
  withdrawals: { pending: number };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [reportStats, dmcaStats, withdrawals] = await Promise.all([
        adminApi.getReportStats().catch(() => ({ pending: 0, reviewing: 0, resolved: 0, dismissed: 0 })),
        adminApi.getDMCAStats().catch(() => ({ pending: 0, processed: 0, rejected: 0 })),
        adminApi.getPendingWithdrawals().catch(() => ({ withdrawals: [] })),
      ]);

      setStats({
        reports: reportStats,
        dmca: dmcaStats,
        withdrawals: { pending: withdrawals.withdrawals?.length || 0 },
      });
    } catch (err) {
      setError('Failed to load dashboard stats');
      logger.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={loadStats}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-neutral-400 mt-2">
          Manage reports, DMCA notices, and user moderation
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pending Reports */}
        <Link
          href="/admin/reports"
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Pending Reports</p>
              <p className="text-4xl font-bold text-white mt-2">
                {stats?.reports.pending || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <p className="text-neutral-500 text-sm mt-4">
            {stats?.reports.reviewing || 0} reviewing, {stats?.reports.resolved || 0} resolved
          </p>
        </Link>

        {/* DMCA Notices */}
        <Link
          href="/admin/dmca"
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">DMCA Pending</p>
              <p className="text-4xl font-bold text-white mt-2">
                {stats?.dmca.pending || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-neutral-500 text-sm mt-4">
            {stats?.dmca.processed || 0} processed
          </p>
        </Link>

        {/* Withdrawals */}
        <Link
          href="/admin/withdrawals"
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Pending Withdrawals</p>
              <p className="text-4xl font-bold text-white mt-2">
                {stats?.withdrawals.pending || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-neutral-500 text-sm mt-4">
            Review pending requests
          </p>
        </Link>

        {/* Total Resolved */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Reports Resolved</p>
              <p className="text-4xl font-bold text-white mt-2">
                {(stats?.reports.resolved || 0) + (stats?.reports.dismissed || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-neutral-500 text-sm mt-4">
            {stats?.reports.dismissed || 0} dismissed
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/reports"
            className="flex items-center gap-3 p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Review Reports</p>
              <p className="text-neutral-400 text-sm">Handle user complaints</p>
            </div>
          </Link>

          <Link
            href="/admin/dmca"
            className="flex items-center gap-3 p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">DMCA Notices</p>
              <p className="text-neutral-400 text-sm">Copyright takedowns</p>
            </div>
          </Link>

          <Link
            href="/admin/flagged-reporters"
            className="flex items-center gap-3 p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Flagged Reporters</p>
              <p className="text-neutral-400 text-sm">Users with false reports</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
