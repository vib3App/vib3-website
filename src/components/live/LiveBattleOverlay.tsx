'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { websocketService } from '@/services/websocket';
import type { LiveBattle, BattleParticipant } from '@/types/liveBattle';

/**
 * Gap #40: Battle in Live Stream
 *
 * Split-screen overlay for live battles:
 *  - Host left, challenger right
 *  - Tug-of-war score bar
 *  - Timer countdown
 *  - Gift buttons for each side
 *
 * Listens to WebSocket events:
 *  battle:started_in_stream, battle:ended_in_stream
 */

interface LiveBattleOverlayProps {
  streamId: string;
  onSendGift?: (participantId: string) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function ScoreBar({ p1Score, p2Score }: { p1Score: number; p2Score: number }) {
  const total = p1Score + p2Score || 1;
  const p1Pct = Math.round((p1Score / total) * 100);
  const p2Pct = 100 - p1Pct;

  return (
    <div className="w-full h-4 rounded-full overflow-hidden flex bg-white/10">
      <div
        className="h-full bg-gradient-to-r from-pink-500 to-red-500 transition-all duration-500"
        style={{ width: `${p1Pct}%` }}
      />
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
        style={{ width: `${p2Pct}%` }}
      />
    </div>
  );
}

function ParticipantInfo({
  participant,
  side,
}: {
  participant: BattleParticipant;
  side: 'left' | 'right';
}) {
  return (
    <div className={`flex items-center gap-2 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
      <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
        {participant.avatar ? (
          <Image
            src={participant.avatar}
            alt={participant.username}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
            {participant.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className={side === 'right' ? 'text-right' : ''}>
        <p className="text-white text-sm font-semibold">{participant.username}</p>
        <p className="text-yellow-400 text-xs">{participant.giftValue} coins</p>
      </div>
    </div>
  );
}

export function LiveBattleOverlay({ streamId, onSendGift }: LiveBattleOverlayProps) {
  const [battle, setBattle] = useState<LiveBattle | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Listen for battle events
  useEffect(() => {
    const unsubStart = websocketService.on('battle:started_in_stream', (data: LiveBattle) => {
      if (data.streamId === streamId) {
        setBattle(data);
      }
    });

    const unsubUpdate = websocketService.onBattleUpdate((data: LiveBattle) => {
      if (data.streamId === streamId) {
        setBattle(data);
      }
    });

    const unsubEnd = websocketService.on('battle:ended_in_stream', (data: LiveBattle) => {
      if (data.streamId === streamId) {
        setBattle(data);
        // Auto-dismiss after 5 seconds
        setTimeout(() => setBattle(null), 5000);
      }
    });

    return () => {
      unsubStart();
      unsubUpdate();
      unsubEnd();
    };
  }, [streamId]);

  // Countdown timer
  useEffect(() => {
    if (!battle || battle.status !== 'active' || !battle.startedAt) return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - new Date(battle.startedAt!).getTime()) / 1000;
      const remaining = Math.max(0, battle.duration - elapsed);
      setTimeRemaining(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [battle]);

  const handleVoteP1 = useCallback(() => {
    if (battle) websocketService.send('battle:vote', { battleId: battle.id, participantId: battle.participant1.userId });
  }, [battle]);

  const handleVoteP2 = useCallback(() => {
    if (battle) websocketService.send('battle:vote', { battleId: battle.id, participantId: battle.participant2.userId });
  }, [battle]);

  const handleGiftP1 = useCallback(() => {
    if (battle && onSendGift) onSendGift(battle.participant1.userId);
  }, [battle, onSendGift]);

  const handleGiftP2 = useCallback(() => {
    if (battle && onSendGift) onSendGift(battle.participant2.userId);
  }, [battle, onSendGift]);

  if (!battle) return null;

  const isCompleted = battle.status === 'completed';
  const winner = battle.winnerId === battle.participant1.userId
    ? battle.participant1
    : battle.winnerId === battle.participant2.userId
      ? battle.participant2
      : null;

  return (
    <div className="absolute inset-x-0 top-0 z-40 pointer-events-auto">
      {/* Battle header */}
      <div className="bg-black/80 backdrop-blur-lg p-4">
        {/* Timer */}
        <div className="text-center mb-3">
          {isCompleted ? (
            <div className="text-yellow-400 font-bold text-lg">
              {winner ? `${winner.username} Wins!` : 'Battle Over!'}
            </div>
          ) : (
            <div className="text-white font-bold text-2xl tabular-nums">
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>

        {/* Participants */}
        <div className="flex items-center justify-between mb-3">
          <ParticipantInfo participant={battle.participant1} side="left" />
          <div className="text-white/40 text-xs font-bold">VS</div>
          <ParticipantInfo participant={battle.participant2} side="right" />
        </div>

        {/* Score bar (tug-of-war) */}
        <ScoreBar
          p1Score={battle.participant1.score}
          p2Score={battle.participant2.score}
        />
        <div className="flex justify-between mt-1 text-xs text-white/50">
          <span>{battle.participant1.score}</span>
          <span>{battle.participant2.score}</span>
        </div>

        {/* Vote + Gift buttons for each side */}
        {!isCompleted && (
          <div className="flex justify-between mt-3 gap-2">
            <div className="flex flex-col gap-1.5 flex-1">
              <button
                onClick={handleVoteP1}
                className="w-full px-3 py-2 bg-pink-500/30 text-pink-300 rounded-full text-xs font-bold hover:bg-pink-500/40 transition border border-pink-500/20"
              >
                Vote {battle.participant1.username}
              </button>
              {onSendGift && (
                <button
                  onClick={handleGiftP1}
                  className="w-full px-3 py-1.5 bg-pink-500/10 text-pink-400/70 rounded-full text-[11px] hover:bg-pink-500/20 transition"
                >
                  Gift
                </button>
              )}
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <button
                onClick={handleVoteP2}
                className="w-full px-3 py-2 bg-blue-500/30 text-blue-300 rounded-full text-xs font-bold hover:bg-blue-500/40 transition border border-blue-500/20"
              >
                Vote {battle.participant2.username}
              </button>
              {onSendGift && (
                <button
                  onClick={handleGiftP2}
                  className="w-full px-3 py-1.5 bg-blue-500/10 text-blue-400/70 rounded-full text-[11px] hover:bg-blue-500/20 transition"
                >
                  Gift
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
