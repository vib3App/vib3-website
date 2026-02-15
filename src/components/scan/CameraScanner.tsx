'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { CameraIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { parseQRData, type ScanResult } from './scanUtils';

interface CameraScannerProps {
  onScanResult: (result: ScanResult) => void;
  isActive: boolean;
}

export function CameraScanner({ onScanResult, isActive }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stopScanning = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const scanQRCode = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(scanQRCode);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new BarcodeDetector({ formats: ['qr_code'] });
        const barcodes = await barcodeDetector.detect(canvas);

        if (barcodes.length > 0) {
          const result = parseQRData(barcodes[0].rawValue);
          onScanResult(result);
          stopScanning();
          return;
        }
      }
    } catch {
      console.log('BarcodeDetector not available');
    }

    animationRef.current = requestAnimationFrame(scanQRCode);
  }, [onScanResult, stopScanning]);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);
        scanQRCode();
      }
    } catch {
      setHasCamera(false);
      setError('Camera access denied. Please enable camera permissions.');
    }
  }, [scanQRCode]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      try {
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new BarcodeDetector({ formats: ['qr_code'] });
          const barcodes = await barcodeDetector.detect(canvas);

          if (barcodes.length > 0) {
            onScanResult(parseQRData(barcodes[0].rawValue));
          } else {
            setError('No QR code found in image');
          }
        } else {
          setError('QR scanning not supported in this browser');
        }
      } catch {
        setError('Failed to scan image');
      }
    };
    img.src = URL.createObjectURL(file);
  };

  useEffect(() => {
    if (isActive) {
      startScanning();
    }
    return () => stopScanning();
  }, [isActive, startScanning, stopScanning]);

  return (
    <div className="space-y-6">
      <div className="relative aspect-square rounded-2xl overflow-hidden glass-card">
        {hasCamera ? (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-purple-400 rounded-2xl relative">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-lg" />

                {isScanning && (
                  <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-pulse"
                       style={{ animation: 'scan 2s ease-in-out infinite' }} />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8">
            <CameraIcon className="w-16 h-16 text-white/30 mb-4" />
            <p className="text-white/70 text-center">Camera not available</p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/20 text-red-300 text-sm text-center">{error}</div>
      )}

      <p className="text-white/60 text-sm text-center">Point your camera at a QR code to scan</p>

      <label className="block">
        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        <div className="w-full py-3 glass text-white rounded-xl font-medium text-center cursor-pointer hover:bg-white/10 transition">
          <PhotoIcon className="w-5 h-5 inline mr-2" />
          Upload from Gallery
        </div>
      </label>
    </div>
  );
}
