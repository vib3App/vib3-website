'use client';

import type { LiveBattle } from '@/types/liveBattle';

interface BattleVoteOverlayProps {
  battle: LiveBattle;
  onVote: (participantId: string) => void;
}

export function BattleVoteOverlay({ battle, onVote }: BattleVoteOverlayProps) {
  const { participant1, participant2 } = battle;
  const total = participant1.score + participant2.score;
  const p1Pct = total > 0 ? Math.round((participant1.score / total) * 100) : 50;

  return (
    <div className="absolute bottom-20 left-4 right-4 z-30">
      {/* Vote bar */}
      <div className="flex h-2 rounded-full overflow-hidden mb-3">
        <div className="bg-purple-500 transition-all duration-500" style={{ width: `${p1Pct}%` }} />
        <div className="bg-teal-500 transition-all duration-500" style={{ width: `${100 - p1Pct}%` }} />
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => onVote(participant1.userId)}
          className="px-6 py-2 bg-purple-500/80 text-white text-sm font-medium rounded-full hover:bg-purple-500 transition"
        >
          Vote @{participant1.username} ({participant1.score})
        </button>
        <button
          onClick={() => onVote(participant2.userId)}
          className="px-6 py-2 bg-teal-500/80 text-white text-sm font-medium rounded-full hover:bg-teal-500 transition"
        >
          Vote @{participant2.username} ({participant2.score})
        </button>
      </div>
    </div>
  );
}
