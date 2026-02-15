'use client';

import Image from 'next/image';
import { GiftIcon } from '@heroicons/react/24/outline';
import type { TopSupporter } from '@/types/creator';
import { formatCount } from '@/utils/format';

interface TopSupportersSectionProps {
  supporters: TopSupporter[];
}

export function TopSupportersSection({ supporters }: TopSupportersSectionProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Top Supporters</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {supporters.map(supporter => (
          <div key={supporter.userId} className="bg-white/5 rounded-xl p-4 text-center">
            <div className="relative inline-block mb-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden">
                {supporter.avatar ? (
                  <Image src={supporter.avatar} alt={supporter.username + "'s avatar"} width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold">
                    {supporter.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                #{supporter.rank}
              </div>
            </div>
            <div className="font-medium truncate">{supporter.username}</div>
            <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
              <GiftIcon className="w-3 h-3" />
              {formatCount(supporter.totalCoins)} coins
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
