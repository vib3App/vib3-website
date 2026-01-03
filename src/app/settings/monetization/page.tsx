'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusIcon,
  TrashIcon,
  StarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { creatorApi } from '@/services/api/creator';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import type { SubscriptionTier, CreatorSubscriptionSettings, PayoutSettings } from '@/types/creator';

interface TierEditor {
  id: string;
  name: string;
  price: string;
  benefits: string[];
  isNew?: boolean;
}

function StepCard({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  isComplete,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  isComplete?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${iconColor}`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-medium">{title}</h3>
              {isComplete && (
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
              )}
            </div>
            <p className="text-white/50 text-sm">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function TierEditorCard({
  tier,
  index,
  onUpdate,
  onRemove,
  onAddBenefit,
  onRemoveBenefit,
}: {
  tier: TierEditor;
  index: number;
  onUpdate: (field: 'name' | 'price', value: string) => void;
  onRemove: () => void;
  onAddBenefit: () => void;
  onRemoveBenefit: (benefitIndex: number) => void;
}) {
  return (
    <div className="glass rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-white/50 text-sm">Tier {index + 1}</span>
        <button
          onClick={onRemove}
          className="p-1 hover:bg-red-500/20 rounded transition"
        >
          <TrashIcon className="w-4 h-4 text-red-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-white/50 text-xs mb-1 block">Tier Name</label>
          <input
            type="text"
            value={tier.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder="e.g., Supporter"
            className="w-full px-3 py-2 bg-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>
        <div>
          <label className="text-white/50 text-xs mb-1 block">Monthly Price (USD)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">$</span>
            <input
              type="number"
              step="0.01"
              min="0.50"
              value={tier.price}
              onChange={(e) => onUpdate('price', e.target.value)}
              placeholder="4.99"
              className="w-full pl-7 pr-3 py-2 bg-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-white/50 text-xs mb-2 block">Benefits</label>
        <div className="flex flex-wrap gap-2">
          {tier.benefits.map((benefit, i) => (
            <span
              key={i}
              className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full text-white text-xs"
            >
              {benefit}
              <button
                onClick={() => onRemoveBenefit(i)}
                className="ml-1 hover:text-red-400"
              >
                &times;
              </button>
            </span>
          ))}
          <button
            onClick={onAddBenefit}
            className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs hover:bg-purple-500/30 transition"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}

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

      // Get payout settings to check Stripe status
      const payoutSettings = await creatorApi.getPayoutSettings();
      const hasAccount = !!payoutSettings.stripeAccountId;
      setHasStripeAccount(hasAccount);

      // If they have an account, they're onboarded (simplified check)
      setIsStripeOnboarded(hasAccount);

      if (hasAccount) {
        // Load subscription settings
        const subSettings = await creatorApi.getSubscriptionSettings();
        setTiers(
          subSettings.tiers.map((t) => ({
            id: t.id,
            name: t.name,
            price: t.price.toFixed(2),
            benefits: t.benefits,
          }))
        );

        // Load earnings from analytics
        try {
          const analytics = await creatorApi.getAnalytics('30d');
          setEarnings({
            activeSubscribers: 0, // Would come from subscribers count
            totalEarnings: analytics.revenueBreakdown?.total || 0,
            pendingPayout: analytics.revenueBreakdown?.pending || 0,
          });
        } catch {
          // Analytics might fail, that's ok
        }
      }
    } catch (err) {
      console.error('Failed to load monetization status:', err);
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
      console.error('Failed to connect Stripe:', err);
      setError('Failed to start Stripe connection');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAddTier = () => {
    if (tiers.length >= 3) return;
    setTiers([
      ...tiers,
      {
        id: `tier_${Date.now()}`,
        name: '',
        price: '4.99',
        benefits: [],
        isNew: true,
      },
    ]);
  };

  const handleUpdateTier = (index: number, field: 'name' | 'price', value: string) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: value };
    setTiers(updated);
  };

  const handleRemoveTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const handleAddBenefit = (tierIndex: number) => {
    const benefit = prompt('Enter benefit:');
    if (!benefit?.trim()) return;

    const updated = [...tiers];
    updated[tierIndex] = {
      ...updated[tierIndex],
      benefits: [...updated[tierIndex].benefits, benefit.trim()],
    };
    setTiers(updated);
  };

  const handleRemoveBenefit = (tierIndex: number, benefitIndex: number) => {
    const updated = [...tiers];
    updated[tierIndex] = {
      ...updated[tierIndex],
      benefits: updated[tierIndex].benefits.filter((_, i) => i !== benefitIndex),
    };
    setTiers(updated);
  };

  const handleSaveTiers = async () => {
    // Validate
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
        tiers: tiers.map((t) => ({
          id: t.id,
          name: t.name,
          price: parseFloat(t.price),
          benefits: t.benefits,
        })),
      });

      // Refresh data
      await loadStatus();
    } catch (err) {
      console.error('Failed to save tiers:', err);
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

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />

      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-heavy rounded-b-2xl border-b border-white/10 mx-4 mb-6">
          <div className="flex items-center gap-4 px-4 h-14">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-lg font-semibold text-white">Monetization</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/20 rounded-xl border border-red-500/30">
              <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                &times;
              </button>
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
              {/* Step 1: Connect Stripe */}
              <StepCard
                title="Connect Payment Account"
                subtitle={
                  hasStripeAccount
                    ? isStripeOnboarded
                      ? 'Connected & Ready'
                      : 'Complete Onboarding'
                    : 'Set up to receive payments'
                }
                icon={BanknotesIcon}
                iconColor={
                  hasStripeAccount
                    ? isStripeOnboarded
                      ? 'bg-green-500/30'
                      : 'bg-orange-500/30'
                    : 'bg-white/10'
                }
                isComplete={isStripeOnboarded}
              >
                {!hasStripeAccount ? (
                  <div className="space-y-4">
                    <p className="text-white/70 text-sm">
                      Connect your bank account to receive subscription payments directly.
                      We use Stripe for secure payment processing.
                    </p>
                    <button
                      onClick={handleConnectStripe}
                      disabled={isConnecting}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isConnecting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <PlusIcon className="w-5 h-5" />
                          Set Up Payments
                        </>
                      )}
                    </button>
                  </div>
                ) : !isStripeOnboarded ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <ExclamationCircleIcon className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                      <p className="text-white/70 text-sm">
                        Complete your account setup to start receiving payments.
                      </p>
                    </div>
                    <button
                      onClick={handleConnectStripe}
                      disabled={isConnecting}
                      className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition disabled:opacity-50"
                    >
                      Complete Setup
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span className="text-sm">
                      Your payment account is set up and ready to receive payments!
                    </span>
                  </div>
                )}
              </StepCard>

              {/* Step 2: Subscription Tiers */}
              {isStripeOnboarded && (
                <StepCard
                  title="Subscription Tiers"
                  subtitle={`${tiers.length} tier(s) configured`}
                  icon={StarIcon}
                  iconColor="bg-purple-500/30"
                >
                  <div className="space-y-4">
                    <p className="text-white/70 text-sm">
                      Set up subscription tiers for your fans. They&apos;ll be charged monthly.
                    </p>

                    {/* Tier list */}
                    <div className="space-y-3">
                      {tiers.map((tier, index) => (
                        <TierEditorCard
                          key={tier.id}
                          tier={tier}
                          index={index}
                          onUpdate={(field, value) => handleUpdateTier(index, field, value)}
                          onRemove={() => handleRemoveTier(index)}
                          onAddBenefit={() => handleAddBenefit(index)}
                          onRemoveBenefit={(benefitIndex) =>
                            handleRemoveBenefit(index, benefitIndex)
                          }
                        />
                      ))}
                    </div>

                    {/* Add tier button */}
                    {tiers.length < 3 && (
                      <button
                        onClick={handleAddTier}
                        className="w-full py-2 border border-dashed border-white/20 rounded-lg text-white/50 hover:text-white hover:border-white/40 transition flex items-center justify-center gap-2 text-sm"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Add Tier
                      </button>
                    )}

                    {/* Save button */}
                    <button
                      onClick={handleSaveTiers}
                      disabled={tiers.length === 0 || isSavingTiers}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSavingTiers ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Subscription Tiers'
                      )}
                    </button>
                  </div>
                </StepCard>
              )}

              {/* Earnings Card */}
              {isStripeOnboarded && (
                <div className="glass-card rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-teal-400/20">
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="w-5 h-5 text-white" />
                      <h3 className="text-white font-medium">Your Earnings</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <UserGroupIcon className="w-4 h-4 text-white/50" />
                        </div>
                        <p className="text-2xl font-bold text-white">
                          {earnings.activeSubscribers}
                        </p>
                        <p className="text-white/50 text-xs">Subscribers</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <CurrencyDollarIcon className="w-4 h-4 text-white/50" />
                        </div>
                        <p className="text-2xl font-bold text-white">
                          ${earnings.totalEarnings.toFixed(2)}
                        </p>
                        <p className="text-white/50 text-xs">Total Earned</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <ClockIcon className="w-4 h-4 text-white/50" />
                        </div>
                        <p className="text-2xl font-bold text-white">
                          ${earnings.pendingPayout.toFixed(2)}
                        </p>
                        <p className="text-white/50 text-xs">Pending</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
