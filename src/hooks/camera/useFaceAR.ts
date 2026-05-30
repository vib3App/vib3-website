'use client';

import { useEffect, useRef, useState } from 'react';
import { logger } from '@/utils/logger';

export type FaceFx = 'off' | 'zoom' | 'mask' | 'crown' | 'animal';

interface UseFaceARProps {
  sourceStream: MediaStream | null;
  effect: FaceFx;
  cameraFacing: 'user' | 'environment';
}

const EFFECT_EMOJI: Record<FaceFx, string | null> = {
  off: null,
  zoom: null,
  mask: '🐱',
  crown: '👑',
  animal: '🐶',
};

interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

function detectorAvailable(): boolean {
  return typeof globalThis !== 'undefined' && 'FaceDetector' in globalThis;
}

/**
 * Real-time face-driven camera effect built on the native FaceDetector API.
 * Falls back to a no-op MediaStream when the browser lacks the API so we
 * don't break the camera path on Safari/Firefox.
 *
 * The detector runs every ~150ms (not every frame) to keep the per-frame
 * draw loop cheap. The latest detected bounding box drives whichever
 * effect the user picked:
 *   - 'zoom': pan+scale around the face
 *   - 'mask' / 'crown' / 'animal': draw an emoji sized/positioned over the face
 *
 * Returns null while disabled or while waiting on the first detection.
 */
export function useFaceAR({ sourceStream, effect, cameraFacing }: UseFaceARProps): MediaStream | null {
  const [output, setOutput] = useState<MediaStream | null>(null);
  const animRef = useRef<number | null>(null);
  const detectRef = useRef<number | null>(null);
  const lastFaceRef = useRef<FaceBox | null>(null);

  useEffect(() => {
    if (effect === 'off' || !sourceStream || typeof document === 'undefined') return;
    if (!detectorAvailable()) {
      logger.error('FaceDetector API not available; face effects disabled');
      return;
    }
    let cancelled = false;

    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.srcObject = sourceStream;
    const canvas = document.createElement('canvas');

    const detector = new FaceDetector({ maxDetectedFaces: 1, fastMode: true });

    const detectLoop = async () => {
      if (cancelled) return;
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        try {
          const faces = await detector.detect(video);
          if (faces.length > 0) {
            const b = faces[0].boundingBox;
            lastFaceRef.current = { x: b.x, y: b.y, width: b.width, height: b.height };
          }
        } catch {
          // FaceDetector throws if video is not ready; just skip this tick.
        }
      }
      detectRef.current = window.setTimeout(detectLoop, 150);
    };

    const render = () => {
      if (cancelled) return;
      animRef.current = requestAnimationFrame(render);
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (w === 0 || h === 0) return;
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const face = lastFaceRef.current;
      const isFront = cameraFacing === 'user';

      // Optionally apply zoom-to-face by adjusting the source rect.
      if (effect === 'zoom' && face) {
        // Make the zoom rectangle 2.4x the face box, clamped to frame.
        const cx = face.x + face.width / 2;
        const cy = face.y + face.height / 2;
        const zoomScale = 2.4;
        const zoomW = Math.min(w, face.width * zoomScale);
        const zoomH = Math.min(h, face.height * zoomScale);
        const sx = Math.max(0, Math.min(w - zoomW, cx - zoomW / 2));
        const sy = Math.max(0, Math.min(h - zoomH, cy - zoomH / 2));
        ctx.save();
        if (isFront) {
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, sx, sy, zoomW, zoomH, 0, 0, w, h);
        ctx.restore();
      } else {
        ctx.save();
        if (isFront) {
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, w, h);
        ctx.restore();
      }

      // Draw the emoji overlay on top of the face for mask/crown/animal.
      const emoji = EFFECT_EMOJI[effect];
      if (emoji && face) {
        // Mirror the face X for front camera so it follows the displayed image.
        const faceCx = isFront ? w - (face.x + face.width / 2) : face.x + face.width / 2;
        const faceY = face.y;
        const size = face.width * 1.2;
        ctx.save();
        ctx.font = `${size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = effect === 'crown' ? 'bottom' : 'middle';
        const drawY = effect === 'crown' ? faceY + size * 0.1 : faceY + face.height / 2;
        ctx.fillText(emoji, faceCx, drawY);
        ctx.restore();
      }
    };

    (async () => {
      try {
        await video.play();
        if (cancelled) return;
        animRef.current = requestAnimationFrame(render);
        detectRef.current = window.setTimeout(detectLoop, 100);
        const stream = canvas.captureStream(30);
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        setOutput(stream);
      } catch (err) {
        logger.error('useFaceAR start failed:', err);
        if (!cancelled) setOutput(null);
      }
    })();

    return () => {
      cancelled = true;
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
      if (detectRef.current !== null) window.clearTimeout(detectRef.current);
      animRef.current = null;
      detectRef.current = null;
      lastFaceRef.current = null;
      try { video.pause(); } catch { /* ignore */ }
      video.srcObject = null;
      setOutput(prev => {
        prev?.getTracks().forEach(t => t.stop());
        return null;
      });
    };
  }, [effect, sourceStream, cameraFacing]);

  return output;
}
