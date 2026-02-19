'use client';

import Image from 'next/image';
import type { LiveBattle } from '@/types/liveBattle';

interface BattleResultOverlayProps {
  battle: LiveBattle;
  onClose: () => void;
}

export function BattleResultOverlay({ battle, onClose }: BattleResultOverlayProps) {
  const winner = battle.winnerId === battle.participant1.userId ? battle.participant1 : battle.participant2;
  const loser = battle.winnerId === battle.participant1.userId ? battle.participant2 : battle.participant1;
  const isDraw = !battle.winnerId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="glass-card rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-6">
          {isDraw ? 'Draw!' : 'Battle Over!'}
        </h2>
        {!isDraw && (
          <>
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden ring-4 ring-yellow-400/50 mb-3">
              {winner.avatar ? (
                <Image src={winner.avatar} alt={winner.username} width={80} height={80} className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl font-bold text-white">
                  {winner.username[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <p className="text-yellow-400 font-medium text-sm mb-1">Winner</p>
            <p className="text-white font-bold text-lg mb-1">@{winner.username}</p>
            <p className="text-white/40 text-sm mb-4">{winner.score} points</p>
            <p className="text-white/30 text-sm">vs @{loser.username} ({loser.score} points)</p>
          </>
        )}
        <button onClick={onClose} className="mt-6 px-8 py-2.5 glass text-white rounded-full hover:bg-white/10 transition">
          Continue Watching
        </button>
      </div>
    </div>
  );
}
