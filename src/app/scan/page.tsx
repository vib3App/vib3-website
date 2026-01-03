'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { XMarkIcon, QrCodeIcon, CameraIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';

// QR Code scanner using browser APIs
interface ScanResult {
  type: 'user' | 'video' | 'link' | 'unknown';
  value: string;
  rawData: string;
}

function parseQRData(data: string): ScanResult {
  // Check for VIB3 user profile links
  const userMatch = data.match(/(?:vib3\.app|localhost:\d+)\/profile\/([a-zA-Z0-9_-]+)/);
  if (userMatch) {
    return { type: 'user', value: userMatch[1], rawData: data };
  }

  // Check for VIB3 video links
  const videoMatch = data.match(/(?:vib3\.app|localhost:\d+)\/video\/([a-zA-Z0-9_-]+)/);
  if (videoMatch) {
    return { type: 'video', value: videoMatch[1], rawData: data };
  }

  // Check for generic URLs
  if (data.startsWith('http://') || data.startsWith('https://')) {
    return { type: 'link', value: data, rawData: data };
  }

  // Unknown QR data - might be a username
  if (/^[a-zA-Z0-9_]+$/.test(data)) {
    return { type: 'user', value: data, rawData: data };
  }

  return { type: 'unknown', value: data, rawData: data };
}

