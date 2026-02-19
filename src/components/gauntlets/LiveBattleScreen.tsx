'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { websocketService } from '@/services/websocket';
import { gauntletsApi } from '@/services/api/gauntlets';
import { logger } from '@/utils/logger';
import type { GauntletMatch } from '@/types/gauntlet';

interface LiveBattleScreenProps {
  match: GauntletMatch;
  gauntletId: string;
  roundNumber: number;
  matchupIndex: number;
}

const GIFT_TYPES = [
  { type: 'rose', label: 'Rose', cost: 10, emoji: '\uD83C\uDF39' },
  { type: 'fire', label: 'Fire', cost: 50, emoji: '\uD83D\uDD25' },
  { type: 'crown', label: 'Crown', cost: 100, emoji: '\uD83D\uDC51' },
  { type: 'rocket', label: 'Rocket', cost: 500, emoji: '\uD83D\uDE80' },
];

export function LiveBattleScreen({ match, gauntletId, roundNumber, matchupIndex }: LiveBattleScreenProps) {
  const [scores, setScores] = useState({ p1: match.participant1Votes, p2: match.participant2Votes });
  const [spectators, setSpectators] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [isEnded, setIsEnded] = useState(match.status === 'completed');
  const [comboCount, setComboCount] = useState(0);
  const [giftSending, setGiftSending] = useState(false);
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);

  // WebSocket listeners
  useEffect(() => {
    const unsubStart = websocketService.on('battle:started', (data: { matchId?: string }) => {
      if (data.matchId === match.id) setIsEnded(false);
    });

    const unsubGift = websocketService.on('battle:gift', (data: {
      matchId?: string; side?: number; scores?: { p1: number; p2: number }; spectators?: number;
    }) => {
      if (data.matchId !== match.id) return;
      if (data.scores) setScores(data.scores);
      if (data.spectators) setSpectators(data.spectators);
    });

    const unsubCombo = websocketService.on('battle:combo', (data: { matchId?: string; count?: number }) => {
      if (data.matchId === match.id && data.count) {
        setComboCount(data.count);
        setTimeout(() => setComboCount(0), 2000);
      }
    });

    const unsubEnd = websocketService.on('battle:ended', (data: { matchId?: string; scores?: { p1: number; p2: number } }) => {
      if (data.matchId !== match.id) return;
      setIsEnded(true);
      if (data.scores) setScores(data.scores);
    });

    // Also listen on existing battleUpdate handler for stream URLs
    const unsubUpdate = websocketService.onBattleUpdate((data: {
      matchId?: string; streamUrl1?: string; streamUrl2?: string; spectatorCount?: number;
    }) => {
      if (data.matchId !== match.id) return;
      if (data.spectatorCount) setSpectators(data.spectatorCount);
      if (data.streamUrl1 && video1Ref.current) {
        video1Ref.current.src = data.streamUrl1;
        video1Ref.current.play().catch(() => {});
      }
      if (data.streamUrl2 && video2Ref.current) {
        video2Ref.current.src = data.streamUrl2;
        video2Ref.current.play().catch(() => {});
      }
    });

    return () => { unsubStart(); unsubGift(); unsubCombo(); unsubEnd(); unsubUpdate(); };
  }, [match.id]);

  // Timer
  useEffect(() => {
    if (isEnded) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isEnded]);

  // Send gift
  const sendGift = useCallback(async (side: 1 | 2, giftType: string, coins: number) => {
    if (giftSending) return;
    setGiftSending(true);
    try {
      await gauntletsApi.sendGift(gauntletId, roundNumber, matchupIndex, {
        recipientSide: side, giftType, coins,
      });
    } catch (err) {
      logger.error('Failed to send gift:', err);
    } finally {
      setGiftSending(false);
    }
  }, [giftSending, gauntletId, roundNumber, matchupIndex]);

  const totalScore = scores.p1 + scores.p2;
  const p1Pct = totalScore > 0 ? Math.round((scores.p1 / totalScore) * 100) : 50;
  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;

  return (
    <div className="space-y-4">
      {/* Header: timer + spectators */}
      <div className="flex items-center justify-center gap-4">
        {!isEnded && (
          <>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              LIVE BATTLE
            </span>
            <span className="text-white font-mono font-bold text-lg">
              {mins}:{secs.toString().padStart(2, '0')}
            </span>
          </>
        )}
        {isEnded && (
          <span className="px-3 py-1 bg-white/10 text-white/50 text-xs font-bold rounded-full">ENDED</span>
        )}
        <span className="text-white/40 text-xs flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {spectators}
        </span>
      </div>

      {/* Combo indicator */}
      {comboCount > 1 && (
        <div className="text-center animate-bounce">
          <span className="px-4 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm rounded-full">
            {comboCount}x COMBO!
          </span>
        </div>
      )}

      {/* Split screen */}
      <div className="flex gap-3">
        <BattleSide
          username={match.participant1.username}
          avatar={match.participant1.avatar}
          videoUrl={match.videoUrl1}
          videoRef={video1Ref}
          score={scores.p1}
          color="purple"
          isWinner={isEnded && scores.p1 > scores.p2}
        />
        <div className="flex items-center shrink-0">
          <span className="text-white/20 font-bold text-2xl">VS</span>
        </div>
        <BattleSide
          username={match.participant2.username}
          avatar={match.participant2.avatar}
          videoUrl={match.videoUrl2}
          videoRef={video2Ref}
          score={scores.p2}
          color="teal"
          isWinner={isEnded && scores.p2 > scores.p1}
        />
      </div>

      {/* Score bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-white/10">
        <div className="bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500" style={{ width: `${p1Pct}%` }} />
        <div className="bg-gradient-to-r from-teal-400 to-teal-500 transition-all duration-500" style={{ width: `${100 - p1Pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-white/40">
        <span>{scores.p1} pts</span>
        <span>{scores.p2} pts</span>
      </div>

      {/* Gift buttons */}
      {!isEnded && (
        <div className="space-y-2">
          <p className="text-white/40 text-xs text-center">Send gifts to support a player</p>
          <div className="grid grid-cols-2 gap-2">
            <GiftRow side={1} onSend={sendGift} disabled={giftSending} label={match.participant1.username} />
            <GiftRow side={2} onSend={sendGift} disabled={giftSending} label={match.participant2.username} />
          </div>
        </div>
      )}
    </div>
  );
}

