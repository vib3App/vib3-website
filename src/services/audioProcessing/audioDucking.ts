/**
 * Audio Ducking - Gap #24
 * Analyzes audio for voice presence, auto-reduces music volume
 */

import { logger } from '@/utils/logger';

export class AudioDuckingProcessor {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private voiceSource: MediaElementAudioSourceNode | null = null;
  private musicGain: GainNode | null = null;
  private animFrameId: number | null = null;
  private duckAmount: number = 0.3;

  connect(
    voiceElement: HTMLMediaElement,
    musicElement: HTMLMediaElement,
    duckAmount: number = 70
  ): void {
    this.disconnect();
    this.duckAmount = 1 - duckAmount / 100;

    try {
      this.ctx = new AudioContext();

      this.voiceSource = this.ctx.createMediaElementSource(voiceElement);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      // Bandpass for voice frequencies (85Hz-3000Hz)
      const voiceBand = this.ctx.createBiquadFilter();
      voiceBand.type = 'bandpass';
      voiceBand.frequency.value = 1000;
      voiceBand.Q.value = 0.5;

      this.voiceSource.connect(voiceBand).connect(this.analyser);
      this.voiceSource.connect(this.ctx.destination);

      // Music chain with gain control
      const musicSource = this.ctx.createMediaElementSource(musicElement);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 1;
      musicSource.connect(this.musicGain).connect(this.ctx.destination);

      this.startAnalysis();
    } catch (err) {
      logger.error('Failed to setup audio ducking:', err);
      this.disconnect();
    }
  }

  private startAnalysis(): void {
    if (!this.analyser || !this.musicGain || !this.ctx) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    const analyze = () => {
      if (!this.analyser || !this.musicGain || !this.ctx) return;

      this.analyser.getFloatTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / bufferLength);

      const voiceDetected = rms > 0.02;
      const targetGain = voiceDetected ? this.duckAmount : 1;

      const currentGain = this.musicGain.gain.value;
      const smoothed = currentGain + (targetGain - currentGain) * 0.1;
      this.musicGain.gain.setValueAtTime(smoothed, this.ctx.currentTime);

      this.animFrameId = requestAnimationFrame(analyze);
    };

    analyze();
  }

  updateDuckAmount(amount: number): void {
    this.duckAmount = 1 - amount / 100;
  }

  disconnect(): void {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    try {
      this.voiceSource?.disconnect();
      this.musicGain?.disconnect();
      this.analyser?.disconnect();
      this.ctx?.close();
    } catch { /* ignore */ }
    this.ctx = null;
    this.analyser = null;
    this.voiceSource = null;
    this.musicGain = null;
    this.animFrameId = null;
  }
}
