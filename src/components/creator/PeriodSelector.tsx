'use client';

import type { Period } from '@/hooks/useCreator';

interface PeriodSelectorProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
}

const PERIODS: { value: Period; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '1y', label: '1 year' },
];

export function PeriodSelector({ period, onPeriodChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-2">
      {PERIODS.map(p => (
        <button
          key={p.value}
          onClick={() => onPeriodChange(p.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            period === p.value
              ? 'bg-white text-black'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
