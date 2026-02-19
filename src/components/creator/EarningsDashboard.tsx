'use client';

import { useState, useEffect } from 'react';
import { creatorFundApi } from '@/services/api/creatorFund';
import { walletApi } from '@/services/api/wallet';
import type { DashboardData } from '@/types/creatorFund';
import { useToastStore } from '@/stores/toastStore';
import { logger } from '@/utils/logger';

/**
 * Gap #69: Creator Fund Dashboard
 * Earnings over time, monthly breakdown, payout history, payout request.
 */
export function EarningsDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [payouts, setPayouts] = useState<Array<{ id: string; amount: number; status: string; method: string; createdAt: string; completedAt?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [requestingPayout, setRequestingPayout] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashData, payoutData] = await Promise.all([
        creatorFundApi.getDashboard().catch(() => null),
        walletApi.getPayoutHistory().catch(() => []),
      ]);
      setDashboard(dashData);
      setPayouts(payoutData);
    } catch (err) {
      logger.error('Failed to load earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  const requestPayout = async () => {
    if (!dashboard?.balances?.availableBalance) return;
    setRequestingPayout(true);
    try {
      const methods = await walletApi.getPayoutMethods();
      const defaultMethod = methods.find(m => m.isDefault) || methods[0];
      if (!defaultMethod) {
        addToast('Please add a payout method first', 'error');
        return;
      }
      await walletApi.requestPayout(dashboard.balances.availableBalance, defaultMethod.id);
      addToast('Payout requested!', 'success');
      loadData();
    } catch (err) {
      logger.error('Payout request failed:', err);
      addToast('Payout request failed', 'error');
    } finally {
      setRequestingPayout(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  const balances = dashboard?.balances;
  const earnings = dashboard?.recentEarnings || [];
  const maxEarning = Math.max(...earnings.map(e => e.earnings), 1);

  return (
    <div className="space-y-6">
      {/* Balance summary */}
      <div className="bg-gradient-to-r from-purple-500/20 to-teal-500/20 border border-purple-500/30 rounded-2xl p-6">
        <h3 className="text-white/70 text-sm mb-1">Available Balance</h3>
        <div className="text-3xl font-bold text-white mb-4">
          ${((balances?.availableBalance || 0) / 100).toFixed(2)}
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-white/40">Total Earned</span>
            <p className="text-white font-medium">${((balances?.totalEarnings || 0) / 100).toFixed(2)}</p>
          </div>
          <div>
            <span className="text-white/40">Pending</span>
            <p className="text-yellow-400 font-medium">${((balances?.pendingBalance || 0) / 100).toFixed(2)}</p>
          </div>
          <div>
            <span className="text-white/40">Paid Out</span>
            <p className="text-green-400 font-medium">${((balances?.paidOut || 0) / 100).toFixed(2)}</p>
          </div>
        </div>
        {(balances?.availableBalance || 0) > 0 && (
          <button onClick={requestPayout} disabled={requestingPayout}
            className="mt-4 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-xl text-sm font-medium disabled:opacity-50">
            {requestingPayout ? 'Requesting...' : 'Request Payout'}
          </button>
        )}
      </div>

      {/* Earnings chart (simple bar chart) */}
      {earnings.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-white font-semibold mb-4">Monthly Earnings</h3>
          <div className="flex items-end gap-2 h-40">
            {earnings.slice(-12).map((e, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-gradient-to-t from-purple-500 to-teal-400 rounded-t-sm"
                  style={{ height: `${Math.max(4, (e.earnings / maxEarning) * 100)}%` }} />
                <span className="text-[9px] text-white/30 truncate w-full text-center">{e.period}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payout history */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-white font-semibold mb-3">Payout History</h3>
        {payouts.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-4">No payouts yet</p>
        ) : (
          <div className="space-y-2">
            {payouts.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white text-sm font-medium">${(p.amount / 100).toFixed(2)}</p>
                  <p className="text-white/30 text-xs">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tier info */}
      {dashboard?.membership && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-white font-semibold mb-2">Creator Tier</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-lg">
              {getTierEmoji(dashboard.membership.tier)}
            </div>
            <div>
              <p className="text-white font-medium capitalize">{dashboard.membership.tier}</p>
              <p className="text-white/40 text-xs">
                ${dashboard.membership.tierInfo?.payoutDisplay || '0'} per 1K views
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: 'text-green-400 bg-green-400/10',
    processing: 'text-yellow-400 bg-yellow-400/10',
    pending: 'text-blue-400 bg-blue-400/10',
    failed: 'text-red-400 bg-red-400/10',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
      {status}
    </span>
  );
}

function getTierEmoji(tier: string): string {
  const map: Record<string, string> = { bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💫', diamond: '💎' };
  return map[tier] || '🏆';
}
