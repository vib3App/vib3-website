'use client';

import { useCallback, useRef } from 'react';

type BattleSoundEffect = 'vote' | 'combo' | 'lead_change' | 'time_warning' | 'battle_start' | 'battle_end' | 'gift_received';

const SOUND_URLS: Record<BattleSoundEffect, string> = {
  vote: '/sfx/vote.mp3',
  combo: '/sfx/combo.mp3',
  lead_change: '/sfx/lead-change.mp3',
  time_warning: '/sfx/time-warning.mp3',
  battle_start: '/sfx/battle-start.mp3',
  battle_end: '/sfx/battle-end.mp3',
  gift_received: '/sfx/gift-received.mp3',
};

export function useBattleAudio(enabled = true) {
  const audioPoolRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const play = useCallback((effect: BattleSoundEffect) => {
    if (!enabled) return;
    const url = SOUND_URLS[effect];

    // Reuse or create audio element
    let audio = audioPoolRef.current.get(effect);
    if (!audio) {
      audio = new Audio(url);
      audio.volume = 0.6;
      audioPoolRef.current.set(effect, audio);
    }

    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, [enabled]);

  const cleanup = useCallback(() => {
    audioPoolRef.current.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    audioPoolRef.current.clear();
  }, []);

  return { play, cleanup };
}

/** Visual indicator component for battle events */
export function BattleAudioIndicator({ event }: { event: string | null }) {
  if (!event) return null;

  const labels: Record<string, string> = {
    vote: 'Vote!',
    combo: 'COMBO!',
    lead_change: 'Lead Change!',
    time_warning: 'Time Running Out!',
    battle_start: 'BATTLE START!',
    battle_end: 'BATTLE OVER!',
    gift_received: 'Gift!',
  };

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none animate-bounce">
      <div className="px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-400 rounded-full text-white font-bold text-lg shadow-lg shadow-purple-500/30">
        {labels[event] || event}
      </div>
    </div>
  );
}
