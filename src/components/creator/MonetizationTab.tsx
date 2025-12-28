'use client';

import Link from 'next/link';
import { GiftIcon, UserGroupIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import type { CoinBalance, CreatorAnalytics } from '@/types/creator';
import { formatCount, formatCurrency } from '@/utils/format';

interface MonetizationTabProps {
  coinBalance: CoinBalance | null;
  analytics: CreatorAnalytics | null;
}

function BalanceCard({ coinBalance }: { coinBalance: CoinBalance }) {
  return (
    <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-400 mb-1">Your Coin Balance</div>
          <div className="text-4xl font-bold flex items-center gap-2">
            <span className="text-yellow-400">💰</span>
            {formatCount(coinBalance.balance)}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            ≈ {formatCurrency(coinBalance.balance * 0.5)} USD
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href="/creator/payouts"
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-medium hover:opacity-90 transition"
          >
            Withdraw
          </Link>
          <Link
            href="/coins"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-medium transition text-center"
          >
            Buy Coins
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
        <div>
          <div className="text-sm text-gray-400">Total Earned</div>
          <div className="text-xl font-semibold">{formatCount(coinBalance.totalEarned)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Total Spent</div>
          <div className="text-xl font-semibold">{formatCount(coinBalance.totalSpent)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Pending</div>
          <div className="text-xl font-semibold">{formatCount(coinBalance.pendingBalance)}</div>
        </div>
      </div>
    </div>
  );
}

function MonetizationOptions({ analytics }: { analytics: CreatorAnalytics | null }) {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <div className="bg-white/5 rounded-2xl p-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
          <GiftIcon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Gifts</h3>
        <p className="text-sm text-gray-400 mb-4">
          Receive virtual gifts from your supporters during videos and live streams.
        </p>
        <div className="text-2xl font-bold text-yellow-400">
          {analytics ? formatCount(analytics.revenueBreakdown.gifts / 100) : 0} coins
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
          <UserGroupIcon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Subscriptions</h3>
        <p className="text-sm text-gray-400 mb-4">
          Offer exclusive content to paying subscribers with monthly memberships.
        </p>
        <Link href="/creator/subscriptions" className="text-pink-400 text-sm hover:underline">
          Set up subscriptions →
        </Link>
      </div>

      <div className="bg-white/5 rounded-2xl p-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mb-4">
          <CreditCardIcon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Tips</h3>
        <p className="text-sm text-gray-400 mb-4">
          Allow fans to send you one-time tips to show their support.
        </p>
        <Link href="/creator/settings" className="text-pink-400 text-sm hover:underline">
          Enable tips →
        </Link>
      </div>
    </div>
  );
}

export function MonetizationTab({ coinBalance, analytics }: MonetizationTabProps) {
  return (
    <div className="space-y-6">
      {coinBalance && <BalanceCard coinBalance={coinBalance} />}
      <MonetizationOptions analytics={analytics} />
      <section>
        <h2 className="text-lg font-semibold mb-4">Recent Gifts</h2>
        <div className="bg-white/5 rounded-xl p-4 text-center text-gray-400">
          No gifts received yet
        </div>
      </section>
    </div>
  );
}
