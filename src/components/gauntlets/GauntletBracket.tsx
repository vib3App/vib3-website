'use client';

import Link from 'next/link';
import { GauntletMatchCard } from './GauntletMatchCard';
import type { GauntletRound } from '@/types/gauntlet';

interface GauntletBracketProps {
  rounds: GauntletRound[];
  gauntletId?: string;
  onVote: (matchId: string, participantId: string) => void;
}

export function GauntletBracket({ rounds, gauntletId, onVote }: GauntletBracketProps) {
  if (rounds.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/40">Bracket not yet available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {rounds.map(round => (
        <div key={round.id}>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-white font-semibold">Round {round.roundNumber}</h3>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              round.status === 'active' ? 'bg-green-500/20 text-green-400' :
              round.status === 'completed' ? 'bg-white/10 text-white/40' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {round.status}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {round.matches.map(match => (
              gauntletId ? (
                <Link key={match.id} href={`/gauntlets/${gauntletId}/match/${match.id}`} className="block hover:scale-[1.01] transition-transform">
                  <GauntletMatchCard match={match} onVote={onVote} />
                </Link>
              ) : (
                <GauntletMatchCard key={match.id} match={match} onVote={onVote} />
              )
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
