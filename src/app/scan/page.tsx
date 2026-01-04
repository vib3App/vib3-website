'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import {
  ScanTabSwitch,
  MyQRCodeDisplay,
  ScanResultDisplay,
  CameraScanner,
} from '@/components/scan';
import type { ScanResult } from '@/components/scan';

export default function QRScannerPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified, user } = useAuthStore();
  const [showMyCode, setShowMyCode] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

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
        navigator.clipboard.writeText(scanResult.rawData);
    }
  };

  const handleScanAgain = () => {
    setScanResult(null);
  };

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
        <header className="sticky top-0 z-40 glass-heavy rounded-b-2xl border-b border-white/10 mx-4 mb-6">
          <div className="flex items-center justify-between px-4 h-14">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition">
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-lg font-semibold text-white">QR Scanner</h1>
            <div className="w-9" />
          </div>
        </header>

        <div className="max-w-md mx-auto px-4">
          <ScanTabSwitch
            showMyCode={showMyCode}
            onScanClick={() => {
              setShowMyCode(false);
              setScanResult(null);
            }}
            onMyCodeClick={() => {
              setShowMyCode(true);
              setScanResult(null);
            }}
          />

          {showMyCode ? (
            <MyQRCodeDisplay username={user?.username} userId={user?.id} />
          ) : scanResult ? (
            <ScanResultDisplay
              result={scanResult}
              onScanAgain={handleScanAgain}
              onAction={handleResultAction}
            />
          ) : (
            <CameraScanner
              onScanResult={setScanResult}
              isActive={!showMyCode && !scanResult}
            />
          )}

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
