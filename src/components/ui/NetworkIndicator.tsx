'use client';

import { useState } from 'react';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';

/**
 * Gap #80: Network quality indicator
 * Shows a warning banner when the connection is slow
 * and offers data saver mode.
 */
export function NetworkIndicator() {
  const {
    networkInfo, isSlow, isOnline, showSlowWarning,
    dataSaverEnabled, toggleDataSaver, getRecommendedQuality,
  } = useNetworkQuality();
  const [dismissed, setDismissed] = useState(false);

  // Offline banner
  if (!isOnline) {
    return (
      <div className="fixed top-16 left-4 right-4 z-50 bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-xl text-sm flex items-center gap-3">
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728M12 12h.01" />
        </svg>
        <span className="flex-1">You are offline. Some features may be unavailable.</span>
      </div>
    );
  }

  // Slow connection warning
  if (showSlowWarning && !dismissed) {
    return (
      <div className="fixed top-16 left-4 right-4 z-50 bg-amber-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-xl text-sm">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div className="flex-1">
            <p className="font-medium">Slow connection detected</p>
            <p className="text-white/80 text-xs">
              {networkInfo.effectiveType.toUpperCase()} | {networkInfo.downlink.toFixed(1)} Mbps | Quality: {getRecommendedQuality()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDataSaver}
              className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium hover:bg-white/30 transition"
            >
              {dataSaverEnabled ? 'Data Saver ON' : 'Enable Data Saver'}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-white/60 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Data saver badge (subtle indicator when data saver is on but connection is OK)
  if (dataSaverEnabled && !isSlow) {
    return (
      <div className="fixed top-16 right-4 z-50">
        <button
          onClick={toggleDataSaver}
          className="flex items-center gap-1 px-2 py-1 bg-green-500/80 text-white text-xs rounded-full"
          title="Data Saver is on. Tap to disable."
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Data Saver
        </button>
      </div>
    );
  }

  return null;
}
