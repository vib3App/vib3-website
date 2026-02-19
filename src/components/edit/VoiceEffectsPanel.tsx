'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface VoiceEffectPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface VoiceEffectsPanelProps {
  activeEffect: string | null;
  onEffectChange: (effectId: string | null) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const VOICE_EFFECTS: VoiceEffectPreset[] = [
  { id: 'chipmunk', name: 'Chipmunk', icon: '\uD83D\uDC3F\uFE0F', description: 'High-pitched squeaky voice' },
  { id: 'deep', name: 'Deep', icon: '\uD83D\uDC3B', description: 'Low-pitched deep voice' },
  { id: 'robot', name: 'Robot', icon: '\uD83E\uDD16', description: 'Robotic modulation' },
  { id: 'echo', name: 'Echo', icon: '\uD83C\uDFD4\uFE0F', description: 'Delayed echo reverb' },
  { id: 'alien', name: 'Alien', icon: '\uD83D\uDC7D', description: 'Ring modulation effect' },
  { id: 'helium', name: 'Helium', icon: '\uD83C\uDF88', description: 'Very high squeaky pitch' },
  { id: 'giant', name: 'Giant', icon: '\uD83E\uDDB6', description: 'Very low rumbling voice' },
];

export function VoiceEffectsPanel({ activeEffect, onEffectChange, videoRef }: VoiceEffectsPanelProps) {
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);

  const cleanupAudioChain = useCallback(() => {
    nodesRef.current.forEach(n => { try { n.disconnect(); } catch {} });
    nodesRef.current = [];
  }, []);

  const applyEffect = useCallback((effectId: string | null) => {
    const video = videoRef.current;
    if (!video) return;

    cleanupAudioChain();

    if (!effectId) {
      if (sourceRef.current && audioCtxRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current.connect(audioCtxRef.current.destination);
      }
      return;
    }

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;

    if (!sourceRef.current) {
      sourceRef.current = ctx.createMediaElementSource(video);
    }
    sourceRef.current.disconnect();

    const nodes: AudioNode[] = [];
    let lastNode: AudioNode = sourceRef.current;

    switch (effectId) {
      case 'chipmunk': {
        // Playback rate trick: speed up audio via detune on a gain
        const gain = ctx.createGain();
        gain.gain.value = 1;
        // We simulate pitch shift via playback rate
        video.playbackRate = 1.5;
        video.preservesPitch = false;
        lastNode.connect(gain);
        lastNode = gain;
        nodes.push(gain);
        break;
      }
      case 'deep': {
        video.playbackRate = 0.75;
        video.preservesPitch = false;
        const gain = ctx.createGain();
        gain.gain.value = 1;
        lastNode.connect(gain);
        lastNode = gain;
        nodes.push(gain);
        break;
      }
      case 'robot': {
        video.playbackRate = 1;
        video.preservesPitch = true;
        const osc = ctx.createOscillator();
        const modGain = ctx.createGain();
        osc.frequency.value = 50;
        modGain.gain.value = 0.5;
        osc.connect(modGain);
        osc.start();
        const inputGain = ctx.createGain();
        modGain.connect(inputGain.gain);
        lastNode.connect(inputGain);
        lastNode = inputGain;
        nodes.push(osc, modGain, inputGain);
        break;
      }
      case 'echo': {
        video.playbackRate = 1;
        video.preservesPitch = true;
        const delay = ctx.createDelay(1);
        delay.delayTime.value = 0.3;
        const feedback = ctx.createGain();
        feedback.gain.value = 0.4;
        const dry = ctx.createGain();
        dry.gain.value = 1;
        lastNode.connect(dry);
        lastNode.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        const merger = ctx.createGain();
        dry.connect(merger);
        delay.connect(merger);
        lastNode = merger;
        nodes.push(delay, feedback, dry, merger);
        break;
      }
      case 'alien': {
        video.playbackRate = 1;
        video.preservesPitch = true;
        const osc = ctx.createOscillator();
        const modGain = ctx.createGain();
        osc.frequency.value = 200;
        osc.type = 'sine';
        modGain.gain.value = 0.8;
        osc.connect(modGain);
        osc.start();
        const inputGain = ctx.createGain();
        modGain.connect(inputGain.gain);
        lastNode.connect(inputGain);
        lastNode = inputGain;
        nodes.push(osc, modGain, inputGain);
        break;
      }
      case 'helium': {
        video.playbackRate = 2;
        video.preservesPitch = false;
        const gain = ctx.createGain();
        gain.gain.value = 1;
        lastNode.connect(gain);
        lastNode = gain;
        nodes.push(gain);
        break;
      }
      case 'giant': {
        video.playbackRate = 0.5;
        video.preservesPitch = false;
        const gain = ctx.createGain();
        gain.gain.value = 1.2;
        lastNode.connect(gain);
        lastNode = gain;
        nodes.push(gain);
        break;
      }
    }

    lastNode.connect(ctx.destination);
    nodesRef.current = nodes;
  }, [videoRef, cleanupAudioChain]);

  const handleSelect = useCallback((effectId: string) => {
    const newEffect = activeEffect === effectId ? null : effectId;
    onEffectChange(newEffect);
    applyEffect(newEffect);
  }, [activeEffect, onEffectChange, applyEffect]);

  const handlePreview = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPreviewPlaying) {
      video.pause();
      setIsPreviewPlaying(false);
    } else {
      video.currentTime = Math.max(0, video.currentTime - 1);
      video.play();
      setIsPreviewPlaying(true);
      setTimeout(() => { video.pause(); setIsPreviewPlaying(false); }, 3000);
    }
  }, [videoRef, isPreviewPlaying]);

  useEffect(() => {
    return () => {
      cleanupAudioChain();
      const video = videoRef.current;
      if (video) {
        video.playbackRate = 1;
        video.preservesPitch = true;
      }
    };
  }, [cleanupAudioChain, videoRef]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Voice Effects</h3>
        {activeEffect && (
          <button onClick={handlePreview}
            className="text-xs px-3 py-1 rounded-full bg-purple-500 text-white">
            {isPreviewPlaying ? 'Stop' : 'Preview'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {VOICE_EFFECTS.map(effect => (
          <button key={effect.id} onClick={() => handleSelect(effect.id)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl transition ${
              activeEffect === effect.id
                ? 'ring-2 ring-purple-500 bg-purple-500/20'
                : 'bg-white/5 hover:bg-white/10'
            }`}>
            <span className="text-2xl">{effect.icon}</span>
            <span className="text-xs text-white/70">{effect.name}</span>
          </button>
        ))}
      </div>

      {activeEffect && (
        <div className="glass-card rounded-xl p-3">
          <p className="text-white/50 text-sm">
            {VOICE_EFFECTS.find(e => e.id === activeEffect)?.description}
          </p>
          <p className="text-white/30 text-xs mt-1">
            Effect applied via Web Audio API. Will be baked in during export.
          </p>
        </div>
      )}

      {!activeEffect && (
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-white/40 text-sm">Select a voice effect to transform audio.</p>
          <p className="text-white/25 text-xs mt-1">Effects use Web Audio API for real-time processing.</p>
        </div>
      )}
    </div>
  );
}
