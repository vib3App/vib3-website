'use client';

import { useCreator } from '@/hooks/useCreator';
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

export default function CreatorPage() {
  const creator = useCreator();

  return (
    <div className="min-h-screen bg-black text-white">
      <CreatorHeader />
      <CreatorTabs activeTab={creator.activeTab} onTabChange={creator.setActiveTab} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {creator.loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {creator.activeTab === 'overview' && creator.analytics && (
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

            {creator.activeTab === 'audience' && creator.analytics && (
              <AudienceTab analytics={creator.analytics} trends={creator.trends} />
            )}

            {creator.activeTab === 'settings' && <SettingsTab />}
          </>
        )}
      </main>
    </div>
  );
}
