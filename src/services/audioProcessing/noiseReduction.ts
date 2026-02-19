/**
 * Noise Reduction - Gap #23
 * Uses BiquadFilterNode to reduce common noise frequencies
 */

import { logger } from '@/utils/logger';

export class NoiseReductionProcessor {
  private ctx: AudioContext | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private highpass: BiquadFilterNode | null = null;
  private lowpass: BiquadFilterNode | null = null;
  private notch: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private connected = false;

  connect(element: HTMLMediaElement, amount: number): void {
    if (this.connected) this.disconnect();

    try {
      this.ctx = new AudioContext();
      this.source = this.ctx.createMediaElementSource(element);

      // High-pass: remove low rumble (scaled 20-300Hz based on amount)
      this.highpass = this.ctx.createBiquadFilter();
      this.highpass.type = 'highpass';
      this.highpass.frequency.value = 20 + (amount / 100) * 280;
      this.highpass.Q.value = 0.7;

      // Low-pass: remove high-frequency hiss (scaled 20000-4000Hz)
      this.lowpass = this.ctx.createBiquadFilter();
      this.lowpass.type = 'lowpass';
      this.lowpass.frequency.value = 20000 - (amount / 100) * 16000;
      this.lowpass.Q.value = 0.7;

      // Notch at 60Hz: remove electrical hum
      this.notch = this.ctx.createBiquadFilter();
      this.notch.type = 'notch';
      this.notch.frequency.value = 60;
      this.notch.Q.value = 10 + (amount / 100) * 20;

      // Compensate for volume loss
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 1 + (amount / 100) * 0.3;

      this.source
        .connect(this.highpass)
        .connect(this.lowpass)
        .connect(this.notch)
        .connect(this.gainNode)
        .connect(this.ctx.destination);

      this.connected = true;
    } catch (err) {
      logger.error('Failed to setup noise reduction:', err);
      this.disconnect();
    }
  }

  updateAmount(amount: number): void {
    if (!this.connected) return;
    if (this.highpass) this.highpass.frequency.value = 20 + (amount / 100) * 280;
    if (this.lowpass) this.lowpass.frequency.value = 20000 - (amount / 100) * 16000;
    if (this.notch) this.notch.Q.value = 10 + (amount / 100) * 20;
    if (this.gainNode) this.gainNode.gain.value = 1 + (amount / 100) * 0.3;
  }

  disconnect(): void {
    try {
      this.source?.disconnect();
      this.highpass?.disconnect();
      this.lowpass?.disconnect();
      this.notch?.disconnect();
      this.gainNode?.disconnect();
      this.ctx?.close();
    } catch { /* ignore */ }
    this.source = null;
    this.highpass = null;
    this.lowpass = null;
    this.notch = null;
    this.gainNode = null;
    this.ctx = null;
    this.connected = false;
  }

  get isConnected(): boolean { return this.connected; }
}
