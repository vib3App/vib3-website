'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  StarIcon,
  CalendarIcon,
  XCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { subscriptionsApi, type UserSubscription } from '@/services/api/subscriptions';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function SubscriptionCard({
  subscription,
  onCancel,
}: {
  subscription: UserSubscription;
  onCancel: () => void;
}) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    await onCancel();
    setIsCancelling(false);
    setShowCancelConfirm(false);
  };

  const isActive = subscription.status === 'active';
  const isCancelled = subscription.status === 'cancelled';

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Creator info */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${subscription.creatorId}`}>
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
              {subscription.creatorAvatar ? (
                <Image
                  src={subscription.creatorAvatar}
                  alt={subscription.creatorUsername}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                  {subscription.creatorUsername.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </Link>
          <div className="flex-1">
            <Link
              href={`/profile/${subscription.creatorId}`}
              className="text-white font-medium hover:underline"
            >
              @{subscription.creatorUsername}
            </Link>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-purple-400 text-sm flex items-center gap-1">
                <StarIcon className="w-3.5 h-3.5" />
                {subscription.tier.name}
              </span>
              <span className="text-white/30">•</span>
              <span className="text-white/50 text-sm">
                ${subscription.price.toFixed(2)}/mo
              </span>
            </div>
          </div>
          <div className="text-right">
            {isActive && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                Active
              </span>
            )}
            {isCancelled && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                Cancelled
              </span>
            )}
            {subscription.status === 'expired' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 text-white/50 rounded-full text-xs">
                Expired
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        {/* Benefits */}
        {subscription.tier.benefits.length > 0 && (
          <div className="space-y-1">
            {subscription.tier.benefits.slice(0, 3).map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-white/70 text-sm"
              >
                <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                {benefit}
              </div>
            ))}
            {subscription.tier.benefits.length > 3 && (
              <p className="text-white/50 text-xs pl-6">
                +{subscription.tier.benefits.length - 3} more benefits
              </p>
            )}
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <CalendarIcon className="w-4 h-4" />
            <span>Started {formatDate(subscription.startedAt)}</span>
          </div>
          {subscription.renewsAt && isActive && (
            <span className="text-white/50 text-sm">
              Renews {formatDate(subscription.renewsAt)}
            </span>
          )}
          {isCancelled && subscription.expiresAt && (
            <span className="text-orange-400 text-sm">
              Ends {formatDate(subscription.expiresAt)}
            </span>
          )}
        </div>

        {/* Actions */}
        {isActive && (
          <div className="pt-2">
            {showCancelConfirm ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-2 glass text-white rounded-lg text-sm hover:bg-white/10 transition"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {isCancelling ? (
                    <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                  ) : (
                    <>
                      <XCircleIcon className="w-4 h-4" />
                      Confirm Cancel
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full py-2 text-white/50 hover:text-red-400 text-sm transition"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSubscriptions = useCallback(async () => {
    setIsLoading(true);
    const data = await subscriptionsApi.getMySubscriptions();
    setSubscriptions(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthVerified) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/subscriptions');
      return;
    }
    loadSubscriptions();
  }, [isAuthenticated, isAuthVerified, router, loadSubscriptions]);

  const handleCancelSubscription = async (subscriptionId: string) => {
    const success = await subscriptionsApi.cancelSubscription(subscriptionId);
    if (success) {
      // Update local state
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === subscriptionId ? { ...sub, status: 'cancelled' as const } : sub
        )
      );
    }
  };

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'active');
  const otherSubscriptions = subscriptions.filter((s) => s.status !== 'active');

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
            <div>
              <h1 className="text-lg font-semibold text-white">My Subscriptions</h1>
              <p className="text-white/50 text-xs">
                {activeSubscriptions.length} active
              </p>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-white/10" />
                    <div className="flex-1">
                      <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-white/10 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <StarIcon className="w-10 h-10 text-white/30" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                No Subscriptions Yet
              </h2>
              <p className="text-white/50 mb-6 max-w-sm mx-auto">
                Subscribe to your favorite creators to unlock exclusive content and support them
              </p>
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full font-medium hover:opacity-90 transition"
              >
                Discover Creators
              </Link>
            </div>
          ) : (
            <>
              {/* Active subscriptions */}
              {activeSubscriptions.length > 0 && (
                <div>
                  <h2 className="text-white font-medium mb-3">Active</h2>
                  <div className="space-y-4">
                    {activeSubscriptions.map((sub) => (
                      <SubscriptionCard
                        key={sub.id}
                        subscription={sub}
                        onCancel={() => handleCancelSubscription(sub.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Cancelled / expired */}
              {otherSubscriptions.length > 0 && (
                <div>
                  <h2 className="text-white/50 font-medium mb-3">Past</h2>
                  <div className="space-y-4">
                    {otherSubscriptions.map((sub) => (
                      <SubscriptionCard
                        key={sub.id}
                        subscription={sub}
                        onCancel={() => handleCancelSubscription(sub.id)}
                      />
                    ))}
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
