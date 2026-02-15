'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface BeatInfo {
  bpm: number;
  confidence: number;
  energy: number;
  isBeat: boolean;
}

interface AudioAnalysis {
  frequencies: Uint8Array;
  waveform: Uint8Array;
  bass: number;
  mid: number;
  high: number;
  volume: number;
}

/**
 * Hook for real-time audio analysis and beat detection
 */
export function useAudioRhythm() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [beatInfo, setBeatInfo] = useState<BeatInfo>({
    bpm: 0,
    confidence: 0,
    energy: 0,
    isBeat: false,
  });
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null);

  // Beat detection state
  const beatHistoryRef = useRef<number[]>([]);
  const lastBeatTimeRef = useRef(0);
  const energyHistoryRef = useRef<number[]>([]);

  // Start real-time analysis
  const startAnalysis = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    const timeData = new Uint8Array(analyser.fftSize);

    const analyze = () => {
      analyser.getByteFrequencyData(frequencyData);
      analyser.getByteTimeDomainData(timeData);

      // Calculate frequency bands
      const bassEnd = Math.floor(frequencyData.length * 0.1);
      const midEnd = Math.floor(frequencyData.length * 0.5);

      let bassSum = 0, midSum = 0, highSum = 0;
      for (let i = 0; i < frequencyData.length; i++) {
        if (i < bassEnd) bassSum += frequencyData[i];
        else if (i < midEnd) midSum += frequencyData[i];
        else highSum += frequencyData[i];
      }

      const bass = bassSum / bassEnd / 255;
      const mid = midSum / (midEnd - bassEnd) / 255;
      const high = highSum / (frequencyData.length - midEnd) / 255;

      // Calculate overall volume
      const volume = frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length / 255;

      // Beat detection based on bass energy
      const energy = bass * 0.6 + mid * 0.3 + high * 0.1;
      energyHistoryRef.current.push(energy);
      if (energyHistoryRef.current.length > 43) {
        energyHistoryRef.current.shift();
      }

      // Detect beat when energy exceeds threshold
      const avgEnergy = energyHistoryRef.current.reduce((a, b) => a + b, 0) / energyHistoryRef.current.length;
      const isBeat = energy > avgEnergy * 1.3 && Date.now() - lastBeatTimeRef.current > 200;

      if (isBeat) {
        const now = Date.now();
        const beatInterval = now - lastBeatTimeRef.current;
        beatHistoryRef.current.push(beatInterval);
        if (beatHistoryRef.current.length > 8) {
          beatHistoryRef.current.shift();
        }
        lastBeatTimeRef.current = now;

        // Calculate BPM
        if (beatHistoryRef.current.length >= 4) {
          const avgInterval = beatHistoryRef.current.reduce((a, b) => a + b, 0) / beatHistoryRef.current.length;
          const bpm = Math.round(60000 / avgInterval);
          const confidence = 1 - (Math.max(...beatHistoryRef.current) - Math.min(...beatHistoryRef.current)) / avgInterval;

          setBeatInfo({
            bpm: Math.max(60, Math.min(200, bpm)),
            confidence: Math.max(0, confidence),
            energy,
            isBeat: true,
          });
        }
      } else {
        setBeatInfo(prev => ({ ...prev, energy, isBeat: false }));
      }

      setAnalysis({
        frequencies: frequencyData,
        waveform: timeData,
        bass,
        mid,
        high,
        volume,
      });

      animationRef.current = requestAnimationFrame(analyze);
    };

    analyze();
  }, []);

  // Connect to an audio element
  const connect = useCallback((audioElement: HTMLAudioElement) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const ctx = audioContextRef.current;

      // Create analyser
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Connect source
      if (!sourceRef.current) {
        const source = ctx.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        sourceRef.current = source;
      }

      setIsAnalyzing(true);
      startAnalysis();
    } catch (_e) {
    }
  }, [startAnalysis]);

  // Stop analysis
  const disconnect = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsAnalyzing(false);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioContextRef.current?.close();
    };
  }, []);

  return {
    connect,
    disconnect,
    isAnalyzing,
    beatInfo,
    analysis,
  };
}

/**
 * Hook for syncing visual effects to audio rhythm
 */
export function useRhythmSync() {
  const { beatInfo, analysis, connect, disconnect, isAnalyzing } = useAudioRhythm();
  const [syncedValue, setSyncedValue] = useState(0);
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const syncedValueRef = useRef(0);
  const pulseIntensityRef = useRef(0);
  const decayFrameRef = useRef<number | null>(null);

  // Handle beat detection: set values on beat, decay otherwise via rAF
  useEffect(() => {
    if (beatInfo.isBeat) {
      syncedValueRef.current = 1;
      pulseIntensityRef.current = beatInfo.energy;
    }

    const update = () => {
      if (beatInfo.isBeat) {
        setSyncedValue(syncedValueRef.current);
        setPulseIntensity(pulseIntensityRef.current);
        return;
      }

      let needsUpdate = false;
      if (syncedValueRef.current > 0) {
        syncedValueRef.current = Math.max(0, syncedValueRef.current - 0.1);
        needsUpdate = true;
      }
      if (pulseIntensityRef.current > 0) {
        pulseIntensityRef.current = Math.max(0, pulseIntensityRef.current - 0.05);
        needsUpdate = true;
      }
      if (needsUpdate) {
        setSyncedValue(syncedValueRef.current);
        setPulseIntensity(pulseIntensityRef.current);
        decayFrameRef.current = requestAnimationFrame(update);
      } else {
        decayFrameRef.current = null;
      }
    };

    decayFrameRef.current = requestAnimationFrame(update);

    return () => {
      if (decayFrameRef.current !== null) {
        cancelAnimationFrame(decayFrameRef.current);
        decayFrameRef.current = null;
      }
    };
  }, [beatInfo]);

  // Get CSS transform based on rhythm
  const getRhythmTransform = useCallback((baseScale: number = 1, maxScale: number = 1.1) => {
    const scale = baseScale + (maxScale - baseScale) * syncedValue;
    return `scale(${scale})`;
  }, [syncedValue]);

  // Get CSS filter based on rhythm
  const getRhythmFilter = useCallback((baseBrightness: number = 1, maxBrightness: number = 1.3) => {
    const brightness = baseBrightness + (maxBrightness - baseBrightness) * pulseIntensity;
    return `brightness(${brightness})`;
  }, [pulseIntensity]);

  // Get glow intensity
  const getGlowIntensity = useCallback((baseIntensity: number = 0, maxIntensity: number = 20) => {
    return baseIntensity + (maxIntensity - baseIntensity) * pulseIntensity;
  }, [pulseIntensity]);

  return {
    connect,
    disconnect,
    isAnalyzing,
    beatInfo,
    analysis,
    syncedValue,
    pulseIntensity,
    getRhythmTransform,
    getRhythmFilter,
    getGlowIntensity,
  };
}

export default useAudioRhythm;
