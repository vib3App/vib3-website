import type { VideoEdits, TextOverlay, StickerOverlay } from './types';
import {
  buildTuneFilter,
  buildBlurFilter,
  buildCropFilter,
  buildTransformFilters,
  buildOpacityFilter,
  buildMaskFilter,
  buildSpeedFilter,
} from './filterBuilders';
import { buildVoiceEffectFilter } from '@/services/audioProcessing/voiceEffects';

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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img') as HTMLImageElement;
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function renderOverlaysToImage(
  texts: TextOverlay[],
  stickers: StickerOverlay[],
  videoWidth: number,
  videoHeight: number,
  displayHeight?: number,
  drawingDataUrl?: string,
): Promise<Uint8Array | null> {
  if (texts.length === 0 && stickers.length === 0 && !drawingDataUrl) return null;

  const canvas = document.createElement('canvas');
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Gap 23: Draw drawing canvas overlay first (behind texts/stickers)
  if (drawingDataUrl) {
    try {
      const img = await loadImage(drawingDataUrl);
      ctx.drawImage(img, 0, 0, videoWidth, videoHeight);
    } catch {
      // Drawing image failed to load, continue with texts/stickers
    }
  }

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

/** Collect all video filter strings from edits */
function collectVideoFilters(edits: VideoEdits): string[] {
  const videoFilters: string[] = [];

  // CSS filter preset (existing)
  if (edits.filter && edits.filter !== 'none') {
    const ffmpegFilter = cssFilterToFFmpeg(edits.filter);
    if (ffmpegFilter) videoFilters.push(ffmpegFilter);
  }

  // Gap 18: Tune (brightness, contrast, saturation, exposure)
  if (edits.tune) {
    const tuneFilter = buildTuneFilter(edits.tune);
    if (tuneFilter) videoFilters.push(tuneFilter);
  }

  // Gap 19: Blur
  if (edits.blur && edits.blur > 0) {
    const blurFilter = buildBlurFilter(edits.blur);
    if (blurFilter) videoFilters.push(blurFilter);
  }

  // Gap 29: Crop
  if (edits.crop && edits.videoWidth && edits.videoHeight) {
    const cropFilter = buildCropFilter(edits.crop, edits.videoWidth, edits.videoHeight);
    if (cropFilter) videoFilters.push(cropFilter);
  }

  // Gap 30: Transform (rotation, flip)
  if (edits.transform) {
    const transformFilters = buildTransformFilters(edits.transform);
    videoFilters.push(...transformFilters);
  }

  // Gap 32: Opacity
  if (edits.opacity !== undefined && edits.opacity < 1) {
    const opacityFilter = buildOpacityFilter(edits.opacity);
    if (opacityFilter) videoFilters.push(opacityFilter);
  }

  // Gap 33: Mask shapes
  if (edits.mask && edits.mask.shape && edits.videoWidth && edits.videoHeight) {
    const maskFilter = buildMaskFilter(edits.mask, edits.videoWidth, edits.videoHeight);
    if (maskFilter) videoFilters.push(maskFilter);
  }

  // Gap 25: Stabilization via deshake filter
  if (edits.stabilization?.enabled) {
    const rx = edits.stabilization.strength * 16;
    const ry = edits.stabilization.strength * 16;
    videoFilters.push(`deshake=rx=${rx}:ry=${ry}`);
  }

  // Gap 27: Green screen chroma key
  if (edits.greenScreen?.enabled) {
    const hex = edits.greenScreen.color.replace('#', '');
    const similarity = Math.round((edits.greenScreen.sensitivity / 100) * 0.3 * 100) / 100 + 0.1;
    videoFilters.push(`colorkey=0x${hex}:${similarity}:0.05`);
  }

  // Gap 26: Cutout via colorkey mode
  if (edits.cutout && edits.cutout.mode === 'colorkey') {
    const hex = edits.cutout.color.replace('#', '');
    const similarity = Math.round((edits.cutout.sensitivity / 100) * 0.3 * 100) / 100 + 0.1;
    videoFilters.push(`colorkey=0x${hex}:${similarity}:0.05`);
  }

  // Gap 11: Speed ramp via setpts (averaged speed for FFmpeg)
  if (edits.speedRamp && edits.speedRamp.length >= 2) {
    const avgSpeed = edits.speedRamp.reduce((sum, kf) => sum + kf.speed, 0) / edits.speedRamp.length;
    if (Math.abs(avgSpeed - 1) > 0.01) {
      videoFilters.push(`setpts=${(1 / avgSpeed).toFixed(4)}*PTS`);
    }
  }

  return videoFilters;
}

/** Collect audio filter strings from edits (voice effects, volume) */
function collectAudioFilters(edits: VideoEdits): string[] {
  const audioFilters: string[] = [];

  // Gap #19: Voice effect
  if (edits.voiceEffect) {
    const vfx = buildVoiceEffectFilter(edits.voiceEffect);
    if (vfx) audioFilters.push(vfx);
  }

  // Volume adjustment (when no music mixing)
  if (edits.volume !== undefined && edits.volume !== 1) {
    audioFilters.push(`volume=${edits.volume}`);
  }

  return audioFilters;
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

  const videoFilters = collectVideoFilters(edits);
  const audioFilters = collectAudioFilters(edits);

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

    // Audio chain
    if (hasMusic) {
      const origVol = edits.volume !== undefined ? edits.volume : 1;
      const musVol = edits.musicVolume !== undefined ? edits.musicVolume : 0.5;
      const voiceFx = edits.voiceEffect ? buildVoiceEffectFilter(edits.voiceEffect) : null;

      if (origVol > 0) {
        const origChain = voiceFx ? `volume=${origVol},${voiceFx}` : `volume=${origVol}`;
        filterParts.push(`[0:a]${origChain}[a0]`);
        filterParts.push(`[${musicIdx}:a]volume=${musVol}[a1]`);
        filterParts.push(`[a0][a1]amix=inputs=2:duration=first[outa]`);
      } else {
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
    if (audioFilters.length > 0) {
      args.push('-af', audioFilters.join(','));
    }
  }

  args.push(
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
    '-c:a', 'aac', '-b:a', '128k',
    '-movflags', '+faststart',
    'output.mp4',
  );

  return args;
}

/** Gap 31: Build FFmpeg args for transition between two clips using xfade */
export function buildTransitionArgs(
  transitionType: string,
  transitionDuration: number,
  clip1Duration: number,
): string[] {
  // Map our transition names to FFmpeg xfade transition names
  const xfadeMap: Record<string, string> = {
    'crossfade': 'fade',
    'fade': 'fade',
    'fade-black': 'fadeblack',
    'slide-left': 'slideleft',
    'slide-right': 'slideright',
    'slide-up': 'slideup',
    'slide-down': 'slidedown',
    'zoom-in': 'circlecrop',
    'zoom-out': 'squeezev',
    'dissolve': 'dissolve',
    'wipe': 'wipeleft',
    'spin': 'circleopen',
    'glitch': 'pixelize',
    'flash': 'fadewhite',
  };

  const xfadeName = xfadeMap[transitionType] || 'fade';
  const offset = Math.max(0, clip1Duration - transitionDuration);

  return [
    '-filter_complex',
    `[0:v][1:v]xfade=transition=${xfadeName}:duration=${transitionDuration}:offset=${offset}[outv];[0:a][1:a]acrossfade=d=${transitionDuration}[outa]`,
    '-map', '[outv]',
    '-map', '[outa]',
  ];
}

/** Gap 35: Build FFmpeg args for per-clip speed changes */
export function buildClipSpeedArgs(speed: number): string[] {
  const { video, audio } = buildSpeedFilter(speed);
  const filters: string[] = ['-filter:v', video];
  if (audio) filters.push('-filter:a', audio);
  else filters.push('-an');
  return filters;
}