function BattleSide({ username, avatar, videoUrl, videoRef, score, color, isWinner }: {
  username: string; avatar?: string; videoUrl?: string;
  videoRef: React.RefObject<HTMLVideoElement | null>; score: number;
  color: 'purple' | 'teal'; isWinner: boolean;
}) {
  const gradBg = color === 'purple' ? 'from-purple-500 to-purple-600' : 'from-teal-400 to-teal-500';
  return (
    <div className={`flex-1 space-y-2 ${isWinner ? 'ring-2 ring-yellow-400 rounded-xl p-1' : ''}`}>
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${gradBg} flex items-center justify-center overflow-hidden`}>
          {avatar ? <Image src={avatar} alt={username} width={28} height={28} className="object-cover" /> : (
            <span className="text-white text-[10px] font-bold">{username[0]?.toUpperCase()}</span>
          )}
        </div>
        <span className="text-white text-xs font-medium truncate">@{username}</span>
        {isWinner && <span className="text-yellow-400 text-[10px]">Winner</span>}
      </div>
      <div className="aspect-[9/16] rounded-xl overflow-hidden bg-white/5 relative">
        {videoUrl ? (
          <video ref={videoRef} src={videoUrl} autoPlay playsInline muted className="w-full h-full object-cover" />
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover hidden" />
            <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">
              Waiting for stream...
            </div>
          </>
        )}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-white text-xs font-bold">{score}</div>
      </div>
    </div>
  );
}

function GiftRow({ side, onSend, disabled, label }: {
  side: 1 | 2; onSend: (s: 1 | 2, t: string, c: number) => void; disabled: boolean; label: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-white/50 text-[10px] truncate text-center">@{label}</p>
      <div className="flex gap-1">
        {GIFT_TYPES.map((g) => (
          <button
            key={g.type}
            onClick={() => onSend(side, g.type, g.cost)}
            disabled={disabled}
            className="flex-1 py-1.5 glass rounded-lg text-center hover:bg-white/10 transition disabled:opacity-50"
            title={`${g.label} (${g.cost} coins)`}
          >
            <span className="text-sm">{g.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
