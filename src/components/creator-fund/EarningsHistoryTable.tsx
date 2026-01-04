'use client';

import type { EarningPeriod } from '@/types/creatorFund';

function formatCount(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

interface EarningsHistoryTableProps {
  earnings: EarningPeriod[];
}

export function EarningsHistoryTable({ earnings }: EarningsHistoryTableProps) {
  if (earnings.length === 0) {
    return (
      <section className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-white text-xl font-semibold mb-2">No earnings yet</h3>
        <p className="text-white/50">Start creating content to earn from the Creator Fund!</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-4">Earnings History</h2>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/50 text-sm font-medium px-6 py-4">Month</th>
                <th className="text-right text-white/50 text-sm font-medium px-6 py-4">Views</th>
                <th className="text-right text-white/50 text-sm font-medium px-6 py-4">Earnings</th>
                <th className="text-right text-white/50 text-sm font-medium px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((entry) => (
                <tr key={entry._id || entry.periodDisplay} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4 text-white">{entry.periodDisplay}</td>
                  <td className="px-6 py-4 text-right text-white/70">{formatCount(entry.views)}</td>
                  <td className="px-6 py-4 text-right text-green-500 font-medium">${entry.earnings.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.status === 'paid'
                          ? 'bg-green-500/20 text-green-500'
                          : entry.status === 'approved'
                          ? 'bg-blue-500/20 text-blue-500'
                          : 'bg-amber-500/20 text-amber-500'
                      }`}
                    >
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
