'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let ffmpegLoaded = false;
let loadingPromise: Promise<void> | null = null;

async function loadFFmpeg(): Promise<void> {
  if (ffmpegLoaded && ffmpeg) return;

  if (loadingPromise) {
    await loadingPromise;
    return;
  }

  loadingPromise = (async () => {
    ffmpeg = new FFmpeg();

    // Load FFmpeg core from CDN
    await ffmpeg.load({
      coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
      wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
    });

    ffmpegLoaded = true;
  })();

  await loadingPromise;
}

export interface MergeProgress {
  stage: 'loading' | 'processing' | 'finalizing';
  percent: number;
}

export async function mergeVideoClips(
  clips: Blob[],
  onProgress?: (progress: MergeProgress) => void
): Promise<Blob> {
  if (clips.length === 0) {
    throw new Error('No clips to merge');
  }

  if (clips.length === 1) {
    return clips[0];
  }

  onProgress?.({ stage: 'loading', percent: 0 });

  await loadFFmpeg();

  if (!ffmpeg) {
    throw new Error('FFmpeg failed to load');
  }

  onProgress?.({ stage: 'processing', percent: 10 });

  try {
    // Write each clip to FFmpeg virtual filesystem
    const inputFiles: string[] = [];
    for (let i = 0; i < clips.length; i++) {
      const filename = `input${i}.webm`;
      const data = await fetchFile(clips[i]);
      await ffmpeg.writeFile(filename, data);
      inputFiles.push(filename);

      const progressPercent = 10 + Math.floor((i / clips.length) * 40);
      onProgress?.({ stage: 'processing', percent: progressPercent });
    }

    // Create concat file list
    const concatList = inputFiles.map(f => `file '${f}'`).join('\n');
    await ffmpeg.writeFile('concat.txt', concatList);

    onProgress?.({ stage: 'processing', percent: 60 });

    // Merge clips using concat demuxer (fast, no re-encoding if codecs match)
    await ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat.txt',
      '-c', 'copy',
      'output.webm'
    ]);

    onProgress?.({ stage: 'finalizing', percent: 90 });

    // Read output file
    const outputData = await ffmpeg.readFile('output.webm');

    // Clean up files
    for (const file of inputFiles) {
      await ffmpeg.deleteFile(file);
    }
    await ffmpeg.deleteFile('concat.txt');
    await ffmpeg.deleteFile('output.webm');

    onProgress?.({ stage: 'finalizing', percent: 100 });

    // Convert to Blob (outputData is Uint8Array from FFmpeg)
    // Copy the data to ensure we have a clean ArrayBuffer
    const uint8Array = new Uint8Array(outputData as Uint8Array);
    const outputBlob = new Blob([uint8Array], { type: 'video/webm' });
    return outputBlob;

  } catch (error) {
    console.error('FFmpeg merge error:', error);
    throw new Error('Failed to merge video clips');
  }
}

function buildAtempoChain(speed: number): string {
  if (speed === 1) return '';
  const filters: string[] = [];
  let remaining = speed;

  while (remaining > 2) {
    filters.push('atempo=2.0');
    remaining /= 2;
  }
  while (remaining < 0.5) {
    filters.push('atempo=0.5');
    remaining /= 0.5;
  }
  if (Math.abs(remaining - 1) > 0.001) {
    filters.push(`atempo=${remaining.toFixed(4)}`);
  }

  return filters.join(',');
}

export async function applyVideoSpeed(
  blob: Blob,
  speed: number,
  onProgress?: (progress: MergeProgress) => void,
): Promise<Blob> {
  if (speed === 1) return blob;

  onProgress?.({ stage: 'loading', percent: 0 });
  await loadFFmpeg();
  if (!ffmpeg) throw new Error('FFmpeg failed to load');

  onProgress?.({ stage: 'processing', percent: 20 });

  const data = await fetchFile(blob);
  await ffmpeg.writeFile('speed_input.webm', data);

  const speedFactor = 1 / speed;
  const vFilter = `setpts=${speedFactor.toFixed(4)}*PTS`;
  const aFilter = buildAtempoChain(speed);

  onProgress?.({ stage: 'processing', percent: 40 });

  // Try with audio first, fallback to video-only if no audio stream
  const argsWithAudio = ['-i', 'speed_input.webm', '-filter:v', vFilter];
  if (aFilter) argsWithAudio.push('-filter:a', aFilter);
  argsWithAudio.push('speed_output.webm');

  try {
    await ffmpeg.exec(argsWithAudio);
  } catch {
    // Retry without audio filters (input may have no audio stream)
    try { await ffmpeg.deleteFile('speed_output.webm'); } catch {}
    await ffmpeg.exec(['-i', 'speed_input.webm', '-filter:v', vFilter, '-an', 'speed_output.webm']);
  }

  onProgress?.({ stage: 'finalizing', percent: 80 });

  const output = await ffmpeg.readFile('speed_output.webm');
  await ffmpeg.deleteFile('speed_input.webm');
  await ffmpeg.deleteFile('speed_output.webm');

  onProgress?.({ stage: 'finalizing', percent: 100 });

  const uint8Array = new Uint8Array(output as Uint8Array);
  return new Blob([uint8Array], { type: 'video/webm' });
}

// Preload FFmpeg in background (call this early to reduce wait time later)
export function preloadFFmpeg(): void {
  loadFFmpeg().catch(console.error);
}
