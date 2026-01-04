'use client';

import type { TierInfo } from '@/types/creatorFund';

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

interface TierProgressSectionProps {
  tiers: TierInfo[];
  isEnrolled: boolean;
}

export function TierProgressSection({ tiers, isEnrolled }: TierProgressSectionProps) {
  return (
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
                ? `border-white bg-gradient-to-br ${tierColors[tier.id] || 'from-gray-500 to-gray-700'}`
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
  );
}
