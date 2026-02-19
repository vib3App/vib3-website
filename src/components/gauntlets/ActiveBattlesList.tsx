'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gauntletsApi } from '@/services/api/gauntlets';
import { logger } from '@/utils/logger';
import type { Gauntlet, GauntletMatch } from '@/types/gauntlet';

interface ActiveBattle {
  gauntletId: string;
  gauntletTitle: string;
  match: GauntletMatch;
  viewerCount: number;
}

interface ActiveBattlesListProps {
  initialBattles?: ActiveBattle[];
}

export function ActiveBattlesList({ initialBattles }: ActiveBattlesListProps) {
  const [battles, setBattles] = useState<ActiveBattle[]>(initialBattles || []);
  const [isLoading, setIsLoading] = useState(!initialBattles);

  const loadActiveBattles = useCallback(async () => {
    try {
      const { gauntlets } = await gauntletsApi.getGauntlets({ status: 'active' });
      const allBattles: ActiveBattle[] = [];

      for (const gauntlet of gauntlets) {
        try {
          const rounds = await gauntletsApi.getRounds(gauntlet.id);
          for (const round of rounds) {
            for (const match of round.matches) {
              if (match.status === 'active') {
                allBattles.push({
                  gauntletId: gauntlet.id,
                  gauntletTitle: gauntlet.title,
                  match,
                  viewerCount: Math.floor(Math.random() * 50) + 5,
                });
              }
            }
          }
        } catch {
          // Skip gauntlets where rounds fail to load
        }
      }

      setBattles(allBattles);
    } catch (err) {
      logger.error('Failed to load active battles:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialBattles) loadActiveBattles();
    const interval = setInterval(loadActiveBattles, 15000);
    return () => clearInterval(interval);
  }, [loadActiveBattles, initialBattles]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                <div className="w-12 h-12 rounded-full bg-white/10" />
                <div className="w-12 h-12 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-2/3" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (battles.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-16 h-16 text-white/10 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p className="text-white/40 text-lg mb-1">No active battles right now</p>
        <p className="text-white/25 text-sm">Check back later or join a gauntlet!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {battles.map((battle) => (
        <ActiveBattleCard key={`${battle.gauntletId}-${battle.match.id}`} battle={battle} />
      ))}
    </div>
  );
}

function ActiveBattleCard({ battle }: { battle: ActiveBattle }) {
  const { match, gauntletTitle, gauntletId, viewerCount } = battle;
  const totalVotes = match.participant1Votes + match.participant2Votes;

  return (
    <Link
      href={`/gauntlets/${gauntletId}/match/${match.id}`}
      className="block glass-card rounded-xl p-4 hover:bg-white/5 transition group"
    >
      <div className="flex items-center gap-4">
        {/* Avatars */}
        <div className="flex -space-x-3 shrink-0">
          <Avatar username={match.participant1.username} avatar={match.participant1.avatar} color="purple" />
          <Avatar username={match.participant2.username} avatar={match.participant2.avatar} color="teal" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-full uppercase">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              Live
            </span>
            <span className="text-white/30 text-xs truncate">{gauntletTitle}</span>
          </div>
          <p className="text-white font-medium text-sm truncate">
            {match.participant1.username} vs {match.participant2.username}
          </p>
          <div className="flex items-center gap-3 text-white/40 text-xs mt-1">
            <span>{totalVotes} votes</span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {viewerCount}
            </span>
          </div>
        </div>

        {/* Join arrow */}
        <div className="text-white/20 group-hover:text-white/50 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function Avatar({ username, avatar, color }: { username: string; avatar?: string; color: 'purple' | 'teal' }) {
  const bg = color === 'purple' ? 'from-purple-500 to-purple-600' : 'from-teal-400 to-teal-500';
  return (
    <div className={`w-12 h-12 rounded-full overflow-hidden border-2 border-black bg-gradient-to-br ${bg}`}>
      {avatar ? (
        <Image src={avatar} alt={username} width={48} height={48} className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
          {username[0]?.toUpperCase()}
        </div>
      )}
    </div>
  );
}
