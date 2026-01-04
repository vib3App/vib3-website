'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreator } from '@/hooks/useCreator';
import { useAuthStore } from '@/stores/authStore';
import {
  CreatorHeader,
  CreatorTabs,
  CreatorStatsGrid,
  PeriodSelector,
  RevenueCard,
  TopVideosSection,
  TopSupportersSection,
  ContentTab,
  MonetizationTab,
  AudienceTab,
  SettingsTab,
} from '@/components/creator';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-4">📊</div>
      <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
      <p className="text-white/60">{message}</p>
    </div>
  );
}

export default function CreatorPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const creator = useCreator();

  useEffect(() => {
    if (isAuthVerified && !isAuthenticated) {
      router.push('/login?redirect=/creator');
    }
  }, [isAuthenticated, isAuthVerified, router]);

  // Show loading while checking auth
  if (!isAuthVerified) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <CreatorHeader />
      <CreatorTabs activeTab={creator.activeTab} onTabChange={creator.setActiveTab} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {creator.loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {creator.activeTab === 'overview' && (
              creator.analytics ? (
                <div className="space-y-6">
                  <PeriodSelector period={creator.period} onPeriodChange={creator.setPeriod} />
                  <CreatorStatsGrid analytics={creator.analytics} />
                  <RevenueCard analytics={creator.analytics} />
                  <TopVideosSection
                    videos={creator.videos}
                    onViewAll={() => creator.setActiveTab('content')}
                  />
                  <TopSupportersSection supporters={creator.topSupporters} />
                </div>
              ) : (
                <EmptyState message="Start creating content to see your analytics here." />
              )
            )}

            {creator.activeTab === 'content' && (
              <ContentTab videos={creator.videos} />
            )}

            {creator.activeTab === 'monetization' && (
              <MonetizationTab
                coinBalance={creator.coinBalance}
                analytics={creator.analytics}
              />
            )}

            {creator.activeTab === 'audience' && (
              creator.analytics ? (
                <AudienceTab analytics={creator.analytics} trends={creator.trends} />
              ) : (
                <EmptyState message="Analytics will appear once you have audience data." />
              )
            )}

            {creator.activeTab === 'settings' && <SettingsTab />}
          </>
        )}
      </main>
    </div>
  );
}
