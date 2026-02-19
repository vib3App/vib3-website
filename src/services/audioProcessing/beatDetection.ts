/**
 * Beat Detection - Gap #21
 * Analyzes audio for energy peaks and calculates BPM
 */

export interface BeatDetectionResult {
  bpm: number;
  beatTimestamps: number[];
  confidence: number;
}

export async function detectBeats(audioSource: string | Blob): Promise<BeatDetectionResult> {
  const ctx = new OfflineAudioContext(1, 44100 * 60, 44100);

  let arrayBuffer: ArrayBuffer;
  if (typeof audioSource === 'string') {
    const res = await fetch(audioSource);
    arrayBuffer = await res.arrayBuffer();
  } else {
    arrayBuffer = await audioSource.arrayBuffer();
  }

  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;

  // Compute energy in 50ms windows
  const windowSize = Math.floor(sampleRate * 0.05);
  const energies: number[] = [];
  for (let i = 0; i < channelData.length; i += windowSize) {
    let sum = 0;
    const end = Math.min(i + windowSize, channelData.length);
    for (let j = i; j < end; j++) {
      sum += channelData[j] * channelData[j];
    }
    energies.push(sum / (end - i));
  }

  // Adaptive threshold: use local average in 2-second windows
  const localWindowSize = Math.ceil(2 / 0.05);
  const peakTimes: number[] = [];

  for (let i = 1; i < energies.length - 1; i++) {
    const start = Math.max(0, i - localWindowSize);
    const end = Math.min(energies.length, i + localWindowSize);
    let localSum = 0;
    for (let j = start; j < end; j++) localSum += energies[j];
    const localAvg = localSum / (end - start);
    const threshold = localAvg * 1.4;

    if (
      energies[i] > threshold &&
      energies[i] > energies[i - 1] &&
      energies[i] > energies[i + 1]
    ) {
      const time = (i * windowSize) / sampleRate;
      if (peakTimes.length === 0 || time - peakTimes[peakTimes.length - 1] > 0.2) {
        peakTimes.push(time);
      }
    }
  }

  if (peakTimes.length < 2) {
    return { bpm: 120, beatTimestamps: [], confidence: 0 };
  }

  const intervals = peakTimes.slice(1).map((t, i) => t - peakTimes[i]);
  const bpmCandidates: Record<number, number> = {};
  for (const interval of intervals) {
    let bpm = Math.round(60 / interval);
    while (bpm > 200) bpm = Math.round(bpm / 2);
    while (bpm < 60) bpm *= 2;
    bpmCandidates[bpm] = (bpmCandidates[bpm] || 0) + 1;
  }

  let bestBpm = 120;
  let bestCount = 0;
  for (const [bpmStr, count] of Object.entries(bpmCandidates)) {
    if (count > bestCount) {
      bestBpm = parseInt(bpmStr);
      bestCount = count;
    }
  }

  const confidence = Math.min(bestCount / intervals.length, 1);
  return { bpm: bestBpm, beatTimestamps: peakTimes, confidence };
}
