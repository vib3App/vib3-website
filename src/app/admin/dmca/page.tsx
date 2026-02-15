'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/services/api/admin';
import type { DMCANotice } from '@/services/api/admin';

type StatusFilter = 'all' | 'pending' | 'processed' | 'rejected';

export default function DMCAPage() {
  const [notices, setNotices] = useState<DMCANotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [stats, setStats] = useState({ pending: 0, processed: 0, rejected: 0 });
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [noticesRes, statsRes] = await Promise.all([
      adminApi.getDMCANotices(),
      adminApi.getDMCAStats(),
    ]);
    setNotices(noticesRes.notices || []);
    setStats(statsRes);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProcess = async (noticeId: string, action: 'approve' | 'reject') => {
    setProcessingId(noticeId);
    const result = await adminApi.processDMCA(noticeId, action);
    if (result.success) {
      await fetchData();
    }
    setProcessingId(null);
  };

  const filtered = statusFilter === 'all'
    ? notices
    : notices.filter(n => n.status === statusFilter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">DMCA Notices</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
          <div className="text-sm text-neutral-400">Pending</div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-400">{stats.processed}</div>
          <div className="text-sm text-neutral-400">Processed</div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-red-400">{stats.rejected}</div>
          <div className="text-sm text-neutral-400">Rejected</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'processed', 'rejected'] as StatusFilter[]).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              statusFilter === status
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Notices List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          No {statusFilter === 'all' ? '' : statusFilter} DMCA notices
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((notice) => (
            <div
              key={notice._id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-white font-medium">{notice.claimantName}</div>
                  <div className="text-neutral-500 text-sm">{notice.claimantEmail}</div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    notice.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : notice.status === 'processed'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {notice.status}
                </span>
              </div>

              <p className="text-neutral-300 text-sm mb-3">{notice.description}</p>

              <div className="text-sm text-neutral-500 mb-3 space-y-1">
                <div>
                  Content: <a href={notice.contentUrl} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">{notice.contentUrl}</a>
                </div>
                {notice.originalWorkUrl && (
                  <div>
                    Original: <a href={notice.originalWorkUrl} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">{notice.originalWorkUrl}</a>
                  </div>
                )}
                <div>Filed: {new Date(notice.createdAt).toLocaleDateString()}</div>
              </div>

              {notice.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleProcess(notice._id, 'approve')}
                    disabled={processingId === notice._id}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition disabled:opacity-50"
                  >
                    Takedown Content
                  </button>
                  <button
                    onClick={() => handleProcess(notice._id, 'reject')}
                    disabled={processingId === notice._id}
                    className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm rounded-lg transition disabled:opacity-50"
                  >
                    Reject Notice
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
