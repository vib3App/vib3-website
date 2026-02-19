'use client';

import { useState, useEffect, useCallback } from 'react';
import { subscriptionsApi } from '@/services/api/subscriptions';
import type { SubscriptionTier } from '@/types/creator';
import { useToastStore } from '@/stores/toastStore';
import { logger } from '@/utils/logger';

interface SubscribeTierSheetProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  onSubscribed?: () => void;
}

/**
 * Gap #68: Subscription Tiers
 * Shows creator's tiers with perks, subscribe button, payment flow.
 */
export function SubscribeTierSheet({ isOpen, onClose, creatorId, creatorName, onSubscribed }: SubscribeTierSheetProps) {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  useEffect(() => {
    if (!isOpen) return;
    loadTiers();
  }, [isOpen, creatorId]);

  const loadTiers = async () => {
    setLoading(true);
    try {
      const data = await subscriptionsApi.getCreatorTiers(creatorId);
      if (data) {
        setTiers(data.tiers);
        setIsSubscribed(data.isSubscribed);
        setCurrentTier(data.currentTier || null);
      }
    } catch (err) {
      logger.error('Failed to load tiers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = useCallback(async () => {
    if (!selectedTier) return;
    setSubscribing(true);
    try {
      const result = await subscriptionsApi.subscribe(creatorId, selectedTier);
      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else if (result.success) {
        addToast(`Subscribed to ${creatorName}!`, 'success');
        onSubscribed?.();
        onClose();
      } else {
        addToast(result.error || 'Failed to subscribe', 'error');
      }
    } catch (err) {
      logger.error('Subscribe failed:', err);
      addToast('Subscription failed. Please try again.', 'error');
    } finally {
      setSubscribing(false);
    }
  }, [selectedTier, creatorId, creatorName, addToast, onSubscribed, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-semibold text-lg">Subscribe</h3>
            <p className="text-white/50 text-sm">Support @{creatorName}</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isSubscribed && currentTier && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400 text-sm font-medium">Subscribed - {currentTier.name}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass rounded-xl p-4 animate-pulse h-32" />
            ))}
          </div>
        ) : tiers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/50">This creator hasn&apos;t set up subscription tiers yet.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {tiers.map(tier => (
              <TierCard key={tier.id} tier={tier}
                isSelected={selectedTier === tier.id}
                isCurrent={currentTier?.id === tier.id}
                onSelect={() => setSelectedTier(tier.id)} />
            ))}
          </div>
        )}

        {tiers.length > 0 && !isSubscribed && (
          <button onClick={handleSubscribe} disabled={!selectedTier || subscribing}
            className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-teal-400 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
            {subscribing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : 'Subscribe Now'}
          </button>
        )}
      </div>
    </div>
  );
}

function TierCard({ tier, isSelected, isCurrent, onSelect }: {
  tier: SubscriptionTier; isSelected: boolean; isCurrent: boolean; onSelect: () => void;
}) {
  return (
    <button onClick={onSelect} className={`w-full text-left p-4 rounded-xl transition ${
      isSelected
        ? 'bg-gradient-to-br from-purple-500/20 to-teal-500/20 border-2 border-purple-500'
        : 'glass border border-white/10 hover:border-white/30'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {tier.badge && <span>{tier.badge}</span>}
          <h4 className="text-white font-semibold">{tier.name}</h4>
          {isCurrent && <span className="text-xs text-green-400 px-2 py-0.5 bg-green-400/10 rounded-full">Current</span>}
        </div>
        <span className="text-white font-bold">{tier.price} coins/mo</span>
      </div>
      <ul className="space-y-1">
        {tier.benefits.map((benefit, i) => (
          <li key={i} className="flex items-center gap-2 text-white/60 text-sm">
            <svg className="w-3.5 h-3.5 text-purple-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {benefit}
          </li>
        ))}
      </ul>
    </button>
  );
}
