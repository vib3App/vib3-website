'use client';

import type { Wallet } from '@/types/wallet';

interface CoinsHeroSectionProps {
  wallet: Wallet | null;
  onBuyClick: () => void;
  onGiftClick: () => void;
  onEarnClick: () => void;
}

export function CoinsHeroSection({ wallet, onBuyClick, onGiftClick, onEarnClick }: CoinsHeroSectionProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/60 via-orange-500/60 to-yellow-500/60 backdrop-blur-3xl" />

      <div className="relative px-6 py-12 md:py-20 text-center text-white">
        <div className="text-6xl mb-4">V3</div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4">VIB3 Coins</h1>
        <p className="text-xl text-white/90 mb-8">Your virtual currency for the VIB3 ecosystem</p>

        {/* Balance Cards */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
          <div className="glass-heavy rounded-2xl px-8 py-6 min-w-[200px]">
            <div className="text-4xl font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
              {wallet?.coins.toLocaleString() || 0}
            </div>
            <div className="text-white/70">Your VIB3 Coins</div>
          </div>
          <div className="glass-heavy rounded-2xl px-8 py-6 min-w-[200px]">
            <div className="text-4xl font-bold text-white">
              ${((wallet?.coins || 0) * 0.01).toFixed(2)}
            </div>
            <div className="text-white/70">USD Value</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={onBuyClick}
            className="bg-white text-amber-600 font-semibold px-8 py-3 rounded-full hover:bg-white/90 transition-colors"
          >
            Buy Coins
          </button>
          <button
            onClick={onGiftClick}
            className="bg-white/20 text-white font-semibold px-8 py-3 rounded-full border-2 border-white/30 hover:bg-white/30 transition-colors"
          >
            Gift Coins
          </button>
          <button
            onClick={onEarnClick}
            className="bg-white/20 text-white font-semibold px-8 py-3 rounded-full border-2 border-white/30 hover:bg-white/30 transition-colors"
          >
            Earn Coins
          </button>
        </div>
      </div>
    </div>
  );
}
