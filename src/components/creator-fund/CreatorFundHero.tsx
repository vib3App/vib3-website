'use client';

import type { DashboardData } from '@/types/creatorFund';

interface CreatorFundHeroProps {
  isEnrolled: boolean;
  balances?: DashboardData['balances'];
  membership?: DashboardData['membership'];
  onWithdraw: () => void;
  onUpdatePayment: () => void;
  onApply: () => void;
}

export function CreatorFundHero({
  isEnrolled,
  balances,
  membership,
  onWithdraw,
  onUpdatePayment,
  onApply,
}: CreatorFundHeroProps) {
  return (
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
                onClick={onWithdraw}
                className="bg-white text-emerald-600 font-semibold px-8 py-3 rounded-full hover:bg-white/90 transition-colors"
              >
                Withdraw Funds
              </button>
              <button
                onClick={onUpdatePayment}
                className="bg-white/20 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/30 transition-colors"
              >
                {membership?.paymentMethod ? 'Update Payment' : 'Add Payment Method'}
              </button>
            </>
          ) : (
            <button
              onClick={onApply}
              className="bg-white text-emerald-600 font-semibold px-8 py-3 rounded-full hover:bg-white/90 transition-colors"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
