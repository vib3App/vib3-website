'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { TopNav } from '@/components/ui/TopNav';
import { creatorFundApi } from '@/services/api';
import type {
  DashboardData,
  EligibilityResponse,
  TierInfo,
  EarningPeriod,
  EarningsSummary,
} from '@/types/creatorFund';

const tierColors: Record<string, string> = {
  bronze: 'from-amber-700 to-amber-900',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-amber-500',
  platinum: 'from-cyan-300 to-blue-400',
  diamond: 'from-purple-400 to-pink-400',
};

function formatCount(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function CreatorFundPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(null);
  const [earnings, setEarnings] = useState<EarningPeriod[]>([]);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [paymentType, setPaymentType] = useState<'paypal' | 'bank'>('paypal');
  const [paymentEmail, setPaymentEmail] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard data
      const dashboardData = await creatorFundApi.getDashboard();
      setDashboard(dashboardData);

      if (dashboardData.isEnrolled) {
        // Get earnings if enrolled
        const earningsData = await creatorFundApi.getEarnings(12);
        setEarnings(earningsData.earnings);
        setSummary(earningsData.summary);
      } else {
        // Get eligibility if not enrolled
        const eligibilityData = await creatorFundApi.checkEligibility();
        setEligibility(eligibilityData);
      }
    } catch (err) {
      console.error('Error fetching creator fund data:', err);
      setError('Failed to load creator fund data');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setApplying(true);
      await creatorFundApi.apply();
      setShowApplyModal(false);
      await fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 50) {
      alert('Minimum withdrawal is $50');
      return;
    }
    if (summary && amount > summary.availableBalance) {
      alert('Insufficient balance');
      return;
    }

    try {
      setWithdrawing(true);
      const result = await creatorFundApi.withdraw(amount);
      alert(`Withdrawal requested! ${result.withdrawal.estimatedProcessing}`);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      await fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || 'Failed to request withdrawal');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleSavePaymentMethod = async () => {
    if (paymentType === 'paypal' && !paymentEmail) {
      alert('Please enter your PayPal email');
      return;
    }

    try {
      setSavingPayment(true);
      await creatorFundApi.updatePaymentMethod(paymentType, {
        email: paymentType === 'paypal' ? paymentEmail : undefined,
      });
      setShowPaymentModal(false);
      await fetchData();
    } catch (err) {
      console.error('Error saving payment method:', err);
      alert('Failed to save payment method');
    } finally {
      setSavingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen aurora-bg">
        <TopNav />
        <div className="flex items-center justify-center py-40">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen aurora-bg">
        <TopNav />
        <div className="text-center py-40">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isEnrolled = dashboard?.isEnrolled || false;
  const membership = dashboard?.membership;
  const balances = dashboard?.balances;
  const tiers = dashboard?.tiers || [];

  return (
    <div className="min-h-screen aurora-bg">
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8">
        {/* Header with Back Button */}
        <header className="sticky top-16 z-40 glass-heavy mx-4 mt-3 rounded-2xl mb-4">
          <div className="flex items-center gap-3 px-4 h-14">
            <Link href="/feed" className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </Link>
            <h1 className="text-xl font-bold text-white">Creator Fund</h1>
          </div>
        </header>

        {/* Hero Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/60 via-emerald-500/60 to-teal-500/60 backdrop-blur-3xl" />
          <div className="relative px-6 py-12 text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-4">
              <span className={`w-2 h-2 rounded-full animate-pulse ${isEnrolled ? 'bg-green-300' : 'bg-amber-300'}`} />
              {isEnrolled ? 'Enrolled in Creator Fund' : 'Not Enrolled'}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Creator Fund</h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Get paid for creating amazing content. Earn money based on your video performance.
            </p>

            {/* Balance Cards */}
            {isEnrolled && balances && (
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-6">
                <div className="glass-heavy rounded-2xl px-8 py-6 min-w-[200px]">
                  <div className="text-4xl font-bold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                    ${balances.totalEarnings.toFixed(2)}
                  </div>
                  <div className="text-white/70">Total Earnings</div>
                </div>
                <div className="glass-heavy rounded-2xl px-8 py-6 min-w-[200px]">
                  <div className="text-4xl font-bold text-white">${balances.availableBalance.toFixed(2)}</div>
                  <div className="text-white/70">Available to Withdraw</div>
                </div>
                <div className="glass-heavy rounded-2xl px-8 py-6 min-w-[200px]">
                  <div className="text-4xl font-bold text-white">${balances.pendingBalance.toFixed(2)}</div>
                  <div className="text-white/70">Pending</div>
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center flex-wrap">
              {isEnrolled ? (
                <>
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="bg-white text-emerald-600 font-semibold px-8 py-3 rounded-full hover:bg-white/90 transition-colors"
                  >
                    Withdraw Funds
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-white/20 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/30 transition-colors"
                  >
                    {membership?.paymentMethod ? 'Update Payment' : 'Add Payment Method'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="bg-white text-emerald-600 font-semibold px-8 py-3 rounded-full hover:bg-white/90 transition-colors"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Tier Progress */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              {isEnrolled ? 'Your Tier' : 'Payout Tiers'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`relative rounded-xl p-4 border-2 transition-all ${
                    tier.isCurrent
                      ? `border-white bg-gradient-to-br ${tierColors[tier.id]}`
                      : 'glass-card border-transparent'
                  }`}
                >
                  {tier.isCurrent && (
                    <div className="absolute -top-2 -right-2 bg-white text-emerald-600 text-xs font-bold px-2 py-1 rounded-full">
                      Current
                    </div>
                  )}
                  <h3 className={`font-bold mb-1 ${tier.isCurrent ? 'text-white' : 'text-white/70'}`}>{tier.name}</h3>
                  <p className={`text-sm mb-2 ${tier.isCurrent ? 'text-white/80' : 'text-white/50'}`}>
                    {formatCount(tier.minFollowers)} followers
                  </p>
                  <p className={`text-xs ${tier.isCurrent ? 'text-white' : 'text-amber-500'}`}>
                    ${tier.payoutPer1kViews.toFixed(2)} per 1K views
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Eligibility Requirements (shown if not enrolled) */}
          {!isEnrolled && eligibility && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Eligibility Requirements</h2>
              <div className="glass-card overflow-hidden">
                {eligibility.requirements.map((req, index) => (
                  <div
                    key={req.id}
                    className={`flex items-center justify-between p-4 ${
                      index < eligibility.requirements.length - 1 ? 'border-b border-white/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          req.met ? 'bg-green-500' : 'bg-white/10'
                        }`}
                      >
                        {req.met ? (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                      <span className="text-white/80">{req.label}</span>
                    </div>
                    <span className={req.met ? 'text-green-500' : 'text-white/50'}>{req.currentDisplay}</span>
                  </div>
                ))}
              </div>
              {!eligibility.isEligible && (
                <p className="text-white/50 text-sm mt-4 text-center">
                  Complete all requirements to apply for the Creator Fund
                </p>
              )}
            </section>
          )}

          {/* Earnings History (shown if enrolled) */}
          {isEnrolled && earnings.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Earnings History</h2>
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-white/50 text-sm font-medium px-6 py-4">Month</th>
                        <th className="text-right text-white/50 text-sm font-medium px-6 py-4">Views</th>
                        <th className="text-right text-white/50 text-sm font-medium px-6 py-4">Earnings</th>
                        <th className="text-right text-white/50 text-sm font-medium px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {earnings.map((entry) => (
                        <tr key={entry._id || entry.periodDisplay} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-6 py-4 text-white">{entry.periodDisplay}</td>
                          <td className="px-6 py-4 text-right text-white/70">{formatCount(entry.views)}</td>
                          <td className="px-6 py-4 text-right text-green-500 font-medium">
                            ${entry.earnings.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                entry.status === 'paid'
                                  ? 'bg-green-500/20 text-green-500'
                                  : entry.status === 'approved'
                                  ? 'bg-blue-500/20 text-blue-500'
                                  : 'bg-amber-500/20 text-amber-500'
                              }`}
                            >
                              {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* Empty earnings state */}
          {isEnrolled && earnings.length === 0 && (
            <section className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-white text-xl font-semibold mb-2">No earnings yet</h3>
              <p className="text-white/50">Start creating content to earn from the Creator Fund!</p>
            </section>
          )}

          {/* Tips to Earn More */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Tips to Earn More</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-6 hover:border-green-500/30">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="text-white font-semibold mb-2">Post Consistently</h3>
                <p className="text-white/50 text-sm">
                  Upload at least 3-5 videos per week to maintain engagement and grow your audience.
                </p>
              </div>
              <div className="glass-card p-6 hover:border-green-500/30">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-white font-semibold mb-2">Join Challenges</h3>
                <p className="text-white/50 text-sm">
                  Participate in trending challenges to increase your visibility and reach new audiences.
                </p>
              </div>
              <div className="glass-card p-6 hover:border-green-500/30">
                <div className="text-3xl mb-3">💬</div>
                <h3 className="text-white font-semibold mb-2">Engage with Community</h3>
                <p className="text-white/50 text-sm">
                  Reply to comments and collaborate with other creators to build stronger connections.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Apply Modal */}
        {showApplyModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowApplyModal(false)}
          >
            <div className="glass-heavy rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-white mb-2">Apply to Creator Fund</h2>
              <p className="text-white/50 mb-6">
                {eligibility?.isEligible
                  ? 'You meet all requirements! Apply now to start earning.'
                  : 'You need to meet all requirements before applying.'}
              </p>

              {eligibility?.isEligible && eligibility.potentialTier && (
                <div className="glass rounded-xl p-4 mb-6">
                  <p className="text-white/70 text-sm mb-1">You will start at</p>
                  <p className="text-white font-bold text-lg capitalize">{eligibility.potentialTier} Tier</p>
                </div>
              )}

              <button
                onClick={handleApply}
                disabled={applying || !eligibility?.isEligible}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {applying ? 'Applying...' : eligibility?.isEligible ? 'Apply Now' : 'Not Eligible'}
              </button>
            </div>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowWithdrawModal(false)}
          >
            <div className="glass-heavy rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-white mb-2">Withdraw Funds</h2>
              <p className="text-white/50 mb-6">Available balance: ${balances?.availableBalance.toFixed(2) || '0.00'}</p>

              {!membership?.paymentMethod && (
                <div className="bg-amber-500/20 text-amber-500 p-4 rounded-xl mb-6 text-sm">
                  Please add a payment method before withdrawing.
                </div>
              )}

              <div className="mb-4">
                <label className="block text-white/70 text-sm mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">$</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    min="50"
                    max={balances?.availableBalance || 0}
                    className="w-full glass rounded-xl pl-8 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>
              </div>

              {membership?.paymentMethod && (
                <div className="mb-6">
                  <label className="block text-white/70 text-sm mb-2">Withdraw to</label>
                  <div className="glass rounded-xl px-4 py-3 text-white">{membership.paymentMethod.display}</div>
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={withdrawing || !membership?.paymentMethod}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {withdrawing ? 'Processing...' : 'Withdraw'}
              </button>
              <p className="text-white/30 text-xs text-center mt-4">
                Minimum withdrawal: $50. Processing time: 3-5 business days.
              </p>
            </div>
          </div>
        )}

        {/* Payment Method Modal */}
        {showPaymentModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPaymentModal(false)}
          >
            <div className="glass-heavy rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-white mb-6">Payment Method</h2>

              <div className="mb-4">
                <label className="block text-white/70 text-sm mb-2">Payment Type</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setPaymentType('paypal')}
                    className={`flex-1 py-3 rounded-xl font-medium transition ${
                      paymentType === 'paypal'
                        ? 'bg-blue-500 text-white'
                        : 'glass text-white/70 hover:bg-white/10'
                    }`}
                  >
                    PayPal
                  </button>
                  <button
                    onClick={() => setPaymentType('bank')}
                    className={`flex-1 py-3 rounded-xl font-medium transition ${
                      paymentType === 'bank'
                        ? 'bg-blue-500 text-white'
                        : 'glass text-white/70 hover:bg-white/10'
                    }`}
                  >
                    Bank Account
                  </button>
                </div>
              </div>

              {paymentType === 'paypal' && (
                <div className="mb-6">
                  <label className="block text-white/70 text-sm mb-2">PayPal Email</label>
                  <input
                    type="email"
                    value={paymentEmail}
                    onChange={(e) => setPaymentEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>
              )}

              {paymentType === 'bank' && (
                <div className="mb-6 text-center text-white/50">
                  <p>Bank account setup requires verification.</p>
                  <p className="text-sm mt-2">Please use PayPal for now.</p>
                </div>
              )}

              <button
                onClick={handleSavePaymentMethod}
                disabled={savingPayment || (paymentType === 'paypal' && !paymentEmail)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {savingPayment ? 'Saving...' : 'Save Payment Method'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
