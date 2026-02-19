'use client';

import { useState, useCallback } from 'react';
import { paymentApi } from '@/services/api/payment';
import { logger } from '@/utils/logger';
import { useToastStore } from '@/stores/toastStore';

interface CoinPackageOption {
  id: string;
  coins: number;
  bonus: number;
  price: number;
  popular?: boolean;
}

const DEFAULT_PACKAGES: CoinPackageOption[] = [
  { id: 'pkg-100', coins: 100, bonus: 0, price: 0.99 },
  { id: 'pkg-500', coins: 500, bonus: 25, price: 4.99 },
  { id: 'pkg-1000', coins: 1000, bonus: 100, price: 9.99, popular: true },
  { id: 'pkg-5000', coins: 5000, bonus: 750, price: 49.99 },
  { id: 'pkg-10000', coins: 10000, bonus: 2000, price: 99.99 },
  { id: 'pkg-20000', coins: 20000, bonus: 5000, price: 199.99 },
];

interface CoinPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Gap #65: Stripe Checkout for Coins
 * Shows coin packages, creates Stripe checkout session, redirects to Stripe.
 */
export function CoinPurchaseModal({ isOpen, onClose, onSuccess }: CoinPurchaseModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const handlePurchase = useCallback(async () => {
    if (!selectedPackage) return;
    setLoading(true);
    try {
      const { url } = await paymentApi.createCheckoutSession(selectedPackage);
      if (url) {
        window.location.href = url;
      } else {
        addToast('Failed to create checkout session', 'error');
      }
    } catch (err) {
      logger.error('Checkout failed:', err);
      addToast('Payment error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedPackage, addToast]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="text-4xl mb-2">💰</div>
          <h2 className="text-white font-bold text-xl">Buy Coins</h2>
          <p className="text-white/50 text-sm mt-1">Select a package below</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {DEFAULT_PACKAGES.map(pkg => (
            <button key={pkg.id} onClick={() => setSelectedPackage(pkg.id)}
              className={`relative p-4 rounded-xl text-left transition ${
                selectedPackage === pkg.id
                  ? 'bg-gradient-to-br from-purple-500/30 to-teal-500/30 border-2 border-purple-500'
                  : 'glass border border-white/10 hover:border-white/30'
              }`}>
              {pkg.popular && (
                <span className="absolute -top-2 right-2 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-teal-400 text-white text-[10px] font-bold rounded-full">
                  POPULAR
                </span>
              )}
              <div className="flex items-center gap-1 mb-1">
                <span className="text-yellow-400 text-lg">💰</span>
                <span className="text-white font-bold text-lg">{pkg.coins.toLocaleString()}</span>
              </div>
              {pkg.bonus > 0 && (
                <span className="text-green-400 text-xs">+{pkg.bonus.toLocaleString()} bonus</span>
              )}
              <div className="text-white/70 font-medium mt-1">${pkg.price.toFixed(2)}</div>
            </button>
          ))}
        </div>

        <button onClick={handlePurchase} disabled={!selectedPackage || loading}
          className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-teal-400 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Purchase with Stripe
            </>
          )}
        </button>

        <p className="text-white/30 text-[10px] text-center mt-3">
          Secure payment powered by Stripe. Coins are non-refundable.
        </p>
      </div>
    </div>
  );
}
