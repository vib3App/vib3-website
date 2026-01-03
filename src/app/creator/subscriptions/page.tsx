'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency } from '@/utils/format';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  benefits: string[];
  subscriberCount: number;
  isActive: boolean;
}

export default function CreatorSubscriptionsPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!isAuthVerified) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/creator/subscriptions');
      return;
    }
    loadTiers();
  }, [isAuthenticated, isAuthVerified, router]);

  const loadTiers = async () => {
    setIsLoading(true);
    // TODO: Load from API
    await new Promise((resolve) => setTimeout(resolve, 500));
    setTiers([]);
    setIsLoading(false);
  };

  const handleToggleTier = (tierId: string) => {
    setTiers((prev) =>
      prev.map((tier) =>
        tier.id === tierId ? { ...tier, isActive: !tier.isActive } : tier
      )
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen aurora-bg pb-20">
      <TopNav />

      <div className="px-4 pt-20 md:pt-16 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-white/70 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-full font-medium text-sm"
          >
            Create Tier
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : tiers.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Create Your First Tier</h2>
            <p className="text-white/50 mb-6 max-w-sm mx-auto">
              Set up subscription tiers to offer exclusive content to your most dedicated fans.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-full font-medium"
            >
              Create Subscription Tier
            </button>

            <div className="mt-8 pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Benefits of Subscriptions</h3>
              <div className="grid gap-3 text-left">
                <div className="flex items-start gap-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white/70">Recurring monthly revenue from loyal fans</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white/70">Exclusive content only subscribers can see</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white/70">Subscriber-only live streams and chat</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white/70">Special badges for subscribers</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {tiers.map((tier) => (
              <div key={tier.id} className="glass-card rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                    <div className="text-2xl font-bold text-purple-400">
                      {formatCurrency(tier.price)}/month
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleTier(tier.id)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      tier.isActive ? 'bg-green-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        tier.isActive ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  {tier.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-white/70">
                      <span className="text-green-400">✓</span>
                      {benefit}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="text-white/50 text-sm">
                    {tier.subscriberCount} subscriber{tier.subscriberCount !== 1 ? 's' : ''}
                  </div>
                  <button className="text-purple-400 text-sm hover:underline">Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal - simplified for now */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-white mb-4">Create Subscription Tier</h2>
            <p className="text-white/50 mb-6">
              This feature is coming soon. Set up subscription tiers to monetize your exclusive content.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
