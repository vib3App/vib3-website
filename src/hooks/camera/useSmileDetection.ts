'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Lightweight smile detection using canvas-based mouth aspect ratio analysis.
 * Uses a simple heuristic approach with the built-in Canvas API to detect
 * face brightness patterns as a proxy for smile detection, avoiding heavy
 * TensorFlow.js dependencies.
 *
 * When a smile is detected (sustained for SMILE_HOLD_MS), triggers the callback.
 * When the smile stops (sustained for SMILE_RELEASE_MS), triggers stop callback.
 */

const DETECTION_INTERVAL_MS = 200;
const SMILE_HOLD_MS = 800;     // Must smile for 800ms to trigger
const SMILE_RELEASE_MS = 1200; // Must stop smiling for 1.2s to stop
const BRIGHTNESS_THRESHOLD = 0.15; // Relative brightness diff for smile

interface SmileDetectionConfig {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onSmileStart: () => void;
  onSmileEnd: () => void;
  enabled: boolean;
}

interface SmileState {
  detecting: boolean;
  smiling: boolean;
  confidence: number;
}

export function useSmileDetection({
  videoRef, onSmileStart, onSmileEnd, enabled,
}: SmileDetectionConfig) {
  const [state, setState] = useState<SmileState>({
    detecting: false,
    smiling: false,
    confidence: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const smileStartRef = useRef<number | null>(null);
  const noSmileStartRef = useRef<number | null>(null);
  const isSmileActiveRef = useRef(false);
  const callbacksRef = useRef({ onSmileStart, onSmileEnd });

  useEffect(() => {
    callbacksRef.current = { onSmileStart, onSmileEnd };
  }, [onSmileStart, onSmileEnd]);

  const analyzeMouthRegion = useCallback((video: HTMLVideoElement): number => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    const w = 120;
    const h = 160;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return 0;

    ctx.drawImage(video, 0, 0, w, h);

    // Sample lower face region (mouth area approx 40-80% height, 25-75% width)
    const mouthData = ctx.getImageData(
      Math.floor(w * 0.25), Math.floor(h * 0.55),
      Math.floor(w * 0.5), Math.floor(h * 0.25),
    );

    // Sample upper face region (forehead area) as baseline
    const foreheadData = ctx.getImageData(
      Math.floor(w * 0.25), Math.floor(h * 0.1),
      Math.floor(w * 0.5), Math.floor(h * 0.15),
    );

    const avgBrightness = (data: ImageData) => {
      let sum = 0;
      for (let i = 0; i < data.data.length; i += 4) {
        sum += (data.data[i] + data.data[i + 1] + data.data[i + 2]) / 3;
      }
      return sum / (data.data.length / 4);
    };

    // Check horizontal spread of brightness in mouth region (smiles are wider)
    const mouthLeft = ctx.getImageData(
      Math.floor(w * 0.15), Math.floor(h * 0.6),
      Math.floor(w * 0.2), Math.floor(h * 0.15),
    );
    const mouthCenter = ctx.getImageData(
      Math.floor(w * 0.35), Math.floor(h * 0.6),
      Math.floor(w * 0.3), Math.floor(h * 0.15),
    );
    const mouthRight = ctx.getImageData(
      Math.floor(w * 0.65), Math.floor(h * 0.6),
      Math.floor(w * 0.2), Math.floor(h * 0.15),
    );

    const mouthAvg = avgBrightness(mouthData);
    const foreheadAvg = avgBrightness(foreheadData);
    const leftAvg = avgBrightness(mouthLeft);
    const centerAvg = avgBrightness(mouthCenter);
    const rightAvg = avgBrightness(mouthRight);

    // Smiles create brightness differences: mouth darker in center (teeth contrast)
    // and brighter at corners (cheek lift)
    const baseDiff = Math.abs(mouthAvg - foreheadAvg) / Math.max(foreheadAvg, 1);
    const cornerBrightness = (leftAvg + rightAvg) / 2;
    const spreadRatio = cornerBrightness / Math.max(centerAvg, 1);

    // Combined confidence: difference from baseline + corner spread
    const confidence = Math.min(1, (baseDiff + Math.max(0, spreadRatio - 0.9)) / 2);
    return confidence;
  }, []);

  const startDetection = useCallback(() => {
    if (intervalRef.current) return;

    setState(s => ({ ...s, detecting: true }));

    intervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const confidence = analyzeMouthRegion(video);
      const isSmiling = confidence > BRIGHTNESS_THRESHOLD;
      const now = Date.now();

      if (isSmiling) {
        noSmileStartRef.current = null;

        if (!smileStartRef.current) {
          smileStartRef.current = now;
        }

        if (!isSmileActiveRef.current && now - smileStartRef.current >= SMILE_HOLD_MS) {
          isSmileActiveRef.current = true;
          callbacksRef.current.onSmileStart();
        }
      } else {
        smileStartRef.current = null;

        if (isSmileActiveRef.current) {
          if (!noSmileStartRef.current) {
            noSmileStartRef.current = now;
          }
          if (now - noSmileStartRef.current >= SMILE_RELEASE_MS) {
            isSmileActiveRef.current = false;
            callbacksRef.current.onSmileEnd();
          }
        }
      }

      setState({
        detecting: true,
        smiling: isSmileActiveRef.current,
        confidence,
      });
    }, DETECTION_INTERVAL_MS);
  }, [videoRef, analyzeMouthRegion]);

  const stopDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    smileStartRef.current = null;
    noSmileStartRef.current = null;
    isSmileActiveRef.current = false;
    setState({ detecting: false, smiling: false, confidence: 0 });
  }, []);

  // Auto start/stop based on enabled flag
  useEffect(() => {
    if (enabled) {
      startDetection();
    } else {
      stopDetection();
    }
    return () => stopDetection();
  }, [enabled, startDetection, stopDetection]);

  return {
    detecting: state.detecting,
    smiling: state.smiling,
    confidence: state.confidence,
    startDetection,
    stopDetection,
  };
}
