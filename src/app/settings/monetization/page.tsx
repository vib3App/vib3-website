'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { creatorApi } from '@/services/api/creator';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import {
  StripeConnectCard,
  SubscriptionTiersEditor,
  EarningsCard,
  type TierEditor,
} from '@/components/monetization';
import { logger } from '@/utils/logger';

export default function MonetizationPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stripe Connect state
  const [hasStripeAccount, setHasStripeAccount] = useState(false);
  const [isStripeOnboarded, setIsStripeOnboarded] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Subscription tiers
  const [tiers, setTiers] = useState<TierEditor[]>([]);
  const [isSavingTiers, setIsSavingTiers] = useState(false);

  // Earnings
  const [earnings, setEarnings] = useState({
    activeSubscribers: 0,
    totalEarnings: 0,
    pendingPayout: 0,
  });

  const loadStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const payoutSettings = await creatorApi.getPayoutSettings();
      const hasAccount = !!payoutSettings.stripeAccountId;
      setHasStripeAccount(hasAccount);
      setIsStripeOnboarded(hasAccount);

      if (hasAccount) {
        const subSettings = await creatorApi.getSubscriptionSettings();
        setTiers(
          subSettings.tiers.map((t) => ({
            id: t.id,
            name: t.name,
            price: t.price.toFixed(2),
            benefits: t.benefits,
          }))
        );

        try {
          const analytics = await creatorApi.getAnalytics('30d');
          setEarnings({
            activeSubscribers: 0,
            totalEarnings: analytics.revenueBreakdown?.total || 0,
            pendingPayout: analytics.revenueBreakdown?.pending || 0,
          });
        } catch {
          // Analytics might fail, that's ok
        }
      }
    } catch (err) {
      logger.error('Failed to load monetization status:', err);
      setError('Failed to load monetization settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthVerified) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/settings/monetization');
      return;
    }
    loadStatus();
  }, [isAuthenticated, isAuthVerified, router, loadStatus]);

  const handleConnectStripe = async () => {
    try {
      setIsConnecting(true);
      const { connectUrl } = await creatorApi.connectStripe();
      window.location.href = connectUrl;
    } catch (err) {
      logger.error('Failed to connect Stripe:', err);
      setError('Failed to start Stripe connection');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAddTier = () => {
    if (tiers.length >= 3) return;
    setTiers([...tiers, { id: `tier_${Date.now()}`, name: '', price: '4.99', benefits: [], isNew: true }]);
  };

  const handleUpdateTier = (index: number, field: 'name' | 'price', value: string) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: value };
    setTiers(updated);
  };

  const handleRemoveTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const [newBenefitText, setNewBenefitText] = useState('');
  const [editingBenefitTier, setEditingBenefitTier] = useState<number | null>(null);

  const handleStartAddBenefit = (tierIndex: number) => {
    setEditingBenefitTier(tierIndex);
    setNewBenefitText('');
  };

  const _handleConfirmAddBenefit = () => {
    if (editingBenefitTier === null || !newBenefitText.trim()) return;
    const updated = [...tiers];
    updated[editingBenefitTier] = { ...updated[editingBenefitTier], benefits: [...updated[editingBenefitTier].benefits, newBenefitText.trim()] };
    setTiers(updated);
    setEditingBenefitTier(null);
    setNewBenefitText('');
  };

  const handleAddBenefit = (tierIndex: number) => {
    handleStartAddBenefit(tierIndex);
  };

  const handleRemoveBenefit = (tierIndex: number, benefitIndex: number) => {
    const updated = [...tiers];
    updated[tierIndex] = { ...updated[tierIndex], benefits: updated[tierIndex].benefits.filter((_, i) => i !== benefitIndex) };
    setTiers(updated);
  };

  const handleSaveTiers = async () => {
    for (const tier of tiers) {
      if (!tier.name.trim()) {
        setError('All tiers need a name');
        return;
      }
      const price = parseFloat(tier.price);
      if (isNaN(price) || price < 0.5) {
        setError('Minimum price is $0.50');
        return;
      }
    }

    try {
      setIsSavingTiers(true);
      setError(null);
      await creatorApi.updateSubscriptionSettings({
        enabled: true,
        tiers: tiers.map((t) => ({ id: t.id, name: t.name, price: parseFloat(t.price), benefits: t.benefits })),
      });
      await loadStatus();
    } catch (err) {
      logger.error('Failed to save tiers:', err);
      setError('Failed to save subscription tiers');
    } finally {
      setIsSavingTiers(false);
    }
  };

  if (!isAuthVerified) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login?redirect=/settings/monetization');
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />

      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        <header className="sticky top-0 z-40 glass-heavy rounded-b-2xl border-b border-white/10 mx-4 mb-6">
          <div className="flex items-center gap-4 px-4 h-14">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-lg font-semibold text-white">Monetization</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/20 rounded-xl border border-red-500/30">
              <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">&times;</button>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-white/10" />
                    <div className="flex-1">
                      <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-white/10 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-20 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <StripeConnectCard
                hasStripeAccount={hasStripeAccount}
                isStripeOnboarded={isStripeOnboarded}
                isConnecting={isConnecting}
                onConnectStripe={handleConnectStripe}
              />

              {isStripeOnboarded && (
                <SubscriptionTiersEditor
                  tiers={tiers}
                  isSaving={isSavingTiers}
                  onAddTier={handleAddTier}
                  onUpdateTier={handleUpdateTier}
                  onRemoveTier={handleRemoveTier}
                  onAddBenefit={handleAddBenefit}
                  onRemoveBenefit={handleRemoveBenefit}
                  onSave={handleSaveTiers}
                />
              )}

              {isStripeOnboarded && (
                <EarningsCard
                  activeSubscribers={earnings.activeSubscribers}
                  totalEarnings={earnings.totalEarnings}
                  pendingPayout={earnings.pendingPayout}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
