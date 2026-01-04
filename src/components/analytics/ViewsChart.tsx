'use client';

import { formatNumber } from './analyticsUtils';

interface ViewsChartProps {
  viewsHistory: number[];
  period: number;
}

export function ViewsChart({ viewsHistory, period }: ViewsChartProps) {
  if (!viewsHistory || viewsHistory.length === 0) return null;

  const maxViews = Math.max(...viewsHistory, 1);

  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-4">Views Over Time</h2>
      <div className="glass-card p-6">
        <div className="h-64 flex items-end justify-between gap-1">
          {viewsHistory.map((views, i) => {
            const height = (views / maxViews) * 100;
            return (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-purple-500 to-teal-400 rounded-t-sm transition-all hover:opacity-80 group relative"
                style={{ height: `${Math.max(height, 2)}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  {formatNumber(views)}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-4 text-white/40 text-xs">
          <span>{period} days ago</span>
          <span>{Math.floor(period / 2)} days ago</span>
          <span>Today</span>
        </div>
      </div>
    </section>
  );
}
