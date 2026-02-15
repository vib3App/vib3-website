import type { VideoEdits, TextOverlay, StickerOverlay } from './types';

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

export function renderOverlaysToImage(
  texts: TextOverlay[],
  stickers: StickerOverlay[],
  videoWidth: number,
  videoHeight: number,
  displayHeight?: number,
): Uint8Array | null {
  if (texts.length === 0 && stickers.length === 0) return null;

  const canvas = document.createElement('canvas');
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const scale = displayHeight ? videoHeight / displayHeight : 1;

  for (const text of texts) {
    ctx.save();
    const x = (text.x / 100) * videoWidth;
    const y = (text.y / 100) * videoHeight;
    const scaledFontSize = Math.round(text.fontSize * scale);
    ctx.font = `bold ${scaledFontSize}px sans-serif`;
    ctx.fillStyle = text.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4 * scale;
    ctx.shadowOffsetX = 2 * scale;
    ctx.shadowOffsetY = 2 * scale;
    ctx.fillText(text.text, x, y);
    ctx.restore();
  }

  for (const sticker of stickers) {
    ctx.save();
    const x = (sticker.x / 100) * videoWidth;
    const y = (sticker.y / 100) * videoHeight;
    const stickerSize = Math.round(48 * scale * sticker.scale);
    ctx.translate(x, y);
    ctx.rotate((sticker.rotation * Math.PI) / 180);
    ctx.font = `${stickerSize}px 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sticker.emoji, 0, 0);
    ctx.restore();
  }

  const dataUrl = canvas.toDataURL('image/png');
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function buildFFmpegArgs(edits: VideoEdits, hasOverlay = false, hasMusic = false): string[] {
  const args: string[] = ['-i', 'input.mp4'];
  let inputIdx = 1;
  const overlayIdx = hasOverlay ? inputIdx++ : -1;
  const musicIdx = hasMusic ? inputIdx++ : -1;

  if (hasOverlay) args.push('-i', 'overlay.png');
  if (hasMusic) args.push('-i', 'music.mp3');

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

  const useComplex = hasOverlay || hasMusic;

  if (useComplex) {
    const filterParts: string[] = [];

    // Video chain
    if (hasOverlay) {
      if (videoFilters.length > 0) {
        filterParts.push(`[0:v]${videoFilters.join(',')}[vfiltered]`);
        filterParts.push(`[vfiltered][${overlayIdx}:v]overlay=0:0[outv]`);
      } else {
        filterParts.push(`[0:v][${overlayIdx}:v]overlay=0:0[outv]`);
      }
    } else if (videoFilters.length > 0) {
      filterParts.push(`[0:v]${videoFilters.join(',')}[outv]`);
    }

    // Audio chain - use anullsrc as fallback if video has no audio
    if (hasMusic) {
      const origVol = edits.volume !== undefined ? edits.volume : 1;
      const musVol = edits.musicVolume !== undefined ? edits.musicVolume : 0.5;
      if (origVol > 0) {
        filterParts.push(`[0:a]volume=${origVol}[a0]`);
        filterParts.push(`[${musicIdx}:a]volume=${musVol}[a1]`);
        filterParts.push(`[a0][a1]amix=inputs=2:duration=first[outa]`);
      } else {
        // Original muted, just use music track
        filterParts.push(`[${musicIdx}:a]volume=${musVol}[outa]`);
      }
    }

    args.push('-filter_complex', filterParts.join(';'));

    const hasVideoComplex = hasOverlay || videoFilters.length > 0;
    if (hasVideoComplex) args.push('-map', '[outv]');
    else args.push('-map', '0:v');

    if (hasMusic) args.push('-map', '[outa]');
    else args.push('-map', '0:a?');
  } else {
    if (videoFilters.length > 0) args.push('-vf', videoFilters.join(','));
    if (edits.volume !== undefined && edits.volume !== 1) {
      args.push('-af', `volume=${edits.volume}`);
    }
  }

  args.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', 'output.mp4');

  return args;
}
