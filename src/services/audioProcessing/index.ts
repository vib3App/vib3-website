/**
 * Audio Processing barrel export
 * Gaps #19, #21, #23, #24, #38
 */
export { detectBeats } from './beatDetection';
export type { BeatDetectionResult } from './beatDetection';
export { NoiseReductionProcessor } from './noiseReduction';
export { AudioDuckingProcessor } from './audioDucking';
export { normalizeAudio, AudioNormalizer } from './normalization';
export { processVoiceEffectOffline, buildVoiceEffectFilter } from './voiceEffects';
export type { VoiceEffectId } from './voiceEffects';
