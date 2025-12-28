'use client';

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import type { CreatorAnalytics, AnalyticsTrend } from '@/types/creator';
import { formatCount } from '@/utils/format';

interface AudienceTabProps {
  analytics: CreatorAnalytics;
  trends: AnalyticsTrend[];
}

function FollowerGrowthCard({ analytics, trends }: { analytics: CreatorAnalytics; trends: AnalyticsTrend[] }) {
  const maxFollowers = Math.max(...trends.map(t => t.followers), 1);

  return (
    <div className="bg-white/5 rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4">Follower Growth</h2>
      <div className="flex items-center gap-4 mb-4">
        <div className="text-4xl font-bold">{formatCount(analytics.overview.totalFollowers)}</div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
          analytics.overview.followerGrowth >= 0
            ? 'bg-green-500/20 text-green-400'
            : 'bg-red-500/20 text-red-400'
        }`}>
          {analytics.overview.followerGrowth >= 0 ? (
            <ArrowUpIcon className="w-3 h-3" />
          ) : (
            <ArrowDownIcon className="w-3 h-3" />
          )}
          {Math.abs(analytics.overview.followerGrowth)}%
        </div>
      </div>
      <div className="h-40 flex items-end gap-1">
        {trends.map((trend, i) => (
          <div
            key={i}
            className="flex-1 bg-gradient-to-t from-pink-500 to-purple-500 rounded-t"
            style={{
              height: `${(trend.followers / maxFollowers) * 100}%`,
              minHeight: '4px',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function AgeGroupsChart({ ageGroups }: { ageGroups: { range: string; percentage: number }[] }) {
  return (
    <div className="bg-white/5 rounded-2xl p-6">
      <h3 className="font-semibold mb-4">Age Groups</h3>
      <div className="space-y-3">
        {ageGroups.map(group => (
          <div key={group.range} className="flex items-center gap-3">
            <span className="w-12 text-sm text-gray-400">{group.range}</span>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                style={{ width: `${group.percentage}%` }}
              />
            </div>
            <span className="w-12 text-right text-sm">{group.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CountriesChart({ countries }: { countries: { country: string; percentage: number }[] }) {
  return (
    <div className="bg-white/5 rounded-2xl p-6">
      <h3 className="font-semibold mb-4">Top Countries</h3>
      <div className="space-y-3">
        {countries.slice(0, 5).map(country => (
          <div key={country.country} className="flex items-center gap-3">
            <span className="w-24 text-sm truncate">{country.country}</span>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                style={{ width: `${country.percentage}%` }}
              />
            </div>
            <span className="w-12 text-right text-sm">{country.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActiveHoursChart({ activeHours }: { activeHours: { hour: number; percentage: number }[] }) {
  return (
    <div className="bg-white/5 rounded-2xl p-6">
      <h3 className="font-semibold mb-4">When Your Audience is Active</h3>
      <div className="h-32 flex items-end gap-1">
        {activeHours.map((hour, i) => (
          <div
            key={i}
            className="flex-1 bg-gradient-to-t from-pink-500/50 to-purple-500/50 rounded-t hover:from-pink-500 hover:to-purple-500 transition group relative"
            style={{
              height: `${hour.percentage}%`,
              minHeight: '4px',
            }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black rounded text-xs opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
              {hour.hour}:00 - {hour.percentage}%
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>12AM</span>
        <span>6AM</span>
        <span>12PM</span>
        <span>6PM</span>
        <span>12AM</span>
      </div>
    </div>
  );
}

export function AudienceTab({ analytics, trends }: AudienceTabProps) {
  return (
    <div className="space-y-6">
      <FollowerGrowthCard analytics={analytics} trends={trends} />
      <div className="grid sm:grid-cols-2 gap-6">
        <AgeGroupsChart ageGroups={analytics.audienceInsights.demographics.ageGroups} />
        <CountriesChart countries={analytics.audienceInsights.demographics.countries} />
      </div>
      <ActiveHoursChart activeHours={analytics.audienceInsights.activeHours} />
    </div>
  );
}
