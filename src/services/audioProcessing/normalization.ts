/**
 * Audio Normalization - Gap #38
 * Analyzes peak levels and applies gain to normalize to target
 */

import { logger } from '@/utils/logger';

export async function normalizeAudio(
  audioSource: string | Blob,
  targetDb: number = -1
): Promise<{ gain: number; peakDb: number }> {
  const ctx = new OfflineAudioContext(1, 44100 * 300, 44100);

  let arrayBuffer: ArrayBuffer;
  if (typeof audioSource === 'string') {
    const res = await fetch(audioSource);
    arrayBuffer = await res.arrayBuffer();
  } else {
    arrayBuffer = await audioSource.arrayBuffer();
  }

  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  const channelData = audioBuffer.getChannelData(0);

  let peak = 0;
  for (let i = 0; i < channelData.length; i++) {
    const abs = Math.abs(channelData[i]);
    if (abs > peak) peak = abs;
  }

  if (peak === 0) return { gain: 1, peakDb: -Infinity };

  const peakDb = 20 * Math.log10(peak);
  const targetLinear = Math.pow(10, targetDb / 20);
  const gain = targetLinear / peak;

  return { gain: Math.min(gain, 10), peakDb };
}

export class AudioNormalizer {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;

  connect(element: HTMLMediaElement, gain: number): void {
    this.disconnect();
    try {
      this.ctx = new AudioContext();
      this.source = this.ctx.createMediaElementSource(element);
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = gain;
      this.source.connect(this.gainNode).connect(this.ctx.destination);
    } catch (err) {
      logger.error('Failed to setup normalizer:', err);
      this.disconnect();
    }
  }

  updateGain(gain: number): void {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);
    }
  }

  disconnect(): void {
    try {
      this.source?.disconnect();
      this.gainNode?.disconnect();
      this.ctx?.close();
    } catch { /* ignore */ }
    this.ctx = null;
    this.gainNode = null;
    this.source = null;
  }
}
