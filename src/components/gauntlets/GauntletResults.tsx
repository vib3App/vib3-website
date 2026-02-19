'use client';

import Image from 'next/image';
import type { GauntletResult } from '@/types/gauntlet';
import { ChampionBadge } from './ChampionBadge';

interface GauntletResultsProps {
  results: GauntletResult;
  gauntletName?: string;
}

export function GauntletResults({ results, gauntletName = 'Gauntlet' }: GauntletResultsProps) {
  return (
    <div className="glass-card rounded-2xl p-6 text-center">
      <h2 className="text-xl font-bold text-white mb-6">Results</h2>

      {/* Champion with Badge */}
      <div className="mb-6">
        <div className="relative inline-block">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden ring-4 ring-yellow-400/50 mb-3">
            {results.champion.avatar ? (
              <Image src={results.champion.avatar} alt={results.champion.username} width={80} height={80} className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl font-bold text-white">
                {results.champion.username[0]?.toUpperCase()}
              </div>
            )}
          </div>
          {/* Gap #65: Champion badge overlay */}
          <div className="absolute -top-1 -right-1">
            <ChampionBadge gauntletName={gauntletName} dateWon={new Date().toISOString()} size="sm" />
          </div>
        </div>
        <p className="text-yellow-400 text-sm font-medium">Champion</p>
        <p className="text-white font-bold text-lg">@{results.champion.username}</p>
      </div>

      {/* Runner up */}
      <div className="mb-6">
        <div className="w-14 h-14 mx-auto rounded-full overflow-hidden ring-2 ring-gray-400/50 mb-2">
          {results.runnerUp.avatar ? (
            <Image src={results.runnerUp.avatar} alt={results.runnerUp.username} width={56} height={56} className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-lg font-bold text-white">
              {results.runnerUp.username[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <p className="text-gray-400 text-xs font-medium">Runner Up</p>
        <p className="text-white font-medium">@{results.runnerUp.username}</p>
      </div>

      {/* Standings */}
      {results.standings.length > 2 && (
        <div className="space-y-2 mt-4">
          <h3 className="text-white/50 text-sm font-medium text-left">Full Standings</h3>
          {results.standings.slice(2).map(({ participant, placement }) => (
            <div key={participant.userId} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
              <span className="text-white/30 font-mono text-sm w-6">#{placement}</span>
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 shrink-0">
                {participant.avatar ? (
                  <Image src={participant.avatar} alt={participant.username} width={32} height={32} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50 text-xs font-bold">
                    {participant.username[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-white/70 text-sm">@{participant.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
