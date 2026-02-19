'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Gauntlet } from '@/types/gauntlet';

interface MyGauntletCardProps {
  gauntlet: Gauntlet;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  upcoming: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Upcoming' },
  active: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Active' },
  voting: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Voting' },
  completed: { bg: 'bg-white/10', text: 'text-white/50', label: 'Completed' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelled' },
};

export function MyGauntletCard({ gauntlet }: MyGauntletCardProps) {
  const status = statusConfig[gauntlet.status] || statusConfig.active;
  const hasActiveMatch = gauntlet.status === 'active' && gauntlet.pendingMatchId;

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <Link href={`/gauntlets/${gauntlet.id}`} className="flex gap-4 p-4 hover:bg-white/5 transition">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-white/5">
          {gauntlet.coverImageUrl ? (
            <Image src={gauntlet.coverImageUrl} alt={gauntlet.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-teal-500/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold truncate">{gauntlet.title}</h3>
            <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium shrink-0 ${status.bg} ${status.text}`}>{status.label}</span>
          </div>
          <p className="text-white/40 text-xs">Round {gauntlet.currentRound}/{gauntlet.totalRounds} &middot; {gauntlet.participantCount} participants</p>
        </div>
      </Link>
      {hasActiveMatch && (
        <div className="border-t border-white/5 px-4 py-2 flex gap-2">
          <Link href={`/gauntlets/${gauntlet.id}/match/${gauntlet.pendingMatchId}`}
            className="flex-1 text-center py-2 text-xs font-medium bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition">View Match</Link>
          <Link href={`/gauntlets/${gauntlet.id}/submit`}
            className="flex-1 text-center py-2 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition">Submit Video</Link>
        </div>
      )}
    </div>
  );
}
