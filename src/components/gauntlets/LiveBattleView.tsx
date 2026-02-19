'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { websocketService } from '@/services/websocket';
import { liveApi } from '@/services/api';
import { logger } from '@/utils/logger';
import type { GauntletMatch } from '@/types/gauntlet';
import type { LiveKitCredentials } from '@/types/live';

interface LiveBattleViewProps {
  match: GauntletMatch;
  gauntletId: string;
  spectatorCount: number;
  onVote: (participantId: string) => void;
  isVoting: boolean;
}

export function LiveBattleView({ match, gauntletId, spectatorCount, onVote, isVoting }: LiveBattleViewProps) {
  const [liveKit, setLiveKit] = useState<LiveKitCredentials | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const [isLiveMode, setIsLiveMode] = useState(false);

  // Check if this match has live video streams available
  useEffect(() => {
    const checkLive = async () => {
      try {
        // Try to get LiveKit token for this battle room
        const streamId = `battle-${gauntletId}-${match.id}`;
        const token = await liveApi.getLiveKitToken(streamId);
        if (token) {
          setLiveKit({ token: token.token, wsUrl: token.wsUrl, roomName: token.roomName });
          setIsLiveMode(true);
        }
      } catch {
        // No live room available -- use video comparison mode
        setIsLiveMode(false);
      }
    };
    if (match.status === 'active') checkLive();
  }, [match.id, match.status, gauntletId]);

  // Timer for active battles
  useEffect(() => {
    if (match.status !== 'active') return;
    // Assume 3 minute battle duration
    const battleDuration = 180;
    const interval = setInterval(() => {
      const now = Date.now();
      // Estimate start from current votes activity
      const remaining = Math.max(0, battleDuration - Math.floor(now / 1000) % battleDuration);
      setTimeRemaining(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [match.status]);

  // Listen for live video stream URLs via WebSocket
  useEffect(() => {
    const unsub = websocketService.onBattleUpdate((data: { matchId?: string; streamUrl1?: string; streamUrl2?: string }) => {
      if (data.matchId !== match.id) return;
      if (data.streamUrl1 && video1Ref.current) {
        video1Ref.current.src = data.streamUrl1;
        video1Ref.current.play().catch(() => {});
      }
      if (data.streamUrl2 && video2Ref.current) {
        video2Ref.current.src = data.streamUrl2;
        video2Ref.current.play().catch(() => {});
      }
    });
    return unsub;
  }, [match.id]);

  const totalVotes = match.participant1Votes + match.participant2Votes;
  const p1Pct = totalVotes > 0 ? Math.round((match.participant1Votes / totalVotes) * 100) : 50;
  const p2Pct = 100 - p1Pct;
  const canVote = match.status === 'active' && !match.userVote;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Live indicator + timer */}
      <div className="flex items-center justify-center gap-4">
        {match.status === 'active' && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full uppercase">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            {isLiveMode ? 'Live Battle' : 'Live Voting'}
          </span>
        )}
        {match.status === 'active' && timeRemaining > 0 && (
          <span className="text-white font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
        )}
        {spectatorCount > 0 && (
          <span className="text-white/40 text-xs flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {spectatorCount}
          </span>
        )}
      </div>

      {/* Split screen video feeds */}
      <div className="flex gap-3">
        <ContestantPanel
          username={match.participant1.username}
          avatar={match.participant1.avatar}
          videoUrl={match.videoUrl1}
          videoRef={video1Ref}
          score={match.participant1Votes}
          isLive={isLiveMode && match.status === 'active'}
          isWinner={match.winnerId === match.participant1.userId}
          color="purple"
        />
        <div className="flex items-center shrink-0">
          <span className="text-white/20 font-bold text-2xl">VS</span>
        </div>
        <ContestantPanel
          username={match.participant2.username}
          avatar={match.participant2.avatar}
          videoUrl={match.videoUrl2}
          videoRef={video2Ref}
          score={match.participant2Votes}
          isLive={isLiveMode && match.status === 'active'}
          isWinner={match.winnerId === match.participant2.userId}
          color="teal"
        />
      </div>

      {/* Real-time vote bar */}
      {totalVotes > 0 && (
        <div className="glass-card rounded-xl p-3">
          <div className="flex justify-between text-xs text-white/60 mb-1">
            <span>{p1Pct}%</span>
            <span>{p2Pct}%</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-white/10">
            <div className="bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500" style={{ width: `${p1Pct}%` }} />
            <div className="bg-gradient-to-r from-teal-400 to-teal-500 transition-all duration-500" style={{ width: `${p2Pct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>{match.participant1Votes} votes</span>
            <span>{match.participant2Votes} votes</span>
          </div>
        </div>
      )}

      {/* Vote buttons */}
      {canVote && (
        <div className="flex gap-3">
          <button
            onClick={() => onVote(match.participant1.userId)}
            disabled={isVoting}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            Vote @{match.participant1.username}
          </button>
          <button
            onClick={() => onVote(match.participant2.userId)}
            disabled={isVoting}
            className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-teal-400 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            Vote @{match.participant2.username}
          </button>
        </div>
      )}

      {match.userVote && (
        <div className="text-center">
          <span className="px-4 py-2 text-sm bg-purple-500/20 text-purple-300 rounded-full">
            You voted for @{match.userVote === match.participant1.userId ? match.participant1.username : match.participant2.username}
          </span>
        </div>
      )}
    </div>
  );
}

function ContestantPanel({ username, avatar, videoUrl, videoRef, score, isLive, isWinner, color }: {
  username: string;
  avatar?: string;
  videoUrl?: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  score: number;
  isLive: boolean;
  isWinner: boolean;
  color: 'purple' | 'teal';
}) {
  const borderColor = isWinner ? 'ring-2 ring-yellow-400' : '';
  const gradBg = color === 'purple' ? 'from-purple-500 to-purple-600' : 'from-teal-400 to-teal-500';

  return (
    <div className={`flex-1 space-y-2 ${borderColor} ${isWinner ? 'rounded-xl p-1' : ''}`}>
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradBg} flex items-center justify-center overflow-hidden`}>
          {avatar ? <Image src={avatar} alt={username} width={32} height={32} className="object-cover" /> : (
            <span className="text-white text-xs font-bold">{username.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className="text-white text-sm font-medium truncate">@{username}</span>
        {isWinner && <span className="text-yellow-400 text-xs">Winner</span>}
        {isLive && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
      </div>
      <div className="aspect-[9/16] rounded-xl overflow-hidden bg-white/5 relative">
        {isLive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-red-500/80 rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-white text-[10px] font-bold">LIVE</span>
            </div>
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-white text-xs font-bold">
              {score}
            </div>
          </>
        ) : videoUrl ? (
          <video src={videoUrl} className="w-full h-full object-cover" controls playsInline />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            <span className="text-sm">No video yet</span>
          </div>
        )}
      </div>
    </div>
  );
}
