'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Gauntlet } from '@/types/gauntlet';

interface GauntletCardProps {
  gauntlet: Gauntlet;
}

const statusColors: Record<string, string> = {
  upcoming: 'from-blue-500 to-cyan-400',
  active: 'from-green-500 to-emerald-400',
  voting: 'from-purple-500 to-pink-400',
  completed: 'from-gray-500 to-gray-400',
  cancelled: 'from-red-500 to-orange-400',
};

export function GauntletCard({ gauntlet }: GauntletCardProps) {
  return (
    <Link href={`/gauntlets/${gauntlet.id}`} className="glass-card rounded-xl overflow-hidden hover:ring-1 hover:ring-white/20 transition-all group">
      <div className="relative h-40 bg-white/5">
        {gauntlet.coverImageUrl ? (
          <Image src={gauntlet.coverImageUrl} alt={gauntlet.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-teal-500/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-0.5 text-xs font-medium text-white rounded-full bg-gradient-to-r ${statusColors[gauntlet.status] || statusColors.active}`}>
            {gauntlet.status}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold truncate group-hover:text-purple-300 transition-colors">{gauntlet.title}</h3>
        <p className="text-white/50 text-sm mt-1 line-clamp-2">{gauntlet.description}</p>
        <div className="flex items-center justify-between mt-3 text-xs text-white/40">
          <span>{gauntlet.participantCount}/{gauntlet.maxParticipants} joined</span>
          <span>Round {gauntlet.currentRound}/{gauntlet.totalRounds}</span>
        </div>
      </div>
    </Link>
  );
}
