'use client';

import { useEffect, useRef, useState } from 'react';
import { logger } from '@/utils/logger';
import { FaceLandmarker, FilesetResolver, type FaceLandmarkerResult } from '@mediapipe/tasks-vision';

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

// MediaPipe WASM + model load from CDN, mirroring how the editor loads the
// FFmpeg core. Pin the WASM to the installed package version.
const MP_VERSION = '0.10.35';
const WASM_PATH = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`;
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

// One FaceLandmarker shared across mounts — creation downloads the model and is
// expensive, so cache the promise and reuse the instance.
let landmarkerPromise: Promise<FaceLandmarker> | null = null;

function getLandmarker(): Promise<FaceLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);
      const make = (delegate: 'GPU' | 'CPU') => FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate },
        runningMode: 'VIDEO',
        numFaces: 1,
      });
      try {
        return await make('GPU');
      } catch {
        // Some browsers/headless environments lack a usable GPU delegate.
        return await make('CPU');
      }
    })().catch((err) => {
      landmarkerPromise = null; // allow a later retry
      throw err;
    });
  }
  return landmarkerPromise;
}

/**
 * Whether real-time face AR can run in this browser. The implementation uses
 * MediaPipe FaceLandmarker, which needs WebAssembly — available in every modern
 * browser (unlike the old Shape Detection `FaceDetector` API this replaced).
 * The model still loads asynchronously; until it's ready the camera passes
 * through unmodified, and if the load fails the picker is a graceful no-op
 * (never a blank viewfinder).
 */
export function isFaceArSupported(): boolean {
  return typeof WebAssembly !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Real-time face-driven camera effect powered by MediaPipe FaceLandmarker.
 *
 * The render loop draws the camera into a canvas and, once the model is loaded,
 * runs detection each frame to track the face. The latest face box drives the
 * selected effect:
 *   - 'zoom': pan+scale around the face
 *   - 'mask' / 'crown' / 'animal': draw an emoji sized/positioned over the face
 *
 * Returns the composited MediaStream (consumed by preview + recorder), or null
 * while disabled / before the camera is playing.
 */
export function useFaceAR({ sourceStream, effect, cameraFacing }: UseFaceARProps): MediaStream | null {
  const [output, setOutput] = useState<MediaStream | null>(null);
  const animRef = useRef<number | null>(null);
  const lastFaceRef = useRef<FaceBox | null>(null);

  useEffect(() => {
    if (effect === 'off' || !sourceStream || typeof document === 'undefined') return;
    let cancelled = false;
    let landmarker: FaceLandmarker | null = null;
    let lastTs = -1;

    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.srcObject = sourceStream;
    const canvas = document.createElement('canvas');

    const computeBox = (res: FaceLandmarkerResult, w: number, h: number): FaceBox | null => {
      const lms = res.faceLandmarks?.[0];
      if (!lms || lms.length === 0) return null;
      let minX = 1, minY = 1, maxX = 0, maxY = 0;
      for (const p of lms) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }
      return { x: minX * w, y: minY * h, width: (maxX - minX) * w, height: (maxY - minY) * h };
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

      // Detect once the model is ready. VIDEO mode requires strictly increasing
      // timestamps; performance.now() is monotonic across sessions.
      if (landmarker) {
        const ts = performance.now();
        if (ts > lastTs) {
          lastTs = ts;
          try {
            const box = computeBox(landmarker.detectForVideo(video, ts), w, h);
            if (box) lastFaceRef.current = box;
          } catch {
            // Video frame not ready for this tick; skip.
          }
        }
      }

      const face = lastFaceRef.current;
      const isFront = cameraFacing === 'user';

      if (effect === 'zoom' && face) {
        // Zoom rectangle 2.4x the face box, clamped to frame.
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

      // Emoji overlay for mask/crown/animal, tracking the face.
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
        const stream = canvas.captureStream(30);
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        setOutput(stream);
        // Load the model in the background; the canvas passes the camera
        // through until it's ready, so the viewfinder is never blank.
        getLandmarker()
          .then(lm => { if (!cancelled) landmarker = lm; })
          .catch(err => logger.error('FaceLandmarker load failed; face effect is a no-op:', err));
      } catch (err) {
        logger.error('useFaceAR start failed:', err);
        if (!cancelled) setOutput(null);
      }
    })();

    return () => {
      cancelled = true;
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
      animRef.current = null;
      lastFaceRef.current = null;
      // Note: the shared FaceLandmarker is intentionally NOT closed — it's cached
      // for reuse across effect toggles.
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
