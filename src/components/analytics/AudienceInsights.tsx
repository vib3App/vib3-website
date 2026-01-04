'use client';

import type { AnalyticsDashboard, Demographics, TrafficSources as TrafficSourcesType } from '@/types/analytics';

interface AudienceInsightsProps {
  analytics: AnalyticsDashboard;
}

export function AudienceInsights({ analytics }: AudienceInsightsProps) {
  if (!analytics.demographics && analytics.genderMale === undefined && !analytics.trafficSources) {
    return null;
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-4">Audience Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {analytics.demographics && <AgeDistribution demographics={analytics.demographics} />}
        {(analytics.genderMale !== undefined || analytics.genderFemale !== undefined) && (
          <GenderSplit male={analytics.genderMale ?? 50} female={analytics.genderFemale ?? 50} />
        )}
        {analytics.trafficSources && <TrafficSources sources={analytics.trafficSources} />}
      </div>
    </section>
  );
}

function AgeDistribution({ demographics }: { demographics: Demographics }) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-white font-medium mb-4">Age Distribution</h3>
      <div className="space-y-3">
        {(Object.entries(demographics) as [string, number][]).map(([range, percentage]) => (
          <div key={range}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white/70">{range}</span>
              <span className="text-white">{percentage}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-teal-400 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GenderSplit({ male, female }: { male: number; female: number }) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-white font-medium mb-4">Gender Split</h3>
      <div className="flex justify-center mb-4">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray={`${male * 2.51} 251`} />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#ec4899" strokeWidth="20" strokeDasharray={`${female * 2.51} 251`} strokeDashoffset={`-${male * 2.51}`} />
          </svg>
        </div>
      </div>
      <div className="flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-white/70">Male {male}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pink-500" />
          <span className="text-white/70">Female {female}%</span>
        </div>
      </div>
    </div>
  );
}

function TrafficSources({ sources }: { sources: TrafficSourcesType }) {
  const labels: Record<string, string> = {
    forYou: 'For You',
    following: 'Following',
    profile: 'Profile',
    search: 'Search',
    other: 'Other',
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-white font-medium mb-4">Traffic Sources</h3>
      <div className="space-y-3">
        {(Object.entries(sources) as [string, number][]).map(([source, percentage]) => (
          <div key={source} className="flex items-center gap-3">
            <span className="text-white/70 flex-1">{labels[source] || source}</span>
            <span className="text-white font-medium">{percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
