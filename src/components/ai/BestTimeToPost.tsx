'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { apiClient } from '@/services/api/client';

/**
 * Best Time to Post — REAL metrics, no AI, no guessing.
 *
 * History: this widget used to generate its numbers with Math.random() dressed
 * up as "engagement potential", and was never mounted anywhere. It now shows
 * the actual hour-of-day view histogram from the backend
 * (/api/analytics/best-post-times): the creator's own audience hours once they
 * have enough views to be meaningful, platform-wide traffic until then —
 * exactly the feature as originally intended ("if the highest traffic on the
 * site is 5PM-10PM, that's the best time to post").
 */

interface TimesSummary {
  distribution: number[]; // 24 buckets, views per hour-of-day
  totalViews: number;
  bestHours: number[];
  bestWindow: string | null;
}

interface BestTimesResponse {
  global: TimesSummary;
  creator: TimesSummary | null;
  recommended: TimesSummary;
  source: string; // 'your audience' | 'platform traffic'
}

function formatHour(hour: number): string {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  return hour > 12 ? `${hour - 12}pm` : `${hour}am`;
}

export function BestTimeToPost({ className = '' }: { className?: string }) {
  const [data, setData] = useState<BestTimesResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    apiClient
      .get<BestTimesResponse>('/analytics/best-post-times')
      .then((res) => { if (alive) setData(res.data); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, []);

  // Failed or genuinely empty platform: render nothing rather than invent
  // numbers — inventing numbers is how the fake version happened.
  if (failed) return null;
  if (data && data.recommended.totalViews === 0) return null;

  const rec = data?.recommended;
  const max = rec ? Math.max(...rec.distribution, 1) : 1;

  return (
    <motion.div
      className={`glass-card p-4 rounded-2xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-medium">Best Time to Post</h3>
          <p className="text-white/50 text-sm">
            {data ? `Based on ${data.source}` : 'Loading…'}
          </p>
        </div>
        <div className="text-2xl">⏰</div>
      </div>

      {rec && (
        <>
          {rec.bestWindow && (
            <p className="text-white text-lg font-semibold mb-3">{rec.bestWindow}</p>
          )}

          {/* 24-hour histogram of real views */}
          <div className="flex items-end gap-0.5 h-16 mb-1">
            {rec.distribution.map((n, h) => (
              <div
                key={h}
                title={`${formatHour(h)}: ${n} views`}
                className={`flex-1 rounded-sm ${
                  rec.bestHours.includes(h)
                    ? 'bg-gradient-to-t from-purple-500 to-teal-400'
                    : 'bg-white/10'
                }`}
                style={{ height: `${Math.max(6, (n / max) * 100)}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-white/30">
            <span>12am</span>
            <span>6am</span>
            <span>12pm</span>
            <span>6pm</span>
            <span>11pm</span>
          </div>

          <p className="text-white/40 text-xs mt-3">
            {rec.totalViews.toLocaleString()} views analyzed (last 30 days)
          </p>
        </>
      )}
    </motion.div>
  );
}

export default BestTimeToPost;
