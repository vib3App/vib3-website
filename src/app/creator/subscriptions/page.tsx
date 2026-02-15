'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { useAuthStore } from '@/stores/authStore';
import { subscriptionsApi } from '@/services/api/subscriptions';
import { formatCurrency } from '@/utils/format';
import type { SubscriptionTier } from '@/types/creator';

interface TierFormData {
  name: string;
  price: string;
  benefits: string;
}

export default function CreatorSubscriptionsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isAuthVerified } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TierFormData>({ name: '', price: '', benefits: '' });

  const loadTiers = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    const response = await subscriptionsApi.getCreatorTiers(user.id);
    if (response) {
      setTiers(response.tiers || []);
      setSubscriptionsEnabled(!!response.tiers?.length);
      setSubscriberCount((response as unknown as Record<string, unknown>).subscriberCount as number || 0);
    }
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthVerified) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/creator/subscriptions');
      return;
    }
    loadTiers();
  }, [isAuthenticated, isAuthVerified, router, loadTiers]);

  const handleCreateTier = async () => {
    const name = formData.name.trim();
    const price = parseFloat(formData.price);
    const benefits = formData.benefits.split('\n').map(b => b.trim()).filter(Boolean);

    if (!name) { setError('Tier name is required'); return; }
    if (isNaN(price) || price < 0.99) { setError('Price must be at least $0.99'); return; }
    if (benefits.length === 0) { setError('Add at least one benefit'); return; }

    setSaving(true);
    setError(null);

    const newTiers = [...tiers, { id: `tier${tiers.length + 1}`, name, price, benefits }];
    const success = await subscriptionsApi.enableSubscriptions(
      newTiers.map(t => ({ name: t.name, price: t.price, benefits: t.benefits }))
    );

    if (success) {
      setShowCreateModal(false);
      setFormData({ name: '', price: '', benefits: '' });
      await loadTiers();
    } else {
      setError('Failed to create tier. Please try again.');
    }
    setSaving(false);
  };

  const handleRemoveTier = async (tierId: string) => {
    const remaining = tiers.filter(t => t.id !== tierId);
    setSaving(true);
    if (remaining.length === 0) {
      const success = await subscriptionsApi.disableSubscriptions();
      if (success) await loadTiers();
    } else {
      const success = await subscriptionsApi.enableSubscriptions(
        remaining.map(t => ({ name: t.name, price: t.price, benefits: t.benefits }))
      );
      if (success) await loadTiers();
    }
    setSaving(false);
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

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {subscriptionsEnabled && subscriberCount > 0 && (
          <div className="glass-card rounded-2xl p-4 mb-6 flex items-center justify-between">
            <span className="text-white/70">Total Subscribers</span>
            <span className="text-2xl font-bold text-purple-400">{subscriberCount}</span>
          </div>
        )}

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
                {['Recurring monthly revenue from loyal fans', 'Exclusive content only subscribers can see', 'Subscriber-only live streams and chat', 'Special badges for subscribers'].map((b) => (
                  <div key={b} className="flex items-start gap-3">
                    <span className="text-green-400">✓</span>
                    <span className="text-white/70">{b}</span>
                  </div>
                ))}
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
                </div>

                <div className="space-y-2 mb-4">
                  {tier.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-white/70">
                      <span className="text-green-400">✓</span>
                      {benefit}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-white/10">
                  <button
                    onClick={() => handleRemoveTier(tier.id)}
                    disabled={saving}
                    className="text-red-400 text-sm hover:underline disabled:opacity-50"
                  >
                    Remove Tier
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-white mb-4">Create Subscription Tier</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">Tier Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Supporter, VIP, Super Fan"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Price ($/month)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.99"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="4.99"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Benefits (one per line)</label>
                <textarea
                  value={formData.benefits}
                  onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
                  placeholder={"Early access to videos\nExclusive behind-the-scenes\nSubscriber badge"}
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowCreateModal(false); setError(null); }}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTier}
                disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-xl font-medium disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Tier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
