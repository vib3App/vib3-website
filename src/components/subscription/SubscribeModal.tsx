'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  XMarkIcon,
  StarIcon,
  CheckIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { subscriptionsApi, type CreatorTiersResponse } from '@/services/api/subscriptions';
import type { SubscriptionTier } from '@/types/creator';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
}

export function SubscribeModal({
  isOpen,
  onClose,
  creatorId,
  creatorName,
  creatorAvatar,
}: SubscribeModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadTiers = async () => {
      setIsLoading(true);
      setError(null);

      const data = await subscriptionsApi.getCreatorTiers(creatorId);
      if (data) {
        setTiers(data.tiers);
        setIsSubscribed(data.isSubscribed);
        setCurrentTier(data.currentTier || null);
        if (data.tiers.length > 0 && !data.isSubscribed) {
          setSelectedTier(data.tiers[0].id);
        }
      } else {
        setError('Failed to load subscription options');
      }

      setIsLoading(false);
    };

    loadTiers();
  }, [isOpen, creatorId]);

  const handleSubscribe = async () => {
    if (!selectedTier) return;

    setIsSubscribing(true);
    setError(null);

    const result = await subscriptionsApi.subscribe(creatorId, selectedTier);

    if (result.success && result.checkoutUrl) {
      // Redirect to Stripe checkout
      window.location.href = result.checkoutUrl;
    } else {
      setError(result.error || 'Failed to subscribe');
      setIsSubscribing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-heavy rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
              {creatorAvatar ? (
                <Image
                  src={creatorAvatar}
                  alt={creatorName}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                  {creatorName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-white font-semibold">Subscribe to @{creatorName}</h2>
              <p className="text-white/50 text-sm">Unlock exclusive content</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <XMarkIcon className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="glass rounded-xl p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10" />
                    <div className="flex-1">
                      <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-white/10 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isSubscribed ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                You&apos;re Subscribed!
              </h3>
              {currentTier && (
                <p className="text-white/70">
                  Current tier: <span className="text-purple-400">{currentTier.name}</span>
                </p>
              )}
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2 glass text-white rounded-full hover:bg-white/10 transition"
              >
                Close
              </button>
            </div>
          ) : tiers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <LockClosedIcon className="w-8 h-8 text-white/30" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Subscriptions Coming Soon
              </h3>
              <p className="text-white/50 text-sm">
                {creatorName} hasn&apos;t set up subscriptions yet.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2 glass text-white rounded-full hover:bg-white/10 transition"
              >
                Got it
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                {tiers.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition ${
                      selectedTier === tier.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            selectedTier === tier.id
                              ? 'bg-purple-500'
                              : 'bg-white/10'
                          }`}
                        >
                          <StarIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{tier.name}</h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">${tier.price.toFixed(2)}</p>
                        <p className="text-white/50 text-xs">/month</p>
                      </div>
                    </div>

                    {tier.benefits.length > 0 && (
                      <ul className="space-y-1 mt-3">
                        {tier.benefits.map((benefit, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-white/70 text-sm"
                          >
                            <CheckIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Selection indicator */}
                    {selectedTier === tier.id && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                          <CheckIcon className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Subscribe button */}
              <button
                onClick={handleSubscribe}
                disabled={!selectedTier || isSubscribing}
                className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubscribing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <StarIcon className="w-5 h-5" />
                    Subscribe
                  </>
                )}
              </button>

              <p className="text-center text-white/40 text-xs mt-3">
                You can cancel anytime. Recurring monthly charge.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
