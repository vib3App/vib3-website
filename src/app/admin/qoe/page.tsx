'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '@/services/api';
import type { QoEDashboard, QoEPeriod } from '@/services/api/admin/types';
import { logger } from '@/utils/logger';

const PERIOD_OPTIONS: { value: QoEPeriod; label: string }[] = [
  { value: '1h', label: 'Last hour' },
  { value: '24h', label: 'Last 24h' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

export default function QoEDashboardPage() {
  const [period, setPeriod] = useState<QoEPeriod>('24h');
  const [data, setData] = useState<QoEDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.getQoESummary(period);
      setData(result);
    } catch (err) {
      logger.error('Failed to fetch QoE data:', err);
      setError('Failed to load QoE data.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Video QoE Dashboard</h1>
          <p className="text-neutral-400 mt-1">
            Playback quality metrics from the mobile app
          </p>
        </div>
        <div className="flex gap-2">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === opt.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-white text-xl">Loading QoE data...</div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      ) : data ? (
        <>
          <SummaryCards summary={data.summary} />
          <TimeSeries timeSeries={data.timeSeries} period={period} />
          <WorstVideos videos={data.worstVideos} />
        </>
      ) : null}
    </div>
  );
}

function SummaryCards({ summary }: { summary: QoEDashboard['summary'] }) {
  const scoreColor =
    summary.avgQoeScore >= 80
      ? 'text-green-400'
      : summary.avgQoeScore >= 60
        ? 'text-yellow-400'
        : 'text-red-400';

  const latencyColor =
    summary.p95StartupLatencyMs <= 1000
      ? 'text-green-400'
      : summary.p95StartupLatencyMs <= 3000
        ? 'text-yellow-400'
        : 'text-red-400';

  const stallColor =
    summary.stallRate <= 5
      ? 'text-green-400'
      : summary.stallRate <= 15
        ? 'text-yellow-400'
        : 'text-red-400';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Avg QoE Score"
        value={summary.avgQoeScore.toFixed(1)}
        subtitle={`p50: ${summary.p50QoeScore.toFixed(1)}`}
        valueColor={scoreColor}
      />
      <StatCard
        label="Startup Latency (p95)"
        value={`${summary.p95StartupLatencyMs}ms`}
        subtitle={`avg: ${summary.avgStartupLatencyMs}ms / p50: ${summary.p50StartupLatencyMs}ms`}
        valueColor={latencyColor}
      />
      <StatCard
        label="Stall Rate"
        value={`${summary.stallRate}%`}
        subtitle={`rebuffer ratio: ${summary.avgRebufferRatio}%`}
        valueColor={stallColor}
      />
      <StatCard
        label="Sessions"
        value={summary.totalSessions.toLocaleString()}
        subtitle={`avg watch: ${summary.avgWatchTimeSec}s`}
        valueColor="text-white"
      />
      <StatCard
        label="Error Rate"
        value={`${summary.errorRate}%`}
        subtitle={`${summary.totalErrors} total errors`}
        valueColor={summary.errorRate <= 1 ? 'text-green-400' : 'text-red-400'}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  subtitle,
  valueColor,
}: {
  label: string;
  value: string;
  subtitle: string;
  valueColor: string;
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <p className="text-neutral-400 text-sm">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${valueColor}`}>{value}</p>
      <p className="text-neutral-500 text-xs mt-2">{subtitle}</p>
    </div>
  );
}

function TimeSeries({
  timeSeries,
  period,
}: {
  timeSeries: QoEDashboard['timeSeries'];
  period: QoEPeriod;
}) {
  if (timeSeries.length === 0) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center">
        <p className="text-neutral-400">No time series data for this period</p>
      </div>
    );
  }

  const maxSessions = Math.max(...timeSeries.map((t) => t.sessions), 1);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">QoE Over Time</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-neutral-400 border-b border-neutral-800">
              <th className="text-left py-3 px-2">Time</th>
              <th className="text-right py-3 px-2">Sessions</th>
              <th className="text-right py-3 px-2">Avg QoE</th>
              <th className="text-right py-3 px-2">Avg Startup</th>
              <th className="text-right py-3 px-2">Stall Rate</th>
              <th className="py-3 px-2 w-40">Volume</th>
            </tr>
          </thead>
          <tbody>
            {timeSeries.map((t, i) => {
              const date = new Date(t.time);
              const label =
                period === '1h' || period === '24h'
                  ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
              const barWidth = (t.sessions / maxSessions) * 100;

              return (
                <tr key={i} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                  <td className="py-2 px-2 text-neutral-300">{label}</td>
                  <td className="py-2 px-2 text-right text-white">{t.sessions}</td>
                  <td className={`py-2 px-2 text-right font-medium ${t.avgQoeScore >= 80 ? 'text-green-400' : t.avgQoeScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {t.avgQoeScore}
                  </td>
                  <td className={`py-2 px-2 text-right ${t.avgStartupLatencyMs <= 1000 ? 'text-green-400' : t.avgStartupLatencyMs <= 3000 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {t.avgStartupLatencyMs}ms
                  </td>
                  <td className={`py-2 px-2 text-right ${t.stallRate <= 5 ? 'text-green-400' : t.stallRate <= 15 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {t.stallRate}%
                  </td>
                  <td className="py-2 px-2">
                    <div className="w-full bg-neutral-800 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WorstVideos({ videos }: { videos: QoEDashboard['worstVideos'] }) {
  if (videos.length === 0) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-center">
        <p className="text-neutral-400">No video data with enough sessions (min 5)</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Worst Performing Videos</h2>
      <p className="text-neutral-500 text-sm mb-4">Videos with lowest QoE score (min 5 sessions)</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-neutral-400 border-b border-neutral-800">
              <th className="text-left py-3 px-2">Video ID</th>
              <th className="text-right py-3 px-2">Sessions</th>
              <th className="text-right py-3 px-2">Avg QoE</th>
              <th className="text-right py-3 px-2">Avg Startup</th>
              <th className="text-right py-3 px-2">Total Stalls</th>
              <th className="text-right py-3 px-2">Rebuffer %</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((v) => (
              <tr key={v.videoId} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                <td className="py-2 px-2">
                  <span className="text-neutral-300 font-mono text-xs">
                    {v.videoId.length > 20 ? `${v.videoId.slice(0, 8)}...${v.videoId.slice(-8)}` : v.videoId}
                  </span>
                </td>
                <td className="py-2 px-2 text-right text-white">{v.sessions}</td>
                <td className={`py-2 px-2 text-right font-medium ${v.avgQoeScore >= 80 ? 'text-green-400' : v.avgQoeScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {v.avgQoeScore}
                </td>
                <td className={`py-2 px-2 text-right ${v.avgStartupLatencyMs <= 1000 ? 'text-green-400' : v.avgStartupLatencyMs <= 3000 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {v.avgStartupLatencyMs}ms
                </td>
                <td className="py-2 px-2 text-right text-white">{v.totalStalls}</td>
                <td className={`py-2 px-2 text-right ${v.avgRebufferRatio <= 1 ? 'text-green-400' : v.avgRebufferRatio <= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {v.avgRebufferRatio}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
