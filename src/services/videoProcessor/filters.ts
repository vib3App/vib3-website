import type { VideoEdits } from './types';

export function cssFilterToFFmpeg(cssFilter: string): string | null {
  const filters: string[] = [];

  const grayscaleMatch = cssFilter.match(/grayscale\(([^)]+)\)/);
  if (grayscaleMatch) {
    const value = parseFloat(grayscaleMatch[1]);
    if (value > 0) filters.push(`hue=s=${1 - value}`);
  }

  const sepiaMatch = cssFilter.match(/sepia\(([^)]+)\)/);
  if (sepiaMatch) {
    const value = parseFloat(sepiaMatch[1]);
    if (value > 0) filters.push(`colorbalance=rs=${value * 0.3}:gs=${value * 0.1}:bs=${-value * 0.2}`);
  }

  const contrastMatch = cssFilter.match(/contrast\(([^)]+)\)/);
  if (contrastMatch) {
    const value = parseFloat(contrastMatch[1]);
    filters.push(`eq=contrast=${value}`);
  }

  const brightnessMatch = cssFilter.match(/brightness\(([^)]+)\)/);
  if (brightnessMatch) {
    const value = parseFloat(brightnessMatch[1]);
    filters.push(`eq=brightness=${value - 1}`);
  }

  const saturateMatch = cssFilter.match(/saturate\(([^)]+)\)/);
  if (saturateMatch) {
    const value = parseFloat(saturateMatch[1]);
    filters.push(`eq=saturation=${value}`);
  }

  const hueRotateMatch = cssFilter.match(/hue-rotate\(([^)]+)deg\)/);
  if (hueRotateMatch) {
    const degrees = parseFloat(hueRotateMatch[1]);
    filters.push(`hue=h=${degrees}`);
  }

  return filters.length > 0 ? filters.join(',') : null;
}

export function buildFFmpegArgs(edits: VideoEdits): string[] {
  const args: string[] = ['-i', 'input.mp4'];

  if (edits.trimStart !== undefined && edits.trimStart > 0) {
    args.push('-ss', edits.trimStart.toString());
  }
  if (edits.trimEnd !== undefined) {
    const duration = edits.trimEnd - (edits.trimStart || 0);
    args.push('-t', duration.toString());
  }

  const videoFilters: string[] = [];
  if (edits.filter && edits.filter !== 'none') {
    const ffmpegFilter = cssFilterToFFmpeg(edits.filter);
    if (ffmpegFilter) videoFilters.push(ffmpegFilter);
  }

  if (videoFilters.length > 0) {
    args.push('-vf', videoFilters.join(','));
  }

  if (edits.volume !== undefined && edits.volume !== 1) {
    args.push('-af', `volume=${edits.volume}`);
  }

  args.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', 'output.mp4');

  return args;
}
