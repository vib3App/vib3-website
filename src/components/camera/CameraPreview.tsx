'use client';

import { useEffect, useRef } from 'react';
import { CAMERA_FILTERS } from '@/hooks/useCamera';

interface CameraPreviewProps {
  isPreview: boolean;
  previewUrl: string | null;
  previewVideoRef: React.RefObject<HTMLVideoElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  effectsCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  cameraKitCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  selectedFilter: number;
  cameraFacing: 'user' | 'environment';
  isCameraKitActive: boolean;
  greenScreenEnabled: boolean;
  greenScreenStream: MediaStream | null;
  faceArStream: MediaStream | null;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

/**
 * The camera viewfinder: the recorded-preview video, or the live stack of
 * raw camera / green-screen / face-AR / effects-canvas / Camera-Kit layers.
 * Owns the green-screen and face-AR <video> elements and binds their streams.
 * Only one layer is visible at a time; the live camera is hidden only when an
 * effect actually produced a stream, so the viewfinder never blanks.
 */
export function CameraPreview({
  isPreview, previewUrl, previewVideoRef, videoRef, effectsCanvasRef, cameraKitCanvasRef,
  selectedFilter, cameraFacing, isCameraKitActive, greenScreenEnabled,
  greenScreenStream, faceArStream, onTouchStart, onTouchMove, onTouchEnd,
}: CameraPreviewProps) {
  const greenScreenVideoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const el = greenScreenVideoRef.current;
    if (!el) return;
    if (greenScreenStream) {
      el.srcObject = greenScreenStream;
      el.play().catch(() => {});
    } else {
      el.srcObject = null;
    }
  }, [greenScreenStream]);

  const faceArVideoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const el = faceArVideoRef.current;
    if (!el) return;
    if (faceArStream) {
      el.srcObject = faceArStream;
      el.play().catch(() => {});
    } else {
      el.srcObject = null;
    }
  }, [faceArStream]);

  // The AR effect is only actually *showing* when it produced a real stream.
  // Keying the live-camera hide on this (not just "an effect is selected")
  // means an unsupported browser keeps the normal camera instead of blanking.
  const faceArShowing = !!faceArStream && !greenScreenEnabled;

  return (
    <div className="absolute inset-0" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {isPreview && previewUrl ? (
        <video
          ref={previewVideoRef}
          src={previewUrl}
          className="w-full h-full object-cover"
          style={{ filter: CAMERA_FILTERS[selectedFilter].filter }}
          autoPlay loop playsInline muted
        />
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{
              filter: CAMERA_FILTERS[selectedFilter].filter,
              transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none',
              display: (isCameraKitActive || greenScreenEnabled || faceArShowing) ? 'none' : undefined,
            }}
            autoPlay playsInline muted
          />
          <video
            ref={greenScreenVideoRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none',
              display: greenScreenEnabled ? undefined : 'none',
            }}
            autoPlay playsInline muted
          />
          <video
            ref={faceArVideoRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ display: faceArShowing ? undefined : 'none' }}
            autoPlay playsInline muted
          />
          {!isCameraKitActive && !greenScreenEnabled && !faceArShowing && (
            <canvas ref={effectsCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
          )}
          <canvas
            ref={cameraKitCanvasRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ display: isCameraKitActive ? undefined : 'none' }}
          />
        </>
      )}
    </div>
  );
}
