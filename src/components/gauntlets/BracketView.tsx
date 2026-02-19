'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { GauntletRound, GauntletMatch } from '@/types/gauntlet';

interface BracketViewProps {
  rounds: GauntletRound[];
  gauntletId: string;
  onSelectRound?: (round: GauntletRound) => void;
  onSelectMatch?: (match: GauntletMatch) => void;
}

const STATUS_COLORS = {
  active: 'border-purple-500 bg-purple-500/10',
  completed: 'border-green-500/50 bg-green-500/5',
  pending: 'border-white/10 bg-white/5',
};

const STATUS_LABELS = {
  active: 'bg-purple-500/20 text-purple-400',
  completed: 'bg-green-500/20 text-green-400',
  pending: 'bg-white/10 text-white/40',
};

function MatchupBox({ match, onClick }: { match: GauntletMatch; onClick?: () => void }) {
  const isCompleted = match.status === 'completed';
  const isActive = match.status === 'active';

  return (
    <button
      onClick={onClick}
      className={`w-full border rounded-lg p-2 text-left transition hover:scale-[1.02] ${STATUS_COLORS[match.status]}`}
    >
      <PlayerRow
        username={match.participant1.username}
        avatar={match.participant1.avatar}
        score={match.participant1Votes}
        isWinner={match.winnerId === match.participant1.userId}
        isEliminated={match.participant1.isEliminated}
        isActive={isActive}
      />
      <div className="h-px bg-white/10 my-1" />
      <PlayerRow
        username={match.participant2.username}
        avatar={match.participant2.avatar}
        score={match.participant2Votes}
        isWinner={match.winnerId === match.participant2.userId}
        isEliminated={match.participant2.isEliminated}
        isActive={isActive}
      />
      {isCompleted && match.winnerId && (
        <div className="mt-1 text-center text-[10px] text-green-400/60">Completed</div>
      )}
    </button>
  );
}

function PlayerRow({ username, avatar, score, isWinner, isEliminated, isActive }: {
  username: string; avatar?: string; score: number;
  isWinner: boolean; isEliminated: boolean; isActive: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${isEliminated && !isActive ? 'opacity-40' : ''}`}>
      <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 bg-white/10">
        {avatar ? (
          <Image src={avatar} alt={username} width={20} height={20} className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[9px] text-white/60 font-bold">
            {username[0]?.toUpperCase()}
          </div>
        )}
      </div>
      <span className={`text-xs font-medium truncate flex-1 ${
        isWinner ? 'text-yellow-400' : isEliminated ? 'text-white/30 line-through' : 'text-white/80'
      }`}>
        {username}
      </span>
      <span className="text-xs text-white/40 tabular-nums">{score}</span>
      {isWinner && <span className="text-yellow-400 text-[10px]">W</span>}
    </div>
  );
}

export function BracketView({ rounds, gauntletId, onSelectRound, onSelectMatch }: BracketViewProps) {
  const [hoveredRound, setHoveredRound] = useState<string | null>(null);

  if (rounds.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/40">Bracket not available yet</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max px-2">
        {rounds.map((round, roundIdx) => (
          <div
            key={round.id}
            className="flex flex-col gap-4 min-w-[180px] max-w-[220px]"
            onMouseEnter={() => setHoveredRound(round.id)}
            onMouseLeave={() => setHoveredRound(null)}
          >
            {/* Round header */}
            <button
              onClick={() => onSelectRound?.(round)}
              className="text-center space-y-1 transition hover:opacity-80"
            >
              <div className="flex items-center justify-center gap-2">
                <h4 className="text-white text-sm font-semibold">Round {round.roundNumber}</h4>
                <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${STATUS_LABELS[round.status]}`}>
                  {round.status}
                </span>
              </div>
              {round.theme && (
                <p className="text-white/40 text-xs truncate">{round.theme}</p>
              )}
            </button>

            {/* Matchups */}
            <div className="flex flex-col gap-3 relative">
              {round.matches.map((match, matchIdx) => (
                <div key={match.id} className="relative">
                  <MatchupBox
                    match={match}
                    onClick={() => onSelectMatch?.(match)}
                  />
                  {/* Connector line to next round */}
                  {roundIdx < rounds.length - 1 && (
                    <div className="absolute top-1/2 -right-6 w-6 h-px bg-white/10" />
                  )}
                </div>
              ))}
            </div>

            {/* Round connector vertical lines */}
            {roundIdx < rounds.length - 1 && round.matches.length > 1 && (
              <div className="absolute right-0 top-0 bottom-0 pointer-events-none" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
