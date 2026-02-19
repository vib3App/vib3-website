/**
 * Voice Effects Processing - Gap #19
 * Real-time preview via Web Audio API nodes + offline export via OfflineAudioContext.
 */

import { logger } from '@/utils/logger';

export type VoiceEffectId =
  | 'chipmunk' | 'deep' | 'robot' | 'echo'
  | 'alien' | 'helium' | 'giant';

interface EffectConfig {
  playbackRate: number;
  preservesPitch: boolean;
  buildChain: (ctx: BaseAudioContext, source: AudioNode) => { output: AudioNode; nodes: AudioNode[] };
}

function passthrough(ctx: BaseAudioContext, source: AudioNode) {
  const gain = ctx.createGain();
  gain.gain.value = 1;
  source.connect(gain);
  return { output: gain, nodes: [gain] };
}

const EFFECT_CONFIGS: Record<VoiceEffectId, EffectConfig> = {
  chipmunk: {
    playbackRate: 1.5, preservesPitch: false,
    buildChain: passthrough,
  },
  deep: {
    playbackRate: 0.75, preservesPitch: false,
    buildChain: passthrough,
  },
  robot: {
    playbackRate: 1, preservesPitch: true,
    buildChain: (ctx, source) => {
      const osc = ctx.createOscillator();
      const modGain = ctx.createGain();
      osc.frequency.value = 50;
      modGain.gain.value = 0.5;
      osc.connect(modGain);
      osc.start();
      const inputGain = ctx.createGain();
      modGain.connect(inputGain.gain);
      source.connect(inputGain);
      return { output: inputGain, nodes: [osc, modGain, inputGain] };
    },
  },
  echo: {
    playbackRate: 1, preservesPitch: true,
    buildChain: (ctx, source) => {
      const delay = ctx.createDelay(1);
      delay.delayTime.value = 0.3;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.4;
      const dry = ctx.createGain();
      dry.gain.value = 1;
      source.connect(dry);
      source.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      const merger = ctx.createGain();
      dry.connect(merger);
      delay.connect(merger);
      return { output: merger, nodes: [delay, feedback, dry, merger] };
    },
  },
  alien: {
    playbackRate: 1, preservesPitch: true,
    buildChain: (ctx, source) => {
      const osc = ctx.createOscillator();
      const modGain = ctx.createGain();
      osc.frequency.value = 200;
      osc.type = 'sine';
      modGain.gain.value = 0.8;
      osc.connect(modGain);
      osc.start();
      const inputGain = ctx.createGain();
      modGain.connect(inputGain.gain);
      source.connect(inputGain);
      return { output: inputGain, nodes: [osc, modGain, inputGain] };
    },
  },
  helium: {
    playbackRate: 2, preservesPitch: false,
    buildChain: passthrough,
  },
  giant: {
    playbackRate: 0.5, preservesPitch: false,
    buildChain: (ctx, source) => {
      const gain = ctx.createGain();
      gain.gain.value = 1.2;
      source.connect(gain);
      return { output: gain, nodes: [gain] };
    },
  },
};

/**
 * Process an audio buffer offline with a voice effect.
 * Returns a new AudioBuffer with the effect applied.
 */
export async function processVoiceEffectOffline(
  audioBuffer: AudioBuffer,
  effectId: VoiceEffectId,
): Promise<AudioBuffer> {
  const config = EFFECT_CONFIGS[effectId];
  if (!config) throw new Error(`Unknown voice effect: ${effectId}`);

  const rate = config.playbackRate;
  const outputLength = Math.ceil(audioBuffer.length / rate);
  const sampleRate = audioBuffer.sampleRate;

  const offlineCtx = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    outputLength + sampleRate, // extra second for echo tails
    sampleRate,
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.playbackRate.value = rate;

  const { output } = config.buildChain(offlineCtx, source);
  output.connect(offlineCtx.destination);

  source.start(0);
  const rendered = await offlineCtx.startRendering();
  return rendered;
}

/**
 * Build FFmpeg audio filter string for a voice effect.
 * Used during FFmpeg export to apply the effect to the audio track.
 */
export function buildVoiceEffectFilter(effectId: string): string | null {
  switch (effectId) {
    case 'chipmunk':
      return 'asetrate=44100*1.5,aresample=44100,atempo=0.6667';
    case 'deep':
      return 'asetrate=44100*0.75,aresample=44100,atempo=1.3333';
    case 'robot':
      return 'afftfilt=real=\'hypot(re,im)*cos(0)\':imag=\'hypot(re,im)*sin(0)\':win_size=512:overlap=0.75';
    case 'echo':
      return 'aecho=0.8:0.88:300:0.4';
    case 'alien':
      return 'tremolo=f=200:d=0.8';
    case 'helium':
      return 'asetrate=44100*2,aresample=44100,atempo=0.5';
    case 'giant':
      return 'asetrate=44100*0.5,aresample=44100,atempo=2,volume=1.2';
    default:
      return null;
  }
}