export default function QRScannerPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified, user } = useAuthStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMyCode, setShowMyCode] = useState(false);

  // Start camera and scanning
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
    } catch (err) {
      console.error('Camera access error:', err);
      setHasCamera(false);
      setError('Camera access denied. Please enable camera permissions.');
    }
  }, []);

  // Stop camera
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

  // Scan for QR codes using BarcodeDetector API
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
      // Check if BarcodeDetector is available
      if ('BarcodeDetector' in window) {
        // @ts-expect-error BarcodeDetector is not yet in TypeScript types
        const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const barcodes = await barcodeDetector.detect(canvas);

        if (barcodes.length > 0) {
          const result = parseQRData(barcodes[0].rawValue);
          setScanResult(result);
          stopScanning();
          return;
        }
      }
    } catch {
      // BarcodeDetector not supported or failed
      console.log('BarcodeDetector not available');
    }

    animationRef.current = requestAnimationFrame(scanQRCode);
  }, [stopScanning]);

  // Handle scan result actions
  const handleResultAction = () => {
    if (!scanResult) return;

    switch (scanResult.type) {
      case 'user':
        router.push(`/profile/${scanResult.value}`);
        break;
      case 'video':
        router.push(`/video/${scanResult.value}`);
        break;
      case 'link':
        window.open(scanResult.value, '_blank');
        break;
      default:
        // Copy to clipboard
        navigator.clipboard.writeText(scanResult.rawData);
    }
  };

  // Handle file upload for QR scanning
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
          // @ts-expect-error BarcodeDetector is not yet in TypeScript types
          const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
          const barcodes = await barcodeDetector.detect(canvas);

          if (barcodes.length > 0) {
            const result = parseQRData(barcodes[0].rawValue);
            setScanResult(result);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  // Auto-start scanning when authenticated
  useEffect(() => {
    if (isAuthVerified && isAuthenticated && !showMyCode) {
      startScanning();
    }
    return () => stopScanning();
  }, [isAuthVerified, isAuthenticated, showMyCode, startScanning, stopScanning]);

  if (!isAuthVerified) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login?redirect=/scan');
    return null;
  }

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />

      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-heavy rounded-b-2xl border-b border-white/10 mx-4 mb-6">
          <div className="flex items-center justify-between px-4 h-14">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition">
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-lg font-semibold text-white">QR Scanner</h1>
            <div className="w-9" /> {/* Spacer */}
          </div>
        </header>

        <div className="max-w-md mx-auto px-4">
          {/* Tab Switch */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setShowMyCode(false);
                setScanResult(null);
              }}
              className={`flex-1 py-3 rounded-xl font-medium transition ${
                !showMyCode
                  ? 'bg-gradient-to-r from-purple-500 to-teal-400 text-white'
                  : 'glass text-white/70 hover:text-white'
              }`}
            >
              <CameraIcon className="w-5 h-5 inline mr-2" />
              Scan
            </button>
            <button
              onClick={() => {
                setShowMyCode(true);
                stopScanning();
                setScanResult(null);
              }}
              className={`flex-1 py-3 rounded-xl font-medium transition ${
                showMyCode
                  ? 'bg-gradient-to-r from-purple-500 to-teal-400 text-white'
                  : 'glass text-white/70 hover:text-white'
              }`}
            >
              <QrCodeIcon className="w-5 h-5 inline mr-2" />
              My Code
            </button>
          </div>

          {showMyCode ? (
            /* My QR Code Display */
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="w-48 h-48 mx-auto mb-6 bg-white rounded-2xl p-4 flex items-center justify-center">
                {/* Simple QR code placeholder - in production, generate actual QR */}
                <div className="text-center">
                  <QrCodeIcon className="w-32 h-32 text-gray-800" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                @{user?.username || 'user'}
              </h2>
              <p className="text-white/60 text-sm mb-6">
                Scan this code to follow me on VIB3
              </p>
              <p className="text-white/40 text-xs">
                {typeof window !== 'undefined'
                  ? `${window.location.origin}/profile/${user?.username || user?.id}`
                  : ''
                }
              </p>
            </div>
          ) : scanResult ? (
            /* Scan Result Display */
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-teal-400 flex items-center justify-center">
                <QrCodeIcon className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-lg font-semibold text-white mb-2">
                {scanResult.type === 'user' && 'User Found'}
                {scanResult.type === 'video' && 'Video Found'}
                {scanResult.type === 'link' && 'Link Found'}
                {scanResult.type === 'unknown' && 'QR Code Scanned'}
              </h2>

              <p className="text-white/70 mb-6 break-all">
                {scanResult.type === 'user' && `@${scanResult.value}`}
                {scanResult.type === 'video' && `Video ID: ${scanResult.value}`}
                {scanResult.type === 'link' && scanResult.value}
                {scanResult.type === 'unknown' && scanResult.rawData}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setScanResult(null);
                    startScanning();
                  }}
                  className="flex-1 py-3 glass text-white rounded-xl font-medium hover:bg-white/10 transition"
                >
                  Scan Again
                </button>
                <button
                  onClick={handleResultAction}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-xl font-medium hover:opacity-90 transition"
                >
                  {scanResult.type === 'user' && 'View Profile'}
                  {scanResult.type === 'video' && 'Watch Video'}
                  {scanResult.type === 'link' && 'Open Link'}
                  {scanResult.type === 'unknown' && 'Copy'}
                </button>
              </div>
            </div>
          ) : (
            /* Camera Scanner */
            <div className="space-y-6">
              <div className="relative aspect-square rounded-2xl overflow-hidden glass-card">
                {hasCamera ? (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Scanning overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-purple-400 rounded-2xl relative">
                        {/* Corner accents */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-lg" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-lg" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-lg" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-lg" />

                        {/* Scanning line animation */}
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
                    <p className="text-white/70 text-center">
                      Camera not available
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/20 text-red-300 text-sm text-center">
                  {error}
                </div>
              )}

              <p className="text-white/60 text-sm text-center">
                Point your camera at a QR code to scan
              </p>

              {/* Upload from gallery */}
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-full py-3 glass text-white rounded-xl font-medium text-center cursor-pointer hover:bg-white/10 transition">
                  <PhotoIcon className="w-5 h-5 inline mr-2" />
                  Upload from Gallery
                </div>
              </label>
            </div>
          )}

          {/* Help text */}
          <div className="mt-8 text-center">
            <p className="text-white/40 text-xs">
              Scan QR codes to quickly follow users,<br />
              watch videos, or open links
            </p>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 85%; }
        }
      `}</style>
    </div>
  );
}
