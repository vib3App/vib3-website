'use client';

import { useState, useCallback, useEffect } from 'react';
import { gauntletsApi } from '@/services/api/gauntlets';
import { useAuthStore } from '@/stores/authStore';
import type { Gauntlet, GauntletRound, GauntletResult } from '@/types/gauntlet';
import { logger } from '@/utils/logger';

export function useGauntlet(gauntletId?: string) {
  const { isAuthenticated: _isAuthenticated } = useAuthStore();
  const [gauntlet, setGauntlet] = useState<Gauntlet | null>(null);
  const [rounds, setRounds] = useState<GauntletRound[]>([]);
  const [results, setResults] = useState<GauntletResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadGauntlet = useCallback(async () => {
    if (!gauntletId) return;
    setIsLoading(true);
    try {
      const [gauntletData, roundsData] = await Promise.all([
        gauntletsApi.getGauntlet(gauntletId),
        gauntletsApi.getRounds(gauntletId),
      ]);
      setGauntlet(gauntletData);
      setRounds(roundsData);
      if (gauntletData.status === 'completed') {
        try {
          const resultsData = await gauntletsApi.getResults(gauntletId);
          setResults(resultsData);
        } catch { /* Results may not be ready */ }
      }
    } catch (err) {
      logger.error('Failed to load gauntlet:', err);
    } finally {
      setIsLoading(false);
    }
  }, [gauntletId]);

  useEffect(() => {
    loadGauntlet();
  }, [loadGauntlet]);

  const join = useCallback(async () => {
    if (!gauntletId) return;
    try {
      await gauntletsApi.joinGauntlet(gauntletId);
      setGauntlet(prev => prev ? { ...prev, isJoined: true, participantCount: prev.participantCount + 1 } : prev);
    } catch (err) {
      logger.error('Failed to join gauntlet:', err);
    }
  }, [gauntletId]);

  const leave = useCallback(async () => {
    if (!gauntletId) return;
    try {
      await gauntletsApi.leaveGauntlet(gauntletId);
      setGauntlet(prev => prev ? { ...prev, isJoined: false, participantCount: prev.participantCount - 1 } : prev);
    } catch (err) {
      logger.error('Failed to leave gauntlet:', err);
    }
  }, [gauntletId]);

  const vote = useCallback(async (matchId: string, participantId: string) => {
    if (!gauntletId) return;
    try {
      const result = await gauntletsApi.vote(gauntletId, matchId, participantId);
      setRounds(prev =>
        prev.map(round => ({
          ...round,
          matches: round.matches.map(match =>
            match.id === matchId
              ? { ...match, ...result, userVote: participantId }
              : match
          ),
        }))
      );
    } catch (err) {
      logger.error('Failed to vote:', err);
    }
  }, [gauntletId]);

  return { gauntlet, rounds, results, isLoading, loadGauntlet, join, leave, vote };
}
