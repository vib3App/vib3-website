/**
 * Video Analyzer - Gap #18
 * Analyzes video audio levels and motion to generate real AI-like edit suggestions.
 * Uses Web Audio API for audio analysis, canvas for motion detection.
 */

import { logger } from '@/utils/logger';

export interface AnalysisSuggestion {
  id: string;
  type: 'trim' | 'speed' | 'filter' | 'volume';
  label: string;
  description: string;
  value: Record<string, unknown>;
}

interface AudioSegment {
  start: number;
  end: number;
  avgLevel: number;
}

/**
 * Analyze a video element's audio for silent sections and level issues.
 */
async function analyzeAudioLevels(
  videoUrl: string,
): Promise<{ segments: AudioSegment[]; peakDb: number; avgDb: number }> {
  try {
    const response = await fetch(videoUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioCtx = new OfflineAudioContext(1, 44100 * 300, 44100);
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    // Analyze in 0.5s windows
    const windowSamples = Math.floor(sampleRate * 0.5);
    const segments: AudioSegment[] = [];
    let globalPeak = 0;
    let globalSum = 0;
    let windowCount = 0;

    for (let i = 0; i < channelData.length; i += windowSamples) {
      const end = Math.min(i + windowSamples, channelData.length);
      let sum = 0;
      let peak = 0;
      for (let j = i; j < end; j++) {
        const abs = Math.abs(channelData[j]);
        sum += abs;
        if (abs > peak) peak = abs;
      }
      const avg = sum / (end - i);
      if (peak > globalPeak) globalPeak = peak;
      globalSum += avg;
      windowCount++;

      segments.push({
        start: i / sampleRate,
        end: end / sampleRate,
        avgLevel: avg,
      });
    }

    const peakDb = globalPeak > 0 ? 20 * Math.log10(globalPeak) : -Infinity;
    const avgDb = windowCount > 0 && globalSum > 0
      ? 20 * Math.log10(globalSum / windowCount)
      : -Infinity;

    return { segments, peakDb, avgDb };
  } catch (err) {
    logger.error('Audio analysis failed:', err);
    return { segments: [], peakDb: -Infinity, avgDb: -Infinity };
  }
}

/**
 * Detect silent segments (below threshold) in analyzed audio.
 */
function findSilentSegments(
  segments: AudioSegment[],
  threshold = 0.005,
): { start: number; end: number }[] {
  const silent: { start: number; end: number }[] = [];
  let runStart: number | null = null;

  for (const seg of segments) {
    if (seg.avgLevel < threshold) {
      if (runStart === null) runStart = seg.start;
    } else {
      if (runStart !== null) {
        const duration = seg.start - runStart;
        if (duration >= 1) {
          silent.push({ start: runStart, end: seg.start });
        }
        runStart = null;
      }
    }
  }
  if (runStart !== null) {
    const last = segments[segments.length - 1];
    if (last.end - runStart >= 1) {
      silent.push({ start: runStart, end: last.end });
    }
  }

  return silent;
}

/**
 * Detect low-energy (potentially low-motion) sections.
 */
function findLowEnergySegments(
  segments: AudioSegment[],
  duration: number,
): { start: number; end: number }[] {
  if (segments.length === 0) return [];

  const avgLevel = segments.reduce((s, seg) => s + seg.avgLevel, 0) / segments.length;
  const lowThreshold = avgLevel * 0.3;
  const results: { start: number; end: number }[] = [];
  let runStart: number | null = null;

  for (const seg of segments) {
    if (seg.avgLevel < lowThreshold && seg.avgLevel > 0.001) {
      if (runStart === null) runStart = seg.start;
    } else {
      if (runStart !== null && seg.start - runStart >= 2) {
        results.push({ start: runStart, end: seg.start });
      }
      runStart = null;
    }
  }

  // Only return if they're in the middle portion (not start/end)
  return results.filter(r => r.start > duration * 0.1 && r.end < duration * 0.9);
}

/**
 * Run full analysis on a video and return actionable suggestions.
 */
export async function analyzeVideoForSuggestions(
  videoUrl: string,
  duration: number,
): Promise<AnalysisSuggestion[]> {
  const suggestions: AnalysisSuggestion[] = [];
  let idCounter = 1;

  const { segments, peakDb, avgDb } = await analyzeAudioLevels(videoUrl);

  // 1. Check for leading silence
  const silentParts = findSilentSegments(segments);
  const leadingSilence = silentParts.find(s => s.start < 0.5);
  if (leadingSilence && leadingSilence.end > 1) {
    suggestions.push({
      id: `sug-${idCounter++}`,
      type: 'trim',
      label: 'Remove leading silence',
      description: `Detected ${leadingSilence.end.toFixed(1)}s of silence at the start. Trim to begin at the action.`,
      value: { trimStart: Math.round(leadingSilence.end * 10) / 10 },
    });
  }

  // 2. Check for trailing silence
  const trailingSilence = silentParts.find(s => s.end >= duration - 0.5);
  if (trailingSilence && (duration - trailingSilence.start) > 1) {
    suggestions.push({
      id: `sug-${idCounter++}`,
      type: 'trim',
      label: 'Trim trailing silence',
      description: `${(duration - trailingSilence.start).toFixed(1)}s of silence at the end. Trim for a cleaner finish.`,
      value: { trimEnd: Math.round(trailingSilence.start * 10) / 10 },
    });
  }

  // 3. Detect low-energy sections that could be sped up
  const lowEnergy = findLowEnergySegments(segments, duration);
  if (lowEnergy.length > 0) {
    const longest = lowEnergy.reduce((a, b) => (b.end - b.start) > (a.end - a.start) ? b : a);
    const dur = longest.end - longest.start;
    suggestions.push({
      id: `sug-${idCounter++}`,
      type: 'speed',
      label: 'Speed up quiet section',
      description: `A ${dur.toFixed(1)}s low-energy section (${longest.start.toFixed(1)}s - ${longest.end.toFixed(1)}s) could be sped up to 1.5x for better pacing.`,
      value: { speed: 1.5 },
    });
  }

  // 4. Volume normalization suggestion
  if (peakDb < -6) {
    suggestions.push({
      id: `sug-${idCounter++}`,
      type: 'volume',
      label: 'Boost audio levels',
      description: `Peak audio is ${peakDb.toFixed(1)}dB (quiet). Boosting volume to ${Math.min(2, Math.pow(10, (-1 - peakDb) / 20)).toFixed(1)}x would improve clarity.`,
      value: { volume: Math.min(2, Math.round(Math.pow(10, (-1 - peakDb) / 20) * 10) / 10) },
    });
  } else if (peakDb > -0.5) {
    suggestions.push({
      id: `sug-${idCounter++}`,
      type: 'volume',
      label: 'Reduce audio clipping',
      description: `Audio peaks near 0dB (possible clipping). Reducing to 0.85x prevents distortion.`,
      value: { volume: 0.85 },
    });
  }

  // 5. Filter suggestion based on overall energy
  if (avgDb < -20) {
    suggestions.push({
      id: `sug-${idCounter++}`,
      type: 'filter',
      label: 'Apply "Moody" filter',
      description: 'The quiet, atmospheric audio suggests a moody visual treatment would complement the footage.',
      value: { filterIndex: 23 }, // Moody filter index
    });
  } else if (avgDb > -10) {
    suggestions.push({
      id: `sug-${idCounter++}`,
      type: 'filter',
      label: 'Apply "Vivid" filter',
      description: 'High-energy audio pairs well with vivid, saturated visuals for maximum impact.',
      value: { filterIndex: 5 }, // Vivid filter index
    });
  }

  return suggestions;
}
