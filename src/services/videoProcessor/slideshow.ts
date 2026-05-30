/**
 * Slideshow renderer. Turns a list of images into a vertical MP4 with
 * uniform per-slide duration, an optional inter-slide transition, and an
 * optional music track. Runs on FFmpeg.wasm via the shared processor.
 */
import type { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import type { ProcessingProgress } from './types';
import { logger } from '@/utils/logger';

export type SlideshowTransition = 'none' | 'fade' | 'slideleft' | 'slideup' | 'circleopen' | 'wipeleft';

export interface SlideshowOptions {
  images: Array<File | Blob>;
  durationPerSlide: number; // seconds, applies to every slide
  /** Optional per-slide overrides. When present, must match images.length and
   * each value > 0; otherwise falls back to durationPerSlide. */
  perSlideDurations?: number[];
  transition: SlideshowTransition;
  transitionDuration?: number; // seconds, default 0.5
  music?: Blob | null;
  musicVolume?: number; // 0..1, default 0.7
  width?: number;  // output width  (default 1080)
  height?: number; // output height (default 1920)
}

interface BuildResult {
  args: string[];
  inputs: string[];
}

function buildFilterComplex(
  count: number,
  slideDurations: number[],
  transition: SlideshowTransition,
  transitionDuration: number,
  width: number,
  height: number,
): string {
  // Normalize each input to width:height first.
  const norm: string[] = [];
  for (let i = 0; i < count; i++) {
    norm.push(
      `[${i}:v]scale=${width}:${height}:force_original_aspect_ratio=increase,` +
      `crop=${width}:${height},setsar=1,fps=30,format=yuv420p[v${i}]`,
    );
  }

  // No transitions: concat
  if (transition === 'none' || count === 1) {
    if (count === 1) return `${norm[0]};[v0]copy[outv]`;
    const concatInputs = Array.from({ length: count }, (_, i) => `[v${i}]`).join('');
    return `${norm.join(';')};${concatInputs}concat=n=${count}:v=1:a=0[outv]`;
  }

  // xfade chain. Each transition offset = sum of previous slide durations
  // minus one transition window so they overlap.
  const chain: string[] = [...norm];
  let prevLabel = 'v0';
  let runningOffset = slideDurations[0] - transitionDuration;
  for (let i = 1; i < count; i++) {
    const isLast = i === count - 1;
    const outLabel = isLast ? 'outv' : `t${i}`;
    chain.push(
      `[${prevLabel}][v${i}]xfade=transition=${transition}:` +
      `duration=${transitionDuration.toFixed(2)}:offset=${runningOffset.toFixed(2)}[${outLabel}]`,
    );
    prevLabel = outLabel;
    runningOffset += slideDurations[i] - transitionDuration;
  }
  return chain.join(';');
}

function buildArgs(opts: SlideshowOptions, hasMusic: boolean, totalDurationSec: number, slideDurations: number[]): BuildResult {
  const args: string[] = [];
  const inputs: string[] = [];
  const transitionDuration = opts.transitionDuration ?? 0.5;
  const width = opts.width ?? 1080;
  const height = opts.height ?? 1920;

  // Image inputs: each as a looped still photo of its slot duration (seconds).
  for (let i = 0; i < opts.images.length; i++) {
    const fname = `slide_${i}.jpg`;
    inputs.push(fname);
    args.push('-loop', '1', '-t', slideDurations[i].toString(), '-i', fname);
  }

  if (hasMusic) {
    inputs.push('music.mp3');
    args.push('-i', 'music.mp3');
  }

  const videoFilter = buildFilterComplex(
    opts.images.length,
    slideDurations,
    opts.transition,
    transitionDuration,
    width,
    height,
  );
  args.push('-filter_complex', videoFilter);
  args.push('-map', '[outv]');

  if (hasMusic) {
    const musicIdx = opts.images.length;
    const musicVol = opts.musicVolume ?? 0.7;
    // Tee off a single audio chain: trim/fade to slideshow length, set volume.
    args.push(
      '-filter_complex',
      `[${musicIdx}:a]volume=${musicVol},afade=t=in:st=0:d=0.5,afade=t=out:st=${(totalDurationSec - 0.5).toFixed(2)}:d=0.5[outa]`,
    );
    args.push('-map', '[outa]');
    args.push('-shortest');
  }

  args.push(
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
    '-pix_fmt', 'yuv420p',
    '-r', '30',
    '-c:a', 'aac', '-b:a', '128k',
    '-movflags', '+faststart',
    'slideshow.mp4',
  );

  return { args, inputs };
}

export async function buildSlideshowImpl(
  ffmpeg: FFmpeg,
  opts: SlideshowOptions,
  onProgress?: (p: ProcessingProgress) => void,
): Promise<Blob | null> {
  if (opts.images.length === 0) return null;
  if (opts.durationPerSlide <= 0) return null;

  try {
    onProgress?.({ stage: 'processing', percent: 0, message: 'Preparing slides...' });

    // Write each image to FFmpeg.wasm's virtual FS.
    for (let i = 0; i < opts.images.length; i++) {
      const data = await fetchFile(opts.images[i]);
      await ffmpeg.writeFile(`slide_${i}.jpg`, data);
      onProgress?.({
        stage: 'processing',
        percent: Math.round(((i + 1) / opts.images.length) * 30),
        message: `Loaded ${i + 1}/${opts.images.length} slides...`,
      });
    }

    const hasMusic = !!opts.music;
    if (hasMusic && opts.music) {
      const musicData = await fetchFile(opts.music);
      await ffmpeg.writeFile('music.mp3', musicData);
    }

    const transitionDuration = opts.transitionDuration ?? 0.5;
    // Per-slide durations: use the override array if it matches, otherwise
    // fall back to uniform durationPerSlide for every slide.
    const slideDurations: number[] = (() => {
      const override = opts.perSlideDurations;
      if (override && override.length === opts.images.length && override.every(d => d > 0)) {
        return override.map(d => Number(d.toFixed(3)));
      }
      return new Array(opts.images.length).fill(opts.durationPerSlide);
    })();
    const summedSlides = slideDurations.reduce((a, b) => a + b, 0);
    const total = opts.transition === 'none'
      ? summedSlides
      : summedSlides - Math.max(0, opts.images.length - 1) * transitionDuration;

    const { args, inputs } = buildArgs(opts, hasMusic, total, slideDurations);

    onProgress?.({ stage: 'encoding', percent: 40, message: 'Rendering slideshow...' });
    await ffmpeg.exec(args);

    const data = await ffmpeg.readFile('slideshow.mp4');
    const blob = new Blob([data as BlobPart], { type: 'video/mp4' });

    // Cleanup
    for (const fname of inputs) {
      try { await ffmpeg.deleteFile(fname); } catch { /* ignore */ }
    }
    try { await ffmpeg.deleteFile('slideshow.mp4'); } catch { /* ignore */ }

    onProgress?.({ stage: 'complete', percent: 100, message: 'Slideshow ready!' });
    return blob;
  } catch (err) {
    logger.error('Slideshow render failed:', err);
    onProgress?.({ stage: 'error', percent: 0, message: 'Slideshow render failed' });
    return null;
  }
}
