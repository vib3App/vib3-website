'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SideNav } from '@/components/ui/SideNav';
import { BottomNav } from '@/components/ui/BottomNav';

const requirements = [
  { id: 1, label: 'At least 10,000 followers', met: true, current: '45.2K' },
  { id: 2, label: 'At least 100,000 video views in last 30 days', met: true, current: '1.2M' },
  { id: 3, label: 'At least 18 years old', met: true, current: 'Verified' },
  { id: 4, label: 'Account in good standing', met: true, current: 'Good' },
  { id: 5, label: 'Posted at least 3 videos in last 30 days', met: true, current: '12 videos' },
];

const earningsHistory = [
  { month: 'December 2024', amount: 847.23, views: 1200000, status: 'pending' },
  { month: 'November 2024', amount: 723.45, views: 980000, status: 'paid' },
  { month: 'October 2024', amount: 612.89, views: 850000, status: 'paid' },
  { month: 'September 2024', amount: 534.12, views: 720000, status: 'paid' },
];

const tiers = [
  {
    name: 'Bronze',
    requirement: '10K followers',
    payout: '$0.01 per 1K views',
    color: 'from-amber-700 to-amber-900',
    current: false,
  },
  {
    name: 'Silver',
    requirement: '50K followers',
    payout: '$0.02 per 1K views',
    color: 'from-gray-400 to-gray-600',
    current: true,
  },
  {
    name: 'Gold',
    requirement: '100K followers',
    payout: '$0.04 per 1K views',
    color: 'from-yellow-400 to-amber-500',
    current: false,
  },
  {
    name: 'Platinum',
    requirement: '500K followers',
    payout: '$0.08 per 1K views',
    color: 'from-cyan-300 to-blue-400',
    current: false,
  },
  {
    name: 'Diamond',
    requirement: '1M+ followers',
    payout: '$0.15 per 1K views',
    color: 'from-purple-400 to-pink-400',
    current: false,
  },
];

export default function CreatorFundPage() {
  const [isEnrolled] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const totalEarnings = 2717.69;
  const pendingBalance = 847.23;
  const availableBalance = 1870.46;

  return (
    <div className="flex min-h-screen bg-neutral-950">
      <SideNav />
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Hero Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-500 to-teal-500" />
          <div className="relative px-6 py-12 text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-4">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              {isEnrolled ? 'Enrolled in Creator Fund' : 'Not Enrolled'}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Creator Fund</h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Get paid for creating amazing content. Earn money based on your video performance.
            </p>

            {/* Balance Cards */}
            {isEnrolled && (
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-6">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl px-8 py-6 min-w-[200px]">
                  <div className="text-4xl font-bold">${totalEarnings.toFixed(2)}</div>
                  <div className="text-white/80">Total Earnings</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-2xl px-8 py-6 min-w-[200px]">
                  <div className="text-4xl font-bold">${availableBalance.toFixed(2)}</div>
                  <div className="text-white/80">Available to Withdraw</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-2xl px-8 py-6 min-w-[200px]">
                  <div className="text-4xl font-bold">${pendingBalance.toFixed(2)}</div>
                  <div className="text-white/80">Pending</div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowWithdrawModal(true)}
              className="bg-white text-emerald-600 font-semibold px-8 py-3 rounded-full hover:bg-white/90 transition-colors"
            >
              {isEnrolled ? 'Withdraw Funds' : 'Apply Now'}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Tier Progress */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Your Tier</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`relative rounded-xl p-4 border-2 transition-all ${
                    tier.current
                      ? 'border-white bg-gradient-to-br ' + tier.color
                      : 'border-white/10 bg-neutral-900'
                  }`}
                >
                  {tier.current && (
                    <div className="absolute -top-2 -right-2 bg-white text-emerald-600 text-xs font-bold px-2 py-1 rounded-full">
                      Current
                    </div>
                  )}
                  <h3 className={`font-bold mb-1 ${tier.current ? 'text-white' : 'text-white/70'}`}>
                    {tier.name}
                  </h3>
                  <p className={`text-sm mb-2 ${tier.current ? 'text-white/80' : 'text-white/50'}`}>
                    {tier.requirement}
                  </p>
                  <p className={`text-xs ${tier.current ? 'text-white' : 'text-amber-500'}`}>
                    {tier.payout}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Eligibility Requirements */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Eligibility Requirements</h2>
            <div className="bg-neutral-900 rounded-xl border border-white/10 overflow-hidden">
              {requirements.map((req, index) => (
                <div
                  key={req.id}
                  className={`flex items-center justify-between p-4 ${
                    index < requirements.length - 1 ? 'border-b border-white/5' : ''
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
                  <span className={req.met ? 'text-green-500' : 'text-white/50'}>{req.current}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Earnings History */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Earnings History</h2>
            <div className="bg-neutral-900 rounded-xl border border-white/10 overflow-hidden">
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
                    {earningsHistory.map((entry) => (
                      <tr key={entry.month} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-6 py-4 text-white">{entry.month}</td>
                        <td className="px-6 py-4 text-right text-white/70">
                          {(entry.views / 1000000).toFixed(1)}M
                        </td>
                        <td className="px-6 py-4 text-right text-green-500 font-medium">
                          ${entry.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              entry.status === 'paid'
                                ? 'bg-green-500/20 text-green-500'
                                : 'bg-amber-500/20 text-amber-500'
                            }`}
                          >
                            {entry.status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Tips to Earn More */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Tips to Earn More</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-900 rounded-xl p-6 border border-white/10">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="text-white font-semibold mb-2">Post Consistently</h3>
                <p className="text-white/50 text-sm">
                  Upload at least 3-5 videos per week to maintain engagement and grow your audience.
                </p>
              </div>
              <div className="bg-neutral-900 rounded-xl p-6 border border-white/10">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-white font-semibold mb-2">Join Challenges</h3>
                <p className="text-white/50 text-sm">
                  Participate in trending challenges to increase your visibility and reach new audiences.
                </p>
              </div>
              <div className="bg-neutral-900 rounded-xl p-6 border border-white/10">
                <div className="text-3xl mb-3">💬</div>
                <h3 className="text-white font-semibold mb-2">Engage with Community</h3>
                <p className="text-white/50 text-sm">
                  Reply to comments and collaborate with other creators to build stronger connections.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowWithdrawModal(false)}
          >
            <div
              className="bg-neutral-900 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-2">Withdraw Funds</h2>
              <p className="text-white/50 mb-6">Available balance: ${availableBalance.toFixed(2)}</p>

              <div className="mb-4">
                <label className="block text-white/70 text-sm mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    max={availableBalance}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-white/70 text-sm mb-2">Withdraw to</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                  <option>PayPal (***@email.com)</option>
                  <option>Bank Account (****1234)</option>
                  <option>Add new payment method</option>
                </select>
              </div>

              <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity">
                Withdraw
              </button>
              <p className="text-white/30 text-xs text-center mt-4">
                Minimum withdrawal: $50. Processing time: 3-5 business days.
              </p>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
