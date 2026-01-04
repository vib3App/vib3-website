'use client';

import type { UserStats } from '@/services/api';

interface UserStatsCardsProps {
  stats: UserStats;
}

export function UserStatsCards({ stats }: UserStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <p className="text-neutral-400 text-sm">Total Users</p>
        <p className="text-2xl font-bold text-white">{stats.total}</p>
      </div>
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <p className="text-neutral-400 text-sm">Admins</p>
        <p className="text-2xl font-bold text-red-400">{stats.admins}</p>
      </div>
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <p className="text-neutral-400 text-sm">Moderators</p>
        <p className="text-2xl font-bold text-blue-400">{stats.moderators}</p>
      </div>
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <p className="text-neutral-400 text-sm">Banned</p>
        <p className="text-2xl font-bold text-orange-400">{stats.banned}</p>
      </div>
    </div>
  );
}
