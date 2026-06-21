/**
 * Tone-curve math shared by the curve editor UI, the live SVG preview, and the
 * FFmpeg export — so all three agree on exactly what a curve does.
 *
 * A channel curve is a list of control points in [0,1]×[0,1] (input→output),
 * sorted by x, evaluated as a piecewise-linear function. The master ('rgb')
 * curve is applied first, then each per-channel (r/g/b) curve on top:
 *   effective_c(x) = curve_c( curve_rgb(x) )
 */

import type { CurveSettings, CurvePoint } from '@/services/videoProcessor';

export type Channel = 'rgb' | 'r' | 'g' | 'b';

const IDENTITY: CurvePoint[] = [{ x: 0, y: 0 }, { x: 1, y: 1 }];

export function identityCurves(): CurveSettings {
  return {
    rgb: IDENTITY.map(p => ({ ...p })),
    r: IDENTITY.map(p => ({ ...p })),
    g: IDENTITY.map(p => ({ ...p })),
    b: IDENTITY.map(p => ({ ...p })),
  };
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Piecewise-linear evaluation of a sorted control-point list at input x∈[0,1]. */
export function evalCurve(points: CurvePoint[], x: number): number {
  if (points.length === 0) return x;
  if (x <= points[0].x) return clamp01(points[0].y);
  for (let i = 1; i < points.length; i++) {
    if (x <= points[i].x) {
      const a = points[i - 1];
      const b = points[i];
      const span = b.x - a.x;
      const t = span <= 1e-6 ? 0 : (x - a.x) / span;
      return clamp01(a.y + t * (b.y - a.y));
    }
  }
  return clamp01(points[points.length - 1].y);
}

export function isIdentityCurve(points: CurvePoint[]): boolean {
  return points.length === 2
    && Math.abs(points[0].x) < 1e-4 && Math.abs(points[0].y) < 1e-4
    && Math.abs(points[1].x - 1) < 1e-4 && Math.abs(points[1].y - 1) < 1e-4;
}

export function isIdentityCurves(c: CurveSettings | undefined): boolean {
  if (!c) return true;
  return isIdentityCurve(c.rgb) && isIdentityCurve(c.r) && isIdentityCurve(c.g) && isIdentityCurve(c.b);
}

/** Effective output for a channel at input x: per-channel applied over master. */
export function effectiveAt(c: CurveSettings, channel: 'r' | 'g' | 'b', x: number): number {
  return evalCurve(c[channel], evalCurve(c.rgb, x));
}

/**
 * Sample a channel's effective curve into (n+1) values for an SVG
 * feFunc* tableValues attribute (space-separated outputs at evenly spaced x).
 */
export function tableValues(c: CurveSettings, channel: 'r' | 'g' | 'b', n = 32): string {
  const out: string[] = [];
  for (let i = 0; i <= n; i++) out.push(effectiveAt(c, channel, i / n).toFixed(4));
  return out.join(' ');
}

/** Format control points as an FFmpeg curves point string: "x/y x/y ...". */
export function ffmpegPoints(points: CurvePoint[]): string {
  return points.map(p => `${clamp01(p.x).toFixed(3)}/${clamp01(p.y).toFixed(3)}`).join(' ');
}
