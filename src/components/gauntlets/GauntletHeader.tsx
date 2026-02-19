'use client';

import Image from 'next/image';
import type { Gauntlet } from '@/types/gauntlet';

interface GauntletHeaderProps {
  gauntlet: Gauntlet;
  onJoin: () => void;
  onLeave: () => void;
}

export function GauntletHeader({ gauntlet, onJoin, onLeave }: GauntletHeaderProps) {
  const canJoin = gauntlet.status === 'upcoming' && !gauntlet.isJoined && gauntlet.participantCount < gauntlet.maxParticipants;

  return (
    <div className="glass-card rounded-2xl overflow-hidden mb-6">
      <div className="relative h-48 bg-gradient-to-br from-purple-500/30 to-teal-500/30">
        {gauntlet.coverImageUrl && <Image src={gauntlet.coverImageUrl} alt={gauntlet.title} fill className="object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="p-4 -mt-12 relative">
        <h1 className="text-2xl font-bold text-white mb-1">{gauntlet.title}</h1>
        {gauntlet.description && <p className="text-white/60 text-sm mb-3">{gauntlet.description}</p>}
        <div className="flex flex-wrap gap-3 text-sm text-white/50 mb-4">
          <span className="glass px-3 py-1 rounded-full">{gauntlet.category}</span>
          <span className="glass px-3 py-1 rounded-full">{gauntlet.participantCount}/{gauntlet.maxParticipants} participants</span>
          <span className="glass px-3 py-1 rounded-full">Round {gauntlet.currentRound}/{gauntlet.totalRounds}</span>
          {gauntlet.prizeDescription && <span className="glass px-3 py-1 rounded-full">Prize: {gauntlet.prizeDescription}</span>}
        </div>
        {canJoin && (
          <button onClick={onJoin} className="w-full py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white font-semibold rounded-xl">
            Join Gauntlet
          </button>
        )}
        {gauntlet.isJoined && gauntlet.status === 'upcoming' && (
          <button onClick={onLeave} className="w-full py-3 glass text-white/70 font-medium rounded-xl hover:bg-white/10 transition">
            Leave Gauntlet
          </button>
        )}
      </div>
    </div>
  );
}
