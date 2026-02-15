'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/services/api/admin';
import type { WithdrawalRequest } from '@/services/api/admin';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = statusFilter === 'pending'
          ? await adminApi.getPendingWithdrawals()
          : await adminApi.getAllWithdrawals();
        if (!cancelled) {
          setWithdrawals(res.withdrawals || []);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [statusFilter, refreshKey]);

  const triggerRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const result = await adminApi.approveWithdrawal(id);
      if (result.success) {
        triggerRefresh();
      }
    } catch (err) {
      console.error('Failed to approve withdrawal:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const result = await adminApi.rejectWithdrawal(id, rejectReason);
      if (result.success) {
        setShowRejectModal(null);
        setRejectReason('');
        triggerRefresh();
      }
    } catch (err) {
      console.error('Failed to reject withdrawal:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = statusFilter === 'all'
    ? withdrawals
    : withdrawals.filter(w => w.status === statusFilter);

  const pendingTotal = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + w.amount, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Withdrawal Requests</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-yellow-400">
            {withdrawals.filter(w => w.status === 'pending').length}
          </div>
          <div className="text-sm text-neutral-400">Pending Requests</div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-400">
            ${pendingTotal.toFixed(2)}
          </div>
          <div className="text-sm text-neutral-400">Pending Total</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((status) => (
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

      {/* Withdrawals List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          No {statusFilter === 'all' ? '' : statusFilter} withdrawal requests
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((withdrawal) => (
            <div
              key={withdrawal._id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-white font-medium">
                    ${withdrawal.amount.toFixed(2)}
                  </div>
                  <div className="text-neutral-500 text-sm">
                    via {withdrawal.method}
                  </div>
                </div>
                <div className="text-neutral-500 text-sm">
                  User: {withdrawal.userId}
                </div>
                <div className="text-neutral-600 text-xs">
                  {new Date(withdrawal.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    withdrawal.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : withdrawal.status === 'approved'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {withdrawal.status}
                </span>

                {withdrawal.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(withdrawal._id)}
                      disabled={processingId === withdrawal._id}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setShowRejectModal(withdrawal._id)}
                      disabled={processingId === withdrawal._id}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Reject Withdrawal</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white text-sm resize-none h-24 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                className="px-4 py-2 bg-neutral-700 text-white text-sm rounded-lg hover:bg-neutral-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={processingId === showRejectModal}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
