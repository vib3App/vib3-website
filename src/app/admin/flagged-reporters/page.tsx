'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { adminApi, type FlaggedReporter } from '@/services/api';
import { useToastStore } from '@/stores/toastStore';
import { useConfirmStore } from '@/stores/confirmStore';

export default function FlaggedReportersPage() {
  const addToast = useToastStore(s => s.addToast);
  const confirmDialog = useConfirmStore(s => s.show);
  const [reporters, setReporters] = useState<FlaggedReporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadReporters();
  }, []);

  const loadReporters = async () => {
    try {
      setLoading(true);
      const { users } = await adminApi.getFlaggedReporters();
      setReporters(users);
    } catch (err) {
      setError('Failed to load flagged reporters');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFlag = async (userId: string) => {
    setActionLoading(userId);
    try {
      await adminApi.clearFlaggedStatus(userId);
      // Remove from list
      setReporters(reporters.filter((r) => r._id !== userId));
    } catch (err) {
      console.error('Failed to clear flag:', err);
      addToast('Failed to clear flagged status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanUser = async (userId: string) => {
    const ok = await confirmDialog({ title: 'Ban User', message: 'Are you sure you want to ban this user for abusing the report system?', variant: 'danger', confirmText: 'Ban User' });
    if (!ok) return;

    setActionLoading(userId);
    try {
      await adminApi.banUser(userId, 'Abuse of report system - multiple unfounded reports');
      setReporters(reporters.filter((r) => r._id !== userId));
      addToast('User banned successfully', 'success');
    } catch (err) {
      console.error('Failed to ban user:', err);
      addToast('Failed to ban user');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white text-xl">Loading flagged reporters...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Flagged Reporters</h1>
        <p className="text-neutral-400 mt-1">
          Users with 3+ unfounded/dismissed reports are flagged for review
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {reporters.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-neutral-400">No flagged reporters at this time</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reporters.map((reporter) => (
            <div
              key={reporter._id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center">
                    {reporter.profilePicture ? (
                      <Image
                        src={reporter.profilePicture}
                        alt=""
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-red-400 text-xl font-bold">
                        {reporter.username?.[0]?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-white text-lg font-medium">{reporter.username}</p>
                    <p className="text-neutral-400">{reporter.email}</p>
                    <p className="text-neutral-500 text-sm">
                      Member since {new Date(reporter.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-3xl font-bold text-red-400">
                      {reporter.unfoundedReportCount}
                    </span>
                    <span className="text-neutral-400">unfounded reports</span>
                  </div>
                </div>
              </div>

              {/* Report History */}
              {reporter.unfoundedReports && reporter.unfoundedReports.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-800">
                  <p className="text-neutral-400 text-sm mb-2">Unfounded Report History:</p>
                  <div className="flex flex-wrap gap-2">
                    {reporter.unfoundedReports.map((report, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-neutral-800 rounded text-neutral-400 text-sm"
                      >
                        {new Date(report.dismissedAt).toLocaleDateString()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-neutral-800 flex gap-3">
                <button
                  onClick={() => handleClearFlag(reporter._id)}
                  disabled={actionLoading === reporter._id}
                  className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Clear Flag (Reviewed)
                </button>
                <button
                  onClick={() => handleBanUser(reporter._id)}
                  disabled={actionLoading === reporter._id}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Ban for Report Abuse
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
