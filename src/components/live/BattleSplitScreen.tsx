'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { LiveBattle } from '@/types/liveBattle';
import { BattleVisualEffects, type BattleEvent } from './BattleVisualEffects';
import { BattleParticleEngine, type ParticleEffect } from './BattleParticleEngine';
import { BattleThemeSelector, useBattleTheme } from './BattleThemeSelector';

interface BattleSplitScreenProps {
  battle: LiveBattle;
  /** Battle event for triggering visual effects */
  battleEvent?: string | null;
}

export function BattleSplitScreen({ battle, battleEvent }: BattleSplitScreenProps) {
  const { participant1, participant2 } = battle;
  const { theme, setTheme } = useBattleTheme();
  const [visualEvent, setVisualEvent] = useState<BattleEvent>(null);
  const [particleEffect, setParticleEffect] = useState<ParticleEffect>(null);

  // Map battle events to visual + particle effects
  useEffect(() => {
    if (!battleEvent) return;

    const eventMap: Record<string, { visual: BattleEvent; particle: ParticleEffect }> = {
      battle_start: { visual: 'entrance', particle: null },
      vote: { visual: 'score', particle: 'sparks' },
      combo: { visual: 'fire_border', particle: 'fire' },
      lead_change: { visual: 'fireworks', particle: 'confetti' },
      battle_end: { visual: 'ko', particle: 'ice_shatter' },
      gift_received: { visual: 'fireworks', particle: 'confetti' },
    };

    const mapped = eventMap[battleEvent];
    if (mapped) {
      setVisualEvent(mapped.visual);
      setParticleEffect(mapped.particle);
    }
  }, [battleEvent]);

  return (
    <div className="relative flex w-full h-full" style={{ borderColor: theme.colors.border }}>
      {/* Gap #62: Battle visual effects overlay */}
      <BattleVisualEffects
        event={visualEvent}
        participant1Name={participant1.username}
        participant2Name={participant2.username}
        winnerId={battle.winnerId}
        participant1Id={participant1.userId}
      />

      {/* Gap #63: Battle particle engine */}
      <BattleParticleEngine effect={particleEffect} />

      {/* Participant 1 */}
      <div className={`flex-1 relative ${theme.borderStyle} border-r`} style={{ borderColor: theme.colors.border }}>
        <div className="absolute bottom-4 left-4 z-10">
          <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full">
            <div className="w-6 h-6 rounded-full overflow-hidden">
              {participant1.avatar ? (
                <Image src={participant1.avatar} alt={participant1.username} width={24} height={24} className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: theme.colors.primary }}>
                  {participant1.username[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <span className={`text-white text-sm font-medium ${theme.font}`}>@{participant1.username}</span>
          </div>
        </div>
      </div>

      {/* Participant 2 */}
      <div className="flex-1 relative">
        <div className="absolute bottom-4 right-4 z-10">
          <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full">
            <span className={`text-white text-sm font-medium ${theme.font}`}>@{participant2.username}</span>
            <div className="w-6 h-6 rounded-full overflow-hidden">
              {participant2.avatar ? (
                <Image src={participant2.avatar} alt={participant2.username} width={24} height={24} className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: theme.colors.secondary }}>
                  {participant2.username[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gap #64: Battle theme selector (top-right) */}
      <div className="absolute top-4 right-4 z-20">
        <BattleThemeSelector selectedTheme={theme} onSelectTheme={setTheme} />
      </div>
    </div>
  );
}
