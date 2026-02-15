'use client';

import { useCallback, useState } from 'react';

// Sound effect types
export type SoundEffect =
  | 'click'
  | 'hover'
  | 'success'
  | 'error'
  | 'notification'
  | 'like'
  | 'follow'
  | 'message'
  | 'swoosh'
  | 'pop'
  | 'coin'
  | 'levelUp';

interface SoundConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
  attack?: number;
  decay?: number;
  detune?: number;
}

// Synthesized sound configurations
const soundConfigs: Record<SoundEffect, SoundConfig> = {
  click: { frequency: 800, duration: 0.05, type: 'sine', volume: 0.1 },
  hover: { frequency: 600, duration: 0.03, type: 'sine', volume: 0.05 },
  success: { frequency: 880, duration: 0.15, type: 'sine', volume: 0.15, attack: 0.01 },
  error: { frequency: 200, duration: 0.2, type: 'sawtooth', volume: 0.1 },
  notification: { frequency: 1200, duration: 0.1, type: 'sine', volume: 0.15 },
  like: { frequency: 1000, duration: 0.12, type: 'sine', volume: 0.12, detune: 100 },
  follow: { frequency: 700, duration: 0.2, type: 'triangle', volume: 0.15 },
  message: { frequency: 900, duration: 0.08, type: 'sine', volume: 0.1 },
  swoosh: { frequency: 400, duration: 0.15, type: 'sawtooth', volume: 0.08 },
  pop: { frequency: 1400, duration: 0.06, type: 'sine', volume: 0.12 },
  coin: { frequency: 1800, duration: 0.1, type: 'square', volume: 0.08 },
  levelUp: { frequency: 523, duration: 0.4, type: 'sine', volume: 0.15 },
};

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  play(effect: SoundEffect) {
    if (!this.enabled) return;

    const config = soundConfigs[effect];
    if (!config) return;

    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = config.type;
      oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime);

      if (config.detune) {
        oscillator.detune.setValueAtTime(config.detune, ctx.currentTime);
      }

      const finalVolume = config.volume * this.volume;
      const attack = config.attack || 0.01;
      const _decay = config.decay || config.duration * 0.8;

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(finalVolume, ctx.currentTime + attack);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + config.duration);

      // Special multi-note effects
      if (effect === 'levelUp') {
        this.playArpeggio([523, 659, 784, 1047], 0.1, 0.1);
      }
      if (effect === 'success') {
        setTimeout(() => this.playTone(1100, 0.1, 0.1), 80);
      }
    } catch (_e) {
      // Audio context not available
    }
  }

  private playTone(frequency: number, duration: number, volume: number) {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.value = frequency;
      osc.type = 'sine';
      gain.gain.setValueAtTime(volume * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_e) {
      // Ignore
    }
  }

  private playArpeggio(frequencies: number[], noteDuration: number, volume: number) {
    frequencies.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, noteDuration, volume), i * 80);
    });
  }
}

// Singleton instance
const soundManager = new SoundManager();

/**
 * Hook for playing UI sound effects
 */
export function useSoundEffects() {
  const [enabled, setEnabledState] = useState(true);
  const [volume, setVolumeState] = useState(0.5);

  const play = useCallback((effect: SoundEffect) => {
    soundManager.play(effect);
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    soundManager.setEnabled(value);
  }, []);

  const setVolume = useCallback((value: number) => {
    setVolumeState(value);
    soundManager.setVolume(value);
  }, []);

  // Convenience methods
  const playClick = useCallback(() => play('click'), [play]);
  const playHover = useCallback(() => play('hover'), [play]);
  const playSuccess = useCallback(() => play('success'), [play]);
  const playError = useCallback(() => play('error'), [play]);
  const playNotification = useCallback(() => play('notification'), [play]);
  const playLike = useCallback(() => play('like'), [play]);
  const playFollow = useCallback(() => play('follow'), [play]);

  return {
    play,
    enabled,
    setEnabled,
    volume,
    setVolume,
    playClick,
    playHover,
    playSuccess,
    playError,
    playNotification,
    playLike,
    playFollow,
  };
}

export default useSoundEffects;
