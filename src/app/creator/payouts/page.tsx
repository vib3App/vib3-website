'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TopNav } from '@/components/ui/TopNav';
import { useAuthStore } from '@/stores/authStore';
import { walletApi } from '@/services/api';
import { formatCurrency } from '@/utils/format';

interface PayoutMethod {
  id: string;
  type: string;
  name: string;
  lastFour?: string;
  isDefault: boolean;
}

interface PayoutHistory {
  id: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
  completedAt?: string;
}

export default function PayoutsPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [balance, setBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [_showAddMethod, setShowAddMethod] = useState(false);

  useEffect(() => {
    if (!isAuthVerified) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/creator/payouts');
      return;
    }
    loadData();
  }, [isAuthenticated, isAuthVerified, router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [walletData, methods, history] = await Promise.all([
        walletApi.getBalance().catch(() => ({ balance: 0, pendingBalance: 0 })),
        walletApi.getPayoutMethods?.().catch(() => []) ?? Promise.resolve([]),
        walletApi.getPayoutHistory?.().catch(() => []) ?? Promise.resolve([]),
      ]);
      setBalance(walletData.balance ?? 0);
      setPendingBalance(walletData.pendingBalance ?? 0);
      setPayoutMethods(methods);
      setPayoutHistory(history);
      if (methods.length > 0) {
        const defaultMethod = methods.find((m: PayoutMethod) => m.isDefault);
        setSelectedMethod(defaultMethod?.id || methods[0].id);
      }
    } catch (error) {
      console.error('Failed to load payout data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0 || amount > balance) return;
    if (!selectedMethod) return;

    setIsWithdrawing(true);
    try {
      await walletApi.requestPayout?.(amount, selectedMethod);
      setWithdrawAmount('');
      loadData();
    } catch (error) {
      console.error('Failed to request payout:', error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/20';
      case 'processing': return 'text-yellow-400 bg-yellow-400/20';
      case 'pending': return 'text-blue-400 bg-blue-400/20';
      case 'failed': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen aurora-bg pb-20">
      <TopNav />

      <div className="px-4 pt-20 md:pt-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-white/70 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-white">Payouts</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6">
              <div className="text-sm text-white/60 mb-1">Available Balance</div>
              <div className="text-4xl font-bold text-white mb-4">{formatCurrency(balance)}</div>
              {pendingBalance > 0 && (
                <div className="text-sm text-white/50">
                  {formatCurrency(pendingBalance)} pending
                </div>
              )}
            </div>

            {/* Withdraw Section */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Withdraw Funds</h2>

              {payoutMethods.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-white/50 mb-4">Add a payout method to withdraw funds</p>
                  <button
                    onClick={() => setShowAddMethod(true)}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-full font-medium"
                  >
                    Add Payout Method
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">$</span>
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        max={balance}
                        step="0.01"
                        className="w-full bg-white/10 border border-white/10 rounded-xl px-8 py-3 text-white placeholder:text-white/30 outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs">
                      <span className="text-white/40">Min: $10.00</span>
                      <button
                        onClick={() => setWithdrawAmount(balance.toString())}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        Withdraw all
                      </button>
                    </div>
                  </div>

                  {/* Method Selection */}
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Payout Method</label>
                    <div className="space-y-2">
                      {payoutMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setSelectedMethod(method.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                            selectedMethod === method.id
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-white/10 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            {method.type === 'bank' && '🏦'}
                            {method.type === 'paypal' && '💳'}
                            {method.type === 'stripe' && '💰'}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-white font-medium">{method.name}</div>
                            {method.lastFour && (
                              <div className="text-white/50 text-sm">••••{method.lastFour}</div>
                            )}
                          </div>
                          {method.isDefault && (
                            <span className="text-xs text-purple-400">Default</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Withdraw Button */}
                  <button
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                    className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isWithdrawing ? 'Processing...' : 'Withdraw'}
                  </button>
                </div>
              )}
            </div>

            {/* Payout History */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Payout History</h2>

              {payoutHistory.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  No payouts yet
                </div>
              ) : (
                <div className="space-y-3">
                  {payoutHistory.map((payout) => (
                    <div
                      key={payout.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                    >
                      <div>
                        <div className="text-white font-medium">{formatCurrency(payout.amount)}</div>
                        <div className="text-white/50 text-sm">
                          {new Date(payout.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="text-center text-white/40 text-sm space-y-1">
              <p>Payouts are processed within 1-3 business days</p>
              <p>Minimum withdrawal: $10.00</p>
              <Link href="/settings/monetization" className="text-purple-400 hover:underline">
                Manage payout settings
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
