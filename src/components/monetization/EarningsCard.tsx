'use client';

import {
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface EarningsCardProps {
  activeSubscribers: number;
  totalEarnings: number;
  pendingPayout: number;
}

export function EarningsCard({ activeSubscribers, totalEarnings, pendingPayout }: EarningsCardProps) {
  return (
    <div className="glass-card rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-teal-400/20">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <CurrencyDollarIcon className="w-5 h-5 text-white" />
          <h3 className="text-white font-medium">Your Earnings</h3>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <UserGroupIcon className="w-4 h-4 text-white/50" />
            </div>
            <p className="text-2xl font-bold text-white">{activeSubscribers}</p>
            <p className="text-white/50 text-xs">Subscribers</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CurrencyDollarIcon className="w-4 h-4 text-white/50" />
            </div>
            <p className="text-2xl font-bold text-white">${totalEarnings.toFixed(2)}</p>
            <p className="text-white/50 text-xs">Total Earned</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ClockIcon className="w-4 h-4 text-white/50" />
            </div>
            <p className="text-2xl font-bold text-white">${pendingPayout.toFixed(2)}</p>
            <p className="text-white/50 text-xs">Pending</p>
          </div>
        </div>
      </div>
    </div>
  );
}
