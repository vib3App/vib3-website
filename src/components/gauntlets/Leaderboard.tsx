'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { gauntletsApi } from '@/services/api/gauntlets';
import { logger } from '@/utils/logger';
import type { LeaderboardEntry } from '@/types/gauntlet';

interface LeaderboardProps {
  gauntletId: string;
}

const MEDAL_COLORS = ['text-yellow-400', 'text-gray-300', 'text-orange-400'];
const MEDAL_BG = ['bg-yellow-400/10 ring-1 ring-yellow-400/30', 'bg-gray-400/10 ring-1 ring-gray-400/30', 'bg-orange-400/10 ring-1 ring-orange-400/30'];
const MEDAL_ICONS = ['\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49'];

export function Leaderboard({ gauntletId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    gauntletsApi.getLeaderboard(gauntletId)
      .then(setEntries)
      .catch((err) => logger.error('Failed to load leaderboard:', err))
      .finally(() => setIsLoading(false));
  }, [gauntletId]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl animate-pulse">
            <div className="w-6 h-4 bg-white/10 rounded" />
            <div className="w-10 h-10 bg-white/10 rounded-full" />
            <div className="flex-1 h-4 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/40">No leaderboard data yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Top 3 highlighted */}
      {entries.slice(0, 3).map((entry, idx) => (
        <div
          key={entry.userId}
          className={`flex items-center gap-3 p-3 rounded-xl ${MEDAL_BG[idx]}`}
        >
          <span className="text-lg w-8 text-center shrink-0">{MEDAL_ICONS[idx]}</span>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 shrink-0">
            {entry.avatar ? (
              <Image src={entry.avatar} alt={entry.username} width={40} height={40} className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-purple-500 to-teal-500">
                {entry.username[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-sm ${MEDAL_COLORS[idx]}`}>@{entry.username}</p>
            <p className="text-white/40 text-xs">{entry.wins}W - {entry.losses}L</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-white font-bold text-sm">{entry.points}</p>
            <p className="text-white/30 text-xs">pts</p>
          </div>
        </div>
      ))}

      {/* Rest of leaderboard */}
      {entries.slice(3).map((entry) => (
        <div
          key={entry.userId}
          className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/5 transition"
        >
          <span className="text-white/30 font-mono text-sm w-8 text-center shrink-0">
            #{entry.rank}
          </span>
          <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 shrink-0">
            {entry.avatar ? (
              <Image src={entry.avatar} alt={entry.username} width={32} height={32} className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50 text-xs font-bold">
                {entry.username[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-sm font-medium truncate">@{entry.username}</p>
          </div>
          <div className="flex gap-4 text-xs text-white/40 shrink-0">
            <span>{entry.wins}W</span>
            <span>{entry.losses}L</span>
            <span className="text-white/60 font-medium">{entry.points} pts</span>
          </div>
        </div>
      ))}
    </div>
  );
}
