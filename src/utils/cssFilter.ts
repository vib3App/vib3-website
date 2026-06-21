/**
 * Scale a CSS `filter` string toward its identity by an intensity factor t∈[0,1].
 * Each filter function is interpolated between its no-op value and its preset
 * value, so a filter preset can be dialed from 0% (no effect) to 100% (full).
 *
 * Used for both the live preview (CSS) and the export (the scaled string is fed
 * to cssFilterToFFmpeg), so intensity behaves identically in both.
 */

// No-op value per CSS filter function.
const IDENTITY: Record<string, number> = {
  saturate: 1,
  contrast: 1,
  brightness: 1,
  sepia: 0,
  grayscale: 0,
  invert: 0,
  opacity: 1,
  'hue-rotate': 0,
  blur: 0,
};

export function scaleCssFilter(filter: string, t: number): string {
  if (!filter || filter === 'none') return filter;
  if (t >= 1) return filter;
  const clamped = t < 0 ? 0 : t;
  return filter.replace(/([a-z-]+)\(([-0-9.]+)(deg|px|%)?\)/g, (match, fn: string, numStr: string, unit: string | undefined) => {
    const identity = IDENTITY[fn];
    if (identity === undefined) return match;
    const value = parseFloat(numStr);
    const scaled = identity + (value - identity) * clamped;
    return `${fn}(${Number(scaled.toFixed(4))}${unit ?? ''})`;
  });
}
