/**
 * Video Analyzer - Gap #18
 * Analyzes video audio levels, scene changes, and beat structure to generate
 * real edit suggestions. Web Audio API for audio + beat detection, HTML5
 * video + canvas color-histogram diffs for scene cuts.
 */

import { logger } from '@/utils/logger';
import { detectBeats } from '@/services/audioProcessing';

export interface AnalysisSuggestion {
  id: string;
  type: 'trim' | 'speed' | 'filter' | 'volume' | 'cut' | 'beat';
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
 * Sample the video at ~1 fps, compute a coarse color histogram per frame,
 * and return timestamps where consecutive frames differ enough to look
 * like a scene change. Returns up to N candidate cut points.
 *
 * Cheap implementation: small 80x80 canvas, sum-of-absolute-differences on
 * the downscaled image data. Good enough for "is this a different scene?"
 * without pulling in TensorFlow.
 */
async function detectSceneChanges(
  videoUrl: string,
  duration: number,
  maxResults = 8,
): Promise<number[]> {
  if (typeof document === 'undefined' || duration <= 0) return [];
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.src = videoUrl;
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 80;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) { resolve([]); return; }

    const sampleStep = Math.max(0.5, Math.min(2, duration / 60));
    const timestamps: number[] = [];
    for (let t = 0; t <= duration; t += sampleStep) timestamps.push(t);

    const diffs: { t: number; diff: number }[] = [];
    let prev: Uint8ClampedArray | null = null;
    let cursor = 0;
    let settled = false;

    const cleanup = () => {
      if (settled) return;
      settled = true;
      try { video.pause(); } catch { /* ignore */ }
      video.src = '';
      diffs.sort((a, b) => b.diff - a.diff);
      const peaks = diffs
        .slice(0, maxResults)
        .map(d => d.t)
        .sort((a, b) => a - b);
      resolve(peaks);
    };

    video.addEventListener('error', cleanup);
    video.addEventListener('loadedmetadata', () => { seekNext(); });
    video.addEventListener('seeked', () => {
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        if (prev) {
          let sum = 0;
          for (let i = 0; i < data.length; i += 4) {
            sum += Math.abs(data[i] - prev[i])
              + Math.abs(data[i + 1] - prev[i + 1])
              + Math.abs(data[i + 2] - prev[i + 2]);
          }
          const normalized = sum / (canvas.width * canvas.height * 3);
          diffs.push({ t: timestamps[cursor], diff: normalized });
        }
        prev = new Uint8ClampedArray(data);
      } catch (err) {
        logger.error('scene sample failed:', err);
      }
      cursor++;
      seekNext();
    });

    function seekNext() {
      if (cursor >= timestamps.length) { cleanup(); return; }
      video.currentTime = timestamps[cursor];
    }

    // Safety net so we don't hang if seeked never fires.
    setTimeout(cleanup, 30_000);
  });
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

  // 6. Visual scene-change detection. Cheap canvas histogram diff at ~1 fps.
  // Top peaks become "Cut at scene change" suggestions; the apply handler can
  // split clips at those times.
  try {
    const scenes = await detectSceneChanges(videoUrl, duration, 6);
    if (scenes.length > 0) {
      const cutTimes = scenes.filter(t => t > 1 && t < duration - 1).slice(0, 3);
      if (cutTimes.length > 0) {
        suggestions.push({
          id: `sug-${idCounter++}`,
          type: 'cut',
          label: 'Cut at scene changes',
          description: `Detected ${cutTimes.length} visual scene change${cutTimes.length === 1 ? '' : 's'} (${cutTimes.map(t => t.toFixed(1) + 's').join(', ')}). Splitting here keeps shots tight.`,
          value: { cutTimes },
        });
      }
    }
  } catch (err) {
    logger.error('Scene-change detection failed:', err);
  }

  // 7. Beat-driven cut suggestion. Reuses the audio analyzer that already
  // powers the beat-sync panel — if we find a confident tempo, suggest
  // snapping cuts to beats for a music-video edit.
  try {
    const beats = await detectBeats(videoUrl);
    if (beats.confidence > 0.4 && beats.beatTimestamps.length >= 4) {
      // Pick every Nth beat so we don't suggest a cut every 0.5s.
      const stride = Math.max(2, Math.round(beats.beatTimestamps.length / 8));
      const beatCuts = beats.beatTimestamps
        .filter((_, i) => i > 0 && i % stride === 0)
        .filter(t => t < duration - 0.5);
      if (beatCuts.length > 0) {
        suggestions.push({
          id: `sug-${idCounter++}`,
          type: 'beat',
          label: `Sync cuts to ${beats.bpm} BPM`,
          description: `Confident beat track detected (${Math.round(beats.confidence * 100)}% confidence). Snap cuts to ${beatCuts.length} beats for a rhythmic feel.`,
          value: { beatTimes: beatCuts, bpm: beats.bpm },
        });
      }
    }
  } catch (err) {
    logger.error('Beat detection in analyzer failed:', err);
  }

  return suggestions;
}
