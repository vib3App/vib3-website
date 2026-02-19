'use client';

import { useState, useEffect, useCallback } from 'react';

type EffectiveType = '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';

interface NetworkInfo {
  effectiveType: EffectiveType;
  downlink: number;        // Mbps
  rtt: number;             // ms
  saveData: boolean;
  isOnline: boolean;
}

type QualityPreset = 'auto' | 'high' | 'medium' | 'low';

interface NetworkConnection {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener?: (type: string, handler: () => void) => void;
  removeEventListener?: (type: string, handler: () => void) => void;
}

const STORAGE_KEY = 'vib3-data-saver';

function getConnection(): NetworkConnection | null {
  if (typeof navigator === 'undefined') return null;
  const nav = navigator as Navigator & { connection?: NetworkConnection };
  return nav.connection || null;
}

function readNetworkInfo(): NetworkInfo {
  const conn = getConnection();
  return {
    effectiveType: (conn?.effectiveType as EffectiveType) || 'unknown',
    downlink: conn?.downlink ?? 10,
    rtt: conn?.rtt ?? 0,
    saveData: conn?.saveData ?? false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  };
}

/**
 * Gap #80: Network-Aware Quality hook
 * Uses the Network Information API to detect connection quality
 * and suggest appropriate video quality settings.
 */
export function useNetworkQuality() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>(readNetworkInfo);
  const [qualityPreset, setQualityPreset] = useState<QualityPreset>(() => {
    if (typeof localStorage === 'undefined') return 'auto';
    return (localStorage.getItem(STORAGE_KEY) as QualityPreset) || 'auto';
  });
  const [dataSaverEnabled, setDataSaverEnabled] = useState(() => {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY + '-enabled') === 'true';
  });

  // Monitor network changes
  useEffect(() => {
    const conn = getConnection();

    const update = () => setNetworkInfo(readNetworkInfo());

    // Network Information API change event
    if (conn?.addEventListener) {
      conn.addEventListener('change', update);
    }

    // Online/offline events
    window.addEventListener('online', update);
    window.addEventListener('offline', update);

    return () => {
      if (conn?.removeEventListener) {
        conn.removeEventListener('change', update);
      }
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  // Persist preferences
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, qualityPreset);
  }, [qualityPreset]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '-enabled', String(dataSaverEnabled));
  }, [dataSaverEnabled]);

  /** Determine if the connection is slow */
  const isSlow = networkInfo.effectiveType === '2g' ||
    networkInfo.effectiveType === 'slow-2g' ||
    networkInfo.rtt > 1000 ||
    networkInfo.downlink < 0.5;

  const isMedium = networkInfo.effectiveType === '3g' ||
    (networkInfo.downlink >= 0.5 && networkInfo.downlink < 2);

  /** Get the recommended video quality based on network and preferences */
  const getRecommendedQuality = useCallback((): 'high' | 'medium' | 'low' => {
    if (dataSaverEnabled) return 'low';
    if (qualityPreset !== 'auto') return qualityPreset as 'high' | 'medium' | 'low';

    if (isSlow || networkInfo.saveData) return 'low';
    if (isMedium) return 'medium';
    return 'high';
  }, [qualityPreset, dataSaverEnabled, isSlow, isMedium, networkInfo.saveData]);

  /** Get recommended video resolution */
  const getRecommendedResolution = useCallback((): number => {
    const quality = getRecommendedQuality();
    switch (quality) {
      case 'low': return 360;
      case 'medium': return 720;
      case 'high': return 1080;
    }
  }, [getRecommendedQuality]);

  /** Should show slow connection warning? */
  const showSlowWarning = isSlow && !dataSaverEnabled;

  /** Toggle data saver mode */
  const toggleDataSaver = useCallback(() => {
    setDataSaverEnabled(prev => !prev);
  }, []);

  return {
    networkInfo,
    isSlow,
    isMedium,
    isOnline: networkInfo.isOnline,
    showSlowWarning,
    qualityPreset,
    setQualityPreset,
    dataSaverEnabled,
    toggleDataSaver,
    getRecommendedQuality,
    getRecommendedResolution,
  };
}
