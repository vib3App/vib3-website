'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { MatchView } from '@/components/gauntlets/MatchView';
import { LiveBattleView } from '@/components/gauntlets/LiveBattleView';
import { LiveBattleScreen } from '@/components/gauntlets/LiveBattleScreen';
import { BattleEffectsOverlay, type BattleEffectType } from '@/components/gauntlets/BattleEffectsOverlay';
import { gauntletsApi } from '@/services/api/gauntlets';
import { useAuthStore } from '@/stores/authStore';
import { websocketService } from '@/services/websocket';
import { useBattleAudio, BattleAudioIndicator } from '@/components/gauntlets/BattleAudio';
import type { GauntletMatch } from '@/types/gauntlet';
import { logger } from '@/utils/logger';

export default function LiveMatchPage({ params }: { params: Promise<{ id: string; matchId: string }> }) {
  const { id, matchId } = use(params);
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [match, setMatch] = useState<GauntletMatch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [spectatorCount, setSpectatorCount] = useState(0);
  const [battleEvent, setBattleEvent] = useState<string | null>(null);
  const [battleEffect, setBattleEffect] = useState<BattleEffectType>(null);
  const [comboCount, setComboCount] = useState(0);
  const { play: playBattleSound } = useBattleAudio();

  const loadMatch = useCallback(async () => {
    try {
      const data = await gauntletsApi.getMatch(id, matchId);
      setMatch(data);
    } catch (err) {
      logger.error('Failed to load match:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id, matchId]);

  // Polling fallback for initial load + periodic refresh
  useEffect(() => {
    loadMatch();
    const interval = setInterval(loadMatch, 10000);
    return () => clearInterval(interval);
  }, [loadMatch]);

  // Gap #61: Real-time WebSocket updates for battle scoring + spectator count
  useEffect(() => {
    const unsubUpdate = websocketService.onBattleUpdate((data: { matchId?: string; scores?: Record<string, number>; spectatorCount?: number; event?: string }) => {
      if (data.matchId !== matchId) return;
      if (data.spectatorCount !== undefined) setSpectatorCount(data.spectatorCount);
      if (data.scores) {
        setMatch(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            participant1Votes: data.scores?.[prev.participant1.userId] ?? prev.participant1Votes,
            participant2Votes: data.scores?.[prev.participant2.userId] ?? prev.participant2Votes,
          };
        });
      }
      if (data.event) {
        playBattleSound(data.event as Parameters<typeof playBattleSound>[0]);
        setBattleEvent(data.event);
        setTimeout(() => setBattleEvent(null), 2000);
        // Map events to visual effects
        const effectMap: Record<string, BattleEffectType> = {
          vote: 'fire', combo: 'combo', lead_change: 'confetti',
          gift_received: 'fire', battle_end: 'ko',
        };
        const mapped = effectMap[data.event];
        if (mapped) {
          setBattleEffect(mapped);
          setTimeout(() => setBattleEffect(null), 2500);
        }
      }
    });

    const unsubEnd = websocketService.onBattleEnd((data: { matchId?: string }) => {
      if (data.matchId === matchId) {
        playBattleSound('battle_end');
        setBattleEvent('battle_end');
        setBattleEffect('ko');
        setTimeout(() => setBattleEffect(null), 3000);
        loadMatch();
      }
    });

    const unsubCombo = websocketService.on('battle:combo', (data: { matchId?: string; count?: number }) => {
      if (data.matchId === matchId && data.count) {
        setComboCount(data.count);
        setBattleEffect('combo');
        setTimeout(() => { setBattleEffect(null); setComboCount(0); }, 2000);
      }
    });

    websocketService.send('battle:join', { matchId });
    return () => {
      unsubUpdate();
      unsubEnd();
      unsubCombo();
      websocketService.send('battle:leave', { matchId });
    };
  }, [matchId, playBattleSound, loadMatch]);

  const handleVote = async (participantId: string) => {
    setIsVoting(true);
    try {
      const result = await gauntletsApi.vote(id, matchId, participantId);
      setMatch(prev => prev ? { ...prev, ...result, userVote: participantId } : prev);
    } catch (err) {
      logger.error('Failed to vote:', err);
    } finally {
      setIsVoting(false);
    }
  };

  if (isAuthVerified && !isAuthenticated) {
    return (
      <div className="min-h-screen relative">
        <AuroraBackground intensity={20} />
        <TopNav />
        <main className="pt-20 pb-8 relative z-10 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-white/40 text-lg mb-4">Sign in to view matches</p>
            <Link href="/login" className="px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white font-semibold rounded-xl">Sign In</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        <div className="max-w-3xl mx-auto px-4">
          <Link href={`/gauntlets/${id}`} className="inline-flex items-center gap-1 text-white/40 hover:text-white/60 text-sm mb-4 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Gauntlet
          </Link>

          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-white/10 rounded w-1/3 mx-auto" />
              <div className="flex gap-4">
                <div className="flex-1 aspect-[9/16] bg-white/5 rounded-xl" />
                <div className="flex-1 aspect-[9/16] bg-white/5 rounded-xl" />
              </div>
            </div>
          ) : !match ? (
            <div className="text-center py-20"><p className="text-white/40 text-lg">Match not found</p></div>
          ) : (
            <div className="glass-card rounded-2xl p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-white">
                  {match.participant1.username} vs {match.participant2.username}
                </h1>
                {spectatorCount > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-white/60 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {spectatorCount}
                  </div>
                )}
              </div>
              <BattleAudioIndicator event={battleEvent} />
              {/* Gap #49: Battle visual effects overlay */}
              <BattleEffectsOverlay effect={battleEffect} comboCount={comboCount} />
              {/* Gap #48: Live battle screen with gift sending + Gap #69 */}
              {match.status === 'active' ? (
                <>
                  <LiveBattleScreen
                    match={match}
                    gauntletId={id}
                    roundNumber={1}
                    matchupIndex={0}
                  />
                  <LiveBattleView
                    match={match}
                    gauntletId={id}
                    spectatorCount={spectatorCount}
                    onVote={handleVote}
                    isVoting={isVoting}
                  />
                </>
              ) : (
                <MatchView match={match} onVote={handleVote} isVoting={isVoting} />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
