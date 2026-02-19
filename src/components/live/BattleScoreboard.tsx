'use client';

import type { LiveBattle } from '@/types/liveBattle';

interface BattleScoreboardProps {
  battle: LiveBattle;
  timeRemaining: number;
}

export function BattleScoreboard({ battle, timeRemaining }: BattleScoreboardProps) {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30">
      <div className="glass rounded-2xl px-6 py-3 flex items-center gap-6">
        <div className="text-center">
          <p className="text-purple-400 font-bold text-xl">{battle.participant1.score}</p>
          <p className="text-white/40 text-xs">@{battle.participant1.username}</p>
        </div>
        <div className="text-center">
          <p className="text-white/30 text-xs uppercase">
            {battle.status === 'active' ? 'Live' : battle.status}
          </p>
          <p className="text-white font-mono font-bold">{formatTime(timeRemaining)}</p>
        </div>
        <div className="text-center">
          <p className="text-teal-400 font-bold text-xl">{battle.participant2.score}</p>
          <p className="text-white/40 text-xs">@{battle.participant2.username}</p>
        </div>
      </div>
    </div>
  );
}
