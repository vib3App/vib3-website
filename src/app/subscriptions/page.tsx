'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, StarIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { subscriptionsApi, type UserSubscription } from '@/services/api/subscriptions';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { SubscriptionCard } from '@/components/subscriptions';

export default function SubscriptionsPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthVerified) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/subscriptions');
      return;
    }
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await subscriptionsApi.getMySubscriptions();
        if (!cancelled) {
          setSubscriptions(data);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isAuthenticated, isAuthVerified, router]);

  const handleCancelSubscription = async (subscriptionId: string) => {
    const success = await subscriptionsApi.cancelSubscription(subscriptionId);
    if (success) {
      setSubscriptions((prev) =>
        prev.map((sub) => sub.id === subscriptionId ? { ...sub, status: 'cancelled' as const } : sub)
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
        <PageHeader activeCount={activeSubscriptions.length} onBack={() => router.back()} />

        <div className="max-w-2xl mx-auto px-4 space-y-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : subscriptions.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <SubscriptionGroup title="Active" subscriptions={activeSubscriptions} onCancel={handleCancelSubscription} />
              <SubscriptionGroup title="Past" subscriptions={otherSubscriptions} onCancel={handleCancelSubscription} titleClass="text-white/50" />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function PageHeader({ activeCount, onBack }: { activeCount: number; onBack: () => void }) {
  return (
    <header className="sticky top-0 z-40 glass-heavy rounded-b-2xl border-b border-white/10 mx-4 mb-6">
      <div className="flex items-center gap-4 px-4 h-14">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition" aria-label="Go back">
          <ArrowLeftIcon className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-white">My Subscriptions</h1>
          <p className="text-white/50 text-xs">{activeCount} active</p>
        </div>
      </div>
    </header>
  );
}

function LoadingSkeleton() {
  return (
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
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
        <StarIcon className="w-10 h-10 text-white/30" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">No Subscriptions Yet</h2>
      <p className="text-white/50 mb-6 max-w-sm mx-auto">
        Subscribe to your favorite creators to unlock exclusive content and support them
      </p>
      <Link href="/discover" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full font-medium hover:opacity-90 transition">
        Discover Creators
      </Link>
    </div>
  );
}

function SubscriptionGroup({ title, subscriptions, onCancel, titleClass = 'text-white' }: { title: string; subscriptions: UserSubscription[]; onCancel: (id: string) => Promise<void>; titleClass?: string }) {
  if (subscriptions.length === 0) return null;
  return (
    <div>
      <h2 className={`font-medium mb-3 ${titleClass}`}>{title}</h2>
      <div className="space-y-4">
        {subscriptions.map((sub) => (
          <SubscriptionCard key={sub.id} subscription={sub} onCancel={() => onCancel(sub.id)} />
        ))}
      </div>
    </div>
  );
}
