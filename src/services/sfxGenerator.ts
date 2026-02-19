/**
 * SFX Generator - Gap #20
 * Generates sound effects using Web Audio API
 * Each SFX is created procedurally with oscillators, noise, and envelopes
 */

import { logger } from '@/utils/logger';

type SFXType =
  | 'whoosh' | 'swoosh' | 'swipe' | 'slide'
  | 'boing' | 'fart' | 'rimshot' | 'crickets' | 'laugh'
  | 'boom' | 'punch' | 'crash' | 'slam' | 'thud'
  | 'ding' | 'beep' | 'click' | 'error' | 'success'
  | 'rain' | 'thunder' | 'wind' | 'birds'
  | 'vinyl' | 'airhorn' | 'harp' | 'drumroll';

function createNoise(ctx: AudioContext, dur: number): AudioBufferSourceNode {
  const n = ctx.sampleRate * dur;
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const s = ctx.createBufferSource(); s.buffer = buf; return s;
}

function env(ctx: AudioContext, g: GainNode, a: number, d: number, s: number, r: number, t: number, v = 0.5): void {
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v, t + a);
  g.gain.linearRampToValueAtTime(s * v, t + a + d);
  g.gain.linearRampToValueAtTime(0, t + a + d + r);
}

const SFX_GENERATORS: Record<SFXType, (ctx: AudioContext) => void> = {
  whoosh: (ctx) => {
    const noise = createNoise(ctx, 0.4);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.2);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4);
    filter.Q.value = 2;
    const gain = ctx.createGain();
    env(ctx, gain, 0.05, 0.1, 0.3, 0.25, ctx.currentTime, 0.4);
    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start(); noise.stop(ctx.currentTime + 0.4);
  },
  swoosh: (ctx) => {
    const noise = createNoise(ctx, 0.3);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(6000, ctx.currentTime + 0.15);
    const gain = ctx.createGain();
    env(ctx, gain, 0.02, 0.08, 0.2, 0.2, ctx.currentTime, 0.35);
    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start(); noise.stop(ctx.currentTime + 0.3);
  },
  swipe: (ctx) => {
    const noise = createNoise(ctx, 0.2);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.Q.value = 3;
    filter.frequency.setValueAtTime(500, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.2);
    const gain = ctx.createGain();
    env(ctx, gain, 0.01, 0.05, 0.3, 0.14, ctx.currentTime, 0.3);
    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start(); noise.stop(ctx.currentTime + 0.2);
  },
  slide: (ctx) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
    const gain = ctx.createGain();
    env(ctx, gain, 0.01, 0.1, 0.4, 0.19, ctx.currentTime, 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.3);
  },
  boing: (ctx) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.4);
    const gain = ctx.createGain();
    env(ctx, gain, 0.01, 0.05, 0.3, 0.34, ctx.currentTime, 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.4);
  },
  fart: (ctx) => {
    const noise = createNoise(ctx, 0.3);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 300; filter.Q.value = 5;
    const gain = ctx.createGain();
    env(ctx, gain, 0.01, 0.05, 0.5, 0.24, ctx.currentTime, 0.5);
    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start(); noise.stop(ctx.currentTime + 0.3);
  },
  rimshot: (ctx) => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator(); osc.type = 'triangle'; osc.frequency.value = 200;
    const g1 = ctx.createGain(); env(ctx, g1, 0.001, 0.03, 0.1, 0.07, t, 0.5);
    osc.connect(g1).connect(ctx.destination); osc.start(); osc.stop(t + 0.1);
    const noise = createNoise(ctx, 0.15);
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4000;
    const g2 = ctx.createGain(); env(ctx, g2, 0.001, 0.02, 0.1, 0.12, t, 0.4);
    noise.connect(hp).connect(g2).connect(ctx.destination); noise.start(); noise.stop(t + 0.15);
  },
  crickets: (ctx) => {
    const t = ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const osc = ctx.createOscillator(); osc.type = 'sine';
      osc.frequency.value = 4000 + Math.random() * 1000;
      const g = ctx.createGain();
      const start = t + i * 0.15;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.1, start + 0.02);
      g.gain.linearRampToValueAtTime(0, start + 0.08);
      osc.connect(g).connect(ctx.destination); osc.start(start); osc.stop(start + 0.08);
    }
  },
  laugh: (ctx) => {
    const t = ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator(); osc.type = 'sawtooth';
      osc.frequency.value = 250 + (i % 2 === 0 ? 50 : -30);
      const g = ctx.createGain();
      const start = t + i * 0.12;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.15, start + 0.03);
      g.gain.linearRampToValueAtTime(0, start + 0.1);
      osc.connect(g).connect(ctx.destination); osc.start(start); osc.stop(start + 0.1);
    }
  },
  boom: (ctx) => {
    const osc = ctx.createOscillator(); osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.5);
    const g = ctx.createGain();
    env(ctx, g, 0.005, 0.1, 0.3, 0.39, ctx.currentTime, 0.6);
    osc.connect(g).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.5);
    const noise = createNoise(ctx, 0.3);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500;
    const g2 = ctx.createGain();
    env(ctx, g2, 0.005, 0.05, 0.2, 0.24, ctx.currentTime, 0.3);
    noise.connect(lp).connect(g2).connect(ctx.destination); noise.start(); noise.stop(ctx.currentTime + 0.3);
  },
  punch: (ctx) => {
    const osc = ctx.createOscillator(); osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);
    const g = ctx.createGain();
    env(ctx, g, 0.001, 0.03, 0.2, 0.12, ctx.currentTime, 0.5);
    osc.connect(g).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.15);
  },
  crash: (ctx) => {
    const noise = createNoise(ctx, 0.8);
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2000;
    const g = ctx.createGain();
    env(ctx, g, 0.001, 0.05, 0.3, 0.74, ctx.currentTime, 0.4);
    noise.connect(hp).connect(g).connect(ctx.destination); noise.start(); noise.stop(ctx.currentTime + 0.8);
  },
  slam: (ctx) => {
    const osc = ctx.createOscillator(); osc.type = 'sine';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
    const g = ctx.createGain();
    env(ctx, g, 0.001, 0.02, 0.3, 0.18, ctx.currentTime, 0.6);
    osc.connect(g).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.2);
  },
  thud: (ctx) => {
    const osc = ctx.createOscillator(); osc.type = 'sine';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.25);
    const g = ctx.createGain();
    env(ctx, g, 0.005, 0.05, 0.2, 0.2, ctx.currentTime, 0.5);
    osc.connect(g).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.25);
  },
  ding: (ctx) => {
    const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = 1200;
    const g = ctx.createGain();
    env(ctx, g, 0.001, 0.05, 0.2, 0.44, ctx.currentTime, 0.3);
    osc.connect(g).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.5);
  },
  beep: (ctx) => {
    const osc = ctx.createOscillator(); osc.type = 'square'; osc.frequency.value = 800;
    const g = ctx.createGain();
    env(ctx, g, 0.001, 0.02, 0.5, 0.08, ctx.currentTime, 0.2);
    osc.connect(g).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.1);
  },
  click: (ctx) => {
    const noise = createNoise(ctx, 0.03);
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.4, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    noise.connect(hp).connect(g).connect(ctx.destination); noise.start(); noise.stop(ctx.currentTime + 0.03);
  },
  error: (ctx) => {
    const t = ctx.currentTime;
    [400, 300].forEach((freq, i) => {
      const osc = ctx.createOscillator(); osc.type = 'square'; osc.frequency.value = freq;
      const g = ctx.createGain();
      env(ctx, g, 0.001, 0.02, 0.4, 0.08, t + i * 0.12, 0.2);
      osc.connect(g).connect(ctx.destination); osc.start(t + i * 0.12); osc.stop(t + i * 0.12 + 0.1);
    });
  },
  success: (ctx) => {
    const t = ctx.currentTime;
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
      const g = ctx.createGain();
      env(ctx, g, 0.001, 0.03, 0.3, 0.17, t + i * 0.1, 0.25);
      osc.connect(g).connect(ctx.destination); osc.start(t + i * 0.1); osc.stop(t + i * 0.1 + 0.2);
    });
  },
  rain: (ctx) => {
    const noise = createNoise(ctx, 1.5);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3000; bp.Q.value = 0.5;
    const g = ctx.createGain();
    env(ctx, g, 0.3, 0.2, 0.6, 1.0, ctx.currentTime, 0.2);
    noise.connect(bp).connect(g).connect(ctx.destination); noise.start(); noise.stop(ctx.currentTime + 1.5);
  },
  thunder: (ctx) => {
    const noise = createNoise(ctx, 1.2);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400;
    const g = ctx.createGain();
    env(ctx, g, 0.01, 0.1, 0.4, 1.09, ctx.currentTime, 0.6);
    noise.connect(lp).connect(g).connect(ctx.destination); noise.start(); noise.stop(ctx.currentTime + 1.2);
  },
  wind: (ctx) => {
    const noise = createNoise(ctx, 1.5);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 600; bp.Q.value = 1;
    bp.frequency.setValueAtTime(400, ctx.currentTime);
    bp.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.7);
    bp.frequency.linearRampToValueAtTime(400, ctx.currentTime + 1.5);
    const g = ctx.createGain();
    env(ctx, g, 0.2, 0.3, 0.5, 1.0, ctx.currentTime, 0.25);
    noise.connect(bp).connect(g).connect(ctx.destination); noise.start(); noise.stop(ctx.currentTime + 1.5);
  },
  birds: (ctx) => {
    const t = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator(); osc.type = 'sine';
      const start = t + i * 0.25 + Math.random() * 0.1;
      osc.frequency.setValueAtTime(2000 + Math.random() * 2000, start);
      osc.frequency.exponentialRampToValueAtTime(3000 + Math.random() * 1500, start + 0.08);
      osc.frequency.exponentialRampToValueAtTime(1500 + Math.random() * 1000, start + 0.15);
      const g = ctx.createGain();
      env(ctx, g, 0.01, 0.03, 0.3, 0.11, start, 0.15);
      osc.connect(g).connect(ctx.destination); osc.start(start); osc.stop(start + 0.15);
    }
  },
  vinyl: (ctx) => {
    const osc = ctx.createOscillator(); osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    const g = ctx.createGain();
    env(ctx, g, 0.001, 0.05, 0.3, 0.25, ctx.currentTime, 0.3);
    osc.connect(g).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.3);
  },
  airhorn: (ctx) => {
    const t = ctx.currentTime;
    [440, 554, 660].forEach(freq => {
      const osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = freq;
      const g = ctx.createGain();
      env(ctx, g, 0.02, 0.05, 0.7, 0.43, t, 0.15);
      osc.connect(g).connect(ctx.destination); osc.start(); osc.stop(t + 0.5);
    });
  },
  harp: (ctx) => {
    const t = ctx.currentTime;
    [262, 330, 392, 523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
      const g = ctx.createGain();
      const start = t + i * 0.06;
      env(ctx, g, 0.001, 0.05, 0.2, 0.34, start, 0.2);
      osc.connect(g).connect(ctx.destination); osc.start(start); osc.stop(start + 0.4);
    });
  },
  drumroll: (ctx) => {
    const t = ctx.currentTime;
    for (let i = 0; i < 20; i++) {
      const noise = createNoise(ctx, 0.04);
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2000;
      const g = ctx.createGain();
      const start = t + i * 0.04;
      const vol = 0.1 + (i / 20) * 0.3;
      g.gain.setValueAtTime(vol, start);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.04);
      noise.connect(hp).connect(g).connect(ctx.destination);
      noise.start(start); noise.stop(start + 0.04);
    }
  },
};

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSFX(sfxId: string): void {
  const generator = SFX_GENERATORS[sfxId as SFXType];
  if (!generator) return;
  try {
    const ctx = getAudioContext();
    generator(ctx);
  } catch (err) {
    logger.error('Failed to play SFX:', err);
  }
}

export function isSynthSFX(sfxId: string): boolean {
  return sfxId in SFX_GENERATORS;
}
