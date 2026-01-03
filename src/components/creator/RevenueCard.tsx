'use client';

import Link from 'next/link';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import type { CreatorAnalytics } from '@/types/creator';
import { formatCurrency } from '@/utils/format';

interface RevenueCardProps {
  analytics: CreatorAnalytics;
}

export function RevenueCard({ analytics }: RevenueCardProps) {
  const overview = analytics?.overview;
  const breakdown = analytics?.revenueBreakdown;

  return (
    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
            <BanknotesIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-400">Total Revenue</div>
            <div className="text-3xl font-bold">{formatCurrency(overview?.totalRevenue ?? 0)}</div>
          </div>
        </div>
        <Link
          href="/creator/payouts"
          className="px-4 py-2 bg-yellow-500 text-black rounded-full font-medium text-sm hover:bg-yellow-400 transition"
        >
          Withdraw
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
        <div>
          <div className="text-sm text-gray-400">From Gifts</div>
          <div className="text-lg font-semibold">{formatCurrency(breakdown?.gifts ?? 0)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">From Subscriptions</div>
          <div className="text-lg font-semibold">{formatCurrency(breakdown?.subscriptions ?? 0)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Pending</div>
          <div className="text-lg font-semibold">{formatCurrency(breakdown?.pending ?? 0)}</div>
        </div>
      </div>
    </div>
  );
}
