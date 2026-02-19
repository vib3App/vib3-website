/**
 * FFmpeg filter chain builders for advanced video edits.
 * Each function returns filter strings to be composed into -filter_complex.
 */
import type {
  TuneSettings,
  CropSettings,
  TransformSettings,
  MaskSettings,
} from './types';

/** Gap 18: Build eq filter for brightness/contrast/saturation/exposure */
export function buildTuneFilter(tune: TuneSettings): string | null {
  const parts: string[] = [];
  // brightness: FFmpeg eq brightness is additive (-1 to 1)
  if (tune.brightness !== 0) parts.push(`brightness=${tune.brightness.toFixed(2)}`);
  // contrast: FFmpeg eq contrast is multiplicative (0.5 to 2)
  if (tune.contrast !== 1) parts.push(`contrast=${tune.contrast.toFixed(2)}`);
  // saturation: FFmpeg eq saturation is multiplicative
  if (tune.saturation !== 1) parts.push(`saturation=${tune.saturation.toFixed(2)}`);
  // exposure: Map to gamma (exposure > 0 = brighter gamma, < 0 = darker)
  if (tune.exposure !== 0) {
    const gamma = Math.pow(2, tune.exposure);
    parts.push(`gamma=${gamma.toFixed(3)}`);
  }
  if (parts.length === 0) return null;
  return `eq=${parts.join(':')}`;
}

/** Gap 19: Build boxblur filter */
export function buildBlurFilter(radius: number): string | null {
  if (radius <= 0) return null;
  // boxblur takes luma_radius:luma_power:chroma_radius:chroma_power
  const r = Math.min(radius, 50);
  return `boxblur=${r}:1`;
}

/** Gap 29: Build crop filter from normalized crop settings */
export function buildCropFilter(
  crop: CropSettings,
  videoWidth: number,
  videoHeight: number,
): string | null {
  if (!crop.aspect && crop.width >= 1 && crop.height >= 1) return null;

  let w: number;
  let h: number;
  let x: number;
  let y: number;

  if (crop.aspect) {
    const [aw, ah] = crop.aspect.split(':').map(Number);
    const aspectRatio = aw / ah;
    const videoAspect = videoWidth / videoHeight;
    if (aspectRatio > videoAspect) {
      // Wider than video: full width, reduce height
      w = videoWidth;
      h = Math.round(videoWidth / aspectRatio);
    } else {
      // Taller than video: full height, reduce width
      h = videoHeight;
      w = Math.round(videoHeight * aspectRatio);
    }
    // Center the crop
    x = Math.round((videoWidth - w) / 2);
    y = Math.round((videoHeight - h) / 2);
  } else {
    // Free crop using normalized coordinates
    w = Math.round(crop.width * videoWidth);
    h = Math.round(crop.height * videoHeight);
    x = Math.round(crop.x * videoWidth);
    y = Math.round(crop.y * videoHeight);
  }

  // Ensure even dimensions for h264
  w = w % 2 === 0 ? w : w - 1;
  h = h % 2 === 0 ? h : h - 1;

  return `crop=${w}:${h}:${x}:${y}`;
}

/** Gap 30: Build transpose/flip filters */
export function buildTransformFilters(transform: TransformSettings): string[] {
  const filters: string[] = [];
  // Rotation: FFmpeg transpose values
  // transpose=1 = 90 CW, transpose=2 = 90 CCW, transpose=0 = 90 CCW + vflip
  if (transform.rotation === 90) {
    filters.push('transpose=1');
  } else if (transform.rotation === 180) {
    filters.push('transpose=1', 'transpose=1');
  } else if (transform.rotation === 270) {
    filters.push('transpose=2');
  }
  if (transform.flipH) filters.push('hflip');
  if (transform.flipV) filters.push('vflip');
  return filters;
}

/** Gap 32: Build opacity filter (applied as colorchannelmixer alpha) */
export function buildOpacityFilter(opacity: number): string | null {
  if (opacity >= 1) return null;
  // Use colorchannelmixer to adjust alpha; for solid backgrounds, use format+colorize
  // Since we output to mp4 (no alpha), we simulate opacity by blending with black
  const a = opacity.toFixed(2);
  return `colorchannelmixer=aa=${a}`;
}

/** Gap 33: Build mask/shape filter using drawbox or geq */
export function buildMaskFilter(
  mask: MaskSettings,
  videoWidth: number,
  videoHeight: number,
): string | null {
  if (!mask.shape) return null;

  const cx = videoWidth / 2;
  const cy = videoHeight / 2;
  const radius = Math.min(videoWidth, videoHeight) * 0.4;
  const feather = mask.feather > 0 ? mask.feather : 1;
  const inv = mask.invert;

  // Use geq (generic equation) filter to create mask shapes
  // This generates a luminance-based alpha that we apply
  switch (mask.shape) {
    case 'circle': {
      // Circle mask: pixels inside radius are visible
      const expr = inv
        ? `if(lte(sqrt((X-${cx})*(X-${cx})+(Y-${cy})*(Y-${cy})),${radius}),0,255)`
        : `if(lte(sqrt((X-${cx})*(X-${cx})+(Y-${cy})*(Y-${cy})),${radius}),255,0)`;
      return `geq=lum='${expr}':cb=128:cr=128,gblur=sigma=${feather}`;
    }
    case 'rectangle': {
      const rw = videoWidth * 0.35;
      const rh = videoHeight * 0.35;
      const expr = inv
        ? `if(between(X,${cx - rw},${cx + rw})*between(Y,${cy - rh},${cy + rh}),0,255)`
        : `if(between(X,${cx - rw},${cx + rw})*between(Y,${cy - rh},${cy + rh}),255,0)`;
      return `geq=lum='${expr}':cb=128:cr=128,gblur=sigma=${feather}`;
    }
    case 'diamond': {
      // Diamond: |x - cx| / rw + |y - cy| / rh <= 1
      const rw = videoWidth * 0.4;
      const rh = videoHeight * 0.4;
      const expr = inv
        ? `if(lte(abs(X-${cx})/${rw}+abs(Y-${cy})/${rh},1),0,255)`
        : `if(lte(abs(X-${cx})/${rw}+abs(Y-${cy})/${rh},1),255,0)`;
      return `geq=lum='${expr}':cb=128:cr=128,gblur=sigma=${feather}`;
    }
    default:
      // For complex shapes (heart, star, etc.), fall back to a simple vignette
      return inv ? 'vignette=PI/2,negate' : 'vignette=PI/4';
  }
}

/** Gap 35: Build setpts/atempo for speed changes */
export function buildSpeedFilter(speed: number): {
  video: string;
  audio: string;
} {
  const pts = (1 / speed).toFixed(4);
  const videoFilter = `setpts=${pts}*PTS`;

  // atempo only supports 0.5-2.0 range, chain for extremes
  const audioFilters: string[] = [];
  let remaining = speed;
  while (remaining > 2) {
    audioFilters.push('atempo=2.0');
    remaining /= 2;
  }
  while (remaining < 0.5) {
    audioFilters.push('atempo=0.5');
    remaining *= 2;
  }
  if (Math.abs(remaining - 1) > 0.001) {
    audioFilters.push(`atempo=${remaining.toFixed(4)}`);
  }

  return {
    video: videoFilter,
    audio: audioFilters.length > 0 ? audioFilters.join(',') : '',
  };
}
