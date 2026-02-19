'use client';

import { useState, useEffect, useCallback } from 'react';
import { websocketService } from '@/services/websocket';
import type { LiveBattle } from '@/types/liveBattle';

export function useLiveBattle(streamId: string) {
  const [battle, setBattle] = useState<LiveBattle | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const unsubStart = websocketService.onBattleStart((data: LiveBattle) => {
      if (data.streamId === streamId) setBattle(data);
    });

    const unsubUpdate = websocketService.onBattleUpdate((data: LiveBattle) => {
      if (data.streamId === streamId) setBattle(data);
    });

    const unsubEnd = websocketService.onBattleEnd((data: LiveBattle) => {
      if (data.streamId === streamId) setBattle(data);
    });

    return () => { unsubStart(); unsubUpdate(); unsubEnd(); };
  }, [streamId]);

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

  const vote = useCallback((participantId: string) => {
    if (!battle) return;
    websocketService.send('battle:vote', { battleId: battle.id, participantId });
  }, [battle]);

  return { battle, timeRemaining, vote };
}
