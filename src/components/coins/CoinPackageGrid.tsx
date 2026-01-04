'use client';

import type { WalletCoinPackage } from '@/types/wallet';

interface CoinPackageGridProps {
  packages: WalletCoinPackage[];
  purchaseLoading: string | null;
  purchaseError: string | null;
  purchaseSuccess: boolean;
  onBuyPackage: (pkg: WalletCoinPackage) => void;
  onClearError: () => void;
  onClearSuccess: () => void;
}

export function CoinPackageGrid({
  packages,
  purchaseLoading,
  purchaseError,
  purchaseSuccess,
  onBuyPackage,
  onClearError,
  onClearSuccess,
}: CoinPackageGridProps) {
  return (
    <div className="space-y-4">
      {/* Success Message */}
      {purchaseSuccess && (
        <div className="glass-card p-4 border-green-500/50 bg-green-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-xl">
              ✓
            </div>
            <div>
              <p className="text-green-400 font-semibold">Purchase Successful!</p>
              <p className="text-white/70 text-sm">Your coins have been added to your balance.</p>
            </div>
            <button
              onClick={onClearSuccess}
              className="ml-auto text-white/50 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {purchaseError && (
        <div className="glass-card p-4 border-red-500/50 bg-red-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 text-xl">
              !
            </div>
            <div>
              <p className="text-red-400 font-semibold">Purchase Failed</p>
              <p className="text-white/70 text-sm">{purchaseError}</p>
            </div>
            <button
              onClick={onClearError}
              className="ml-auto text-white/50 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => {
          const isPopular = pkg.id === 'coins_1000';
          const isLoading = purchaseLoading === pkg.id;
          return (
            <div
              key={pkg.id}
              className={`relative glass-card p-6 transition-all hover:scale-105 cursor-pointer ${
                isPopular
                  ? 'border-amber-500 ring-2 ring-amber-500/20'
                  : 'hover:border-amber-500/30'
              } ${isLoading ? 'opacity-75' : ''}`}
              onClick={() => !isLoading && onBuyPackage(pkg)}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <div className="text-center">
                <div className="text-4xl mb-2">V3</div>
                <div className="text-3xl font-bold text-white mb-1">
                  {pkg.coins.toLocaleString()}
                </div>
                {pkg.bonus > 0 && (
                  <div className="text-green-400 text-sm mb-2">
                    +{pkg.bonus.toLocaleString()} bonus coins!
                  </div>
                )}
                <div className="text-white/50 mb-4">VIB3 Coins</div>
                <button
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `$${pkg.price.toFixed(2)}`
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
