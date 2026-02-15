'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type AmbientMode = 'off' | 'focus' | 'energy' | 'chill' | 'nature';

interface AmbientConfig {
  baseFrequency: number;
  harmonics: number[];
  lfoSpeed: number;
  volume: number;
}

const ambientConfigs: Record<Exclude<AmbientMode, 'off'>, AmbientConfig> = {
  focus: {
    baseFrequency: 60,
    harmonics: [1, 2, 3],
    lfoSpeed: 0.1,
    volume: 0.03,
  },
  energy: {
    baseFrequency: 100,
    harmonics: [1, 1.5, 2, 3],
    lfoSpeed: 0.3,
    volume: 0.04,
  },
  chill: {
    baseFrequency: 80,
    harmonics: [1, 1.25, 1.5],
    lfoSpeed: 0.05,
    volume: 0.025,
  },
  nature: {
    baseFrequency: 40,
    harmonics: [1, 2, 4, 8],
    lfoSpeed: 0.02,
    volume: 0.02,
  },
};

/**
 * Hook for ambient background soundscapes
 * Generates synthesized ambient audio based on mode
 */
export function useAmbientSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{
    oscillators: OscillatorNode[];
    gains: GainNode[];
    lfo: OscillatorNode | null;
    masterGain: GainNode | null;
  }>({ oscillators: [], gains: [], lfo: null, masterGain: null });

  const [mode, setModeState] = useState<AmbientMode>('off');
  const [volume, setVolumeState] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);

  // Stop ambient sound
  const stopAmbient = useCallback(() => {
    nodesRef.current.oscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (_e) {
        // Already stopped
      }
    });
    nodesRef.current.gains.forEach((gain) => gain.disconnect());
    nodesRef.current.lfo?.stop();
    nodesRef.current.lfo?.disconnect();
    nodesRef.current.masterGain?.disconnect();

    nodesRef.current = { oscillators: [], gains: [], lfo: null, masterGain: null };
    setIsPlaying(false);
  }, []);

  // Create ambient sound for a mode
  const createAmbient = useCallback((ambientMode: Exclude<AmbientMode, 'off'>) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;
    const config = ambientConfigs[ambientMode];

    // Clean up existing nodes
    stopAmbient();

    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = config.volume * volume;
    masterGain.connect(ctx.destination);
    nodesRef.current.masterGain = masterGain;

    // LFO for subtle movement
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = config.lfoSpeed;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 5; // LFO depth
    lfo.connect(lfoGain);
    nodesRef.current.lfo = lfo;

    // Create oscillators for each harmonic
    config.harmonics.forEach((harmonic) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = config.baseFrequency * harmonic;

      // Connect LFO to frequency for subtle movement
      lfoGain.connect(osc.frequency);

      // Lower volume for higher harmonics
      gain.gain.value = 1 / harmonic;

      osc.connect(gain);
      gain.connect(masterGain);

      nodesRef.current.oscillators.push(osc);
      nodesRef.current.gains.push(gain);

      osc.start();
    });

    lfo.start();
    setIsPlaying(true);
  }, [volume, stopAmbient]);

  // Set mode
  const setMode = useCallback((newMode: AmbientMode) => {
    setModeState(newMode);

    if (newMode === 'off') {
      stopAmbient();
    } else {
      createAmbient(newMode);
    }
  }, [createAmbient, stopAmbient]);

  // Set volume
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);

    if (nodesRef.current.masterGain && mode !== 'off') {
      const config = ambientConfigs[mode as Exclude<AmbientMode, 'off'>];
      nodesRef.current.masterGain.gain.value = config.volume * clampedVolume;
    }
  }, [mode]);

  // Auto-adjust based on time of day
  const autoMode = useCallback(() => {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 12) {
      setMode('energy'); // Morning energy
    } else if (hour >= 12 && hour < 17) {
      setMode('focus'); // Afternoon focus
    } else if (hour >= 17 && hour < 21) {
      setMode('chill'); // Evening chill
    } else {
      setMode('nature'); // Night nature sounds
    }
  }, [setMode]);

  // Cleanup on unmount — stop all audio nodes and close the AudioContext.
  // Uses [] deps with direct ref access to guarantee cleanup runs exactly once
  // and always reads the latest node state, avoiding stale closure issues.
  useEffect(() => {
    return () => {
      // Stop and disconnect all oscillators and gain nodes
      nodesRef.current.oscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (_e) {
          // Already stopped
        }
      });
      nodesRef.current.gains.forEach((gain) => gain.disconnect());
      nodesRef.current.lfo?.stop();
      nodesRef.current.lfo?.disconnect();
      nodesRef.current.masterGain?.disconnect();
      nodesRef.current = { oscillators: [], gains: [], lfo: null, masterGain: null };

      // Close the AudioContext to free system audio resources
      audioContextRef.current?.close();
      audioContextRef.current = null;
    };
  }, []);

  return {
    mode,
    setMode,
    volume,
    setVolume,
    isPlaying,
    autoMode,
    stop: stopAmbient,
  };
}

/**
 * Provider component for ambient sound settings
 */
export function useAmbientSoundSettings() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof localStorage === 'undefined') return false;
    try {
      const saved = localStorage.getItem('vib3-ambient-settings');
      if (saved) {
        return JSON.parse(saved).enabled ?? false;
      }
    } catch (_e) {
      // Invalid saved data
    }
    return false;
  });
  const [selectedMode, setSelectedMode] = useState<AmbientMode>(() => {
    if (typeof localStorage === 'undefined') return 'focus';
    try {
      const saved = localStorage.getItem('vib3-ambient-settings');
      if (saved) {
        return JSON.parse(saved).mode ?? 'focus';
      }
    } catch (_e) {
      // Invalid saved data
    }
    return 'focus';
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('vib3-ambient-settings', JSON.stringify({
      enabled,
      mode: selectedMode,
    }));
  }, [enabled, selectedMode]);

  return {
    enabled,
    setEnabled,
    selectedMode,
    setSelectedMode,
  };
}

export default useAmbientSound;
