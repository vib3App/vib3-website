'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface AudioSource {
  id: string;
  element: HTMLAudioElement | MediaStream;
  position: { x: number; y: number; z: number };
  panner?: PannerNode;
  gainNode?: GainNode;
}

interface SpatialAudioOptions {
  roomSize?: 'small' | 'medium' | 'large';
  enableReverb?: boolean;
}

/**
 * Hook for 3D spatial audio positioning
 * Used in live streams and watch parties
 */
function useSpatialAudio(_options: SpatialAudioOptions = {}) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const listenerRef = useRef<AudioListener | null>(null);
  const sourcesRef = useRef<Map<string, AudioSource>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize audio context
  const initialize = useCallback(() => {
    if (audioContextRef.current) return;

    try {
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      listenerRef.current = ctx.listener;

      // Set listener position (center)
      if (listenerRef.current.positionX) {
        listenerRef.current.positionX.value = 0;
        listenerRef.current.positionY.value = 0;
        listenerRef.current.positionZ.value = 0;
        listenerRef.current.forwardX.value = 0;
        listenerRef.current.forwardY.value = 0;
        listenerRef.current.forwardZ.value = -1;
        listenerRef.current.upX.value = 0;
        listenerRef.current.upY.value = 1;
        listenerRef.current.upZ.value = 0;
      }

      setIsInitialized(true);
    } catch (_e) {
    }
  }, []);

  // Add an audio source with 3D positioning
  const addSource = useCallback((
    id: string,
    element: HTMLAudioElement | MediaStream,
    position: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
  ) => {
    if (!audioContextRef.current) {
      initialize();
    }

    const ctx = audioContextRef.current;
    if (!ctx) return;

    // Create source node
    let sourceNode: MediaElementAudioSourceNode | MediaStreamAudioSourceNode;
    if (element instanceof HTMLAudioElement) {
      sourceNode = ctx.createMediaElementSource(element);
    } else {
      sourceNode = ctx.createMediaStreamSource(element);
    }

    // Create panner for 3D positioning
    const panner = ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 10000;
    panner.rolloffFactor = 1;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 360;
    panner.coneOuterGain = 0;

    // Set position
    if (panner.positionX) {
      panner.positionX.value = position.x;
      panner.positionY.value = position.y;
      panner.positionZ.value = position.z;
    }

    // Create gain node for volume control
    const gainNode = ctx.createGain();
    gainNode.gain.value = 1;

    // Connect: source -> panner -> gain -> destination
    sourceNode.connect(panner);
    panner.connect(gainNode);
    gainNode.connect(ctx.destination);

    sourcesRef.current.set(id, {
      id,
      element,
      position,
      panner,
      gainNode,
    });
  }, [initialize]);

  // Update source position
  const updatePosition = useCallback((
    id: string,
    position: { x: number; y: number; z: number }
  ) => {
    const source = sourcesRef.current.get(id);
    if (!source?.panner) return;

    const ctx = audioContextRef.current;
    if (!ctx) return;

    // Smooth transition
    if (source.panner.positionX) {
      source.panner.positionX.linearRampToValueAtTime(position.x, ctx.currentTime + 0.1);
      source.panner.positionY.linearRampToValueAtTime(position.y, ctx.currentTime + 0.1);
      source.panner.positionZ.linearRampToValueAtTime(position.z, ctx.currentTime + 0.1);
    }

    source.position = position;
  }, []);

  // Set volume for a source
  const setVolume = useCallback((id: string, volume: number) => {
    const source = sourcesRef.current.get(id);
    if (!source?.gainNode) return;

    source.gainNode.gain.value = Math.max(0, Math.min(1, volume));
  }, []);

  // Remove a source
  const removeSource = useCallback((id: string) => {
    const source = sourcesRef.current.get(id);
    if (source) {
      source.panner?.disconnect();
      source.gainNode?.disconnect();
      sourcesRef.current.delete(id);
    }
  }, []);

  // Preset positions for common scenarios
  const presetPositions = {
    // Host in center
    host: { x: 0, y: 0, z: -2 },
    // Co-hosts on sides
    coHost1: { x: -3, y: 0, z: -2 },
    coHost2: { x: 3, y: 0, z: -2 },
    // Reactions from sides
    reactionLeft: { x: -5, y: 1, z: 0 },
    reactionRight: { x: 5, y: 1, z: 0 },
    // Audience behind
    audience: { x: 0, y: 0, z: 3 },
  };

  // Cleanup
  useEffect(() => {
    const sources = sourcesRef.current;
    const audioCtx = audioContextRef.current;
    return () => {
      sources.forEach((_, id) => removeSource(id));
      audioCtx?.close();
    };
  }, [removeSource]);

  return {
    initialize,
    isInitialized,
    addSource,
    updatePosition,
    setVolume,
    removeSource,
    presetPositions,
  };
}

/**
 * Stereo panning for simpler left/right positioning
 */
export function useStereoPan() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const createPannedSource = useCallback((
    element: HTMLAudioElement,
    pan: number // -1 (left) to 1 (right)
  ) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;
    const source = ctx.createMediaElementSource(element);
    const panner = ctx.createStereoPanner();

    panner.pan.value = Math.max(-1, Math.min(1, pan));

    source.connect(panner);
    panner.connect(ctx.destination);

    return {
      setPan: (newPan: number) => {
        panner.pan.linearRampToValueAtTime(
          Math.max(-1, Math.min(1, newPan)),
          ctx.currentTime + 0.05
        );
      },
      disconnect: () => {
        source.disconnect();
        panner.disconnect();
      },
    };
  }, []);

  return { createPannedSource };
}

export default useSpatialAudio;
