'use client';

import Link from 'next/link';
import type { LeaderboardEntry } from '@/types/achievement';

interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

function getRankDisplay(rank: number) {
  if (rank === 1) return { icon: '🥇', color: 'text-yellow-400' };
  if (rank === 2) return { icon: '🥈', color: 'text-gray-300' };
  if (rank === 3) return { icon: '🥉', color: 'text-amber-600' };
  return { icon: `#${rank}`, color: 'text-white/50' };
}

export function LeaderboardItem({ entry, isCurrentUser }: LeaderboardItemProps) {
  const rankDisplay = getRankDisplay(entry.rank);

  return (
    <Link
      href={`/@${entry.username}`}
      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
        isCurrentUser ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-white/5 hover:bg-white/10'
      }`}
    >
      <div className={`w-8 text-center font-bold ${rankDisplay.color}`}>
        {rankDisplay.icon}
      </div>

      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
        {entry.profilePicture ? (
          <img src={entry.profilePicture} alt={entry.username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-bold">
            {entry.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-white font-medium truncate">{entry.username}</span>
          {entry.isVerified && (
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          )}
        </div>
        <span className="text-white/50 text-sm">Level {entry.level}</span>
      </div>

      <div className="text-right">
        <div className="text-white font-medium">{entry.totalXp.toLocaleString()}</div>
        <div className="text-white/50 text-xs">XP</div>
      </div>
    </Link>
  );
}
