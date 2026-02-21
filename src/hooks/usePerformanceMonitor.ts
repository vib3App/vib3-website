/**
 * Performance monitor hook (Gap #101)
 * Provides React integration for the performance monitoring service.
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import {
  initPerformanceMonitor,
  recordMetric,
  trackApiCall,
  trackVideoLoad,
  trackError,
  getMetricsSummary,
  destroyPerformanceMonitor,
} from '@/services/performanceMonitor';

interface UsePerformanceMonitorOptions {
  enableBackendReporting?: boolean;
  trackPageNavigation?: boolean;
}

export function usePerformanceMonitor(options: UsePerformanceMonitorOptions = {}) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    initPerformanceMonitor({
      enableBackendReporting: options.enableBackendReporting,
    });

    return () => {
      destroyPerformanceMonitor();
      initialized.current = false;
    };
  }, [options.enableBackendReporting]);

  // Track route changes
  useEffect(() => {
    if (!options.trackPageNavigation) return;

    const startTime = Date.now();
    recordMetric({
      type: 'page_load',
      name: window.location.pathname,
      duration: Date.now() - startTime,
    });
  }, [options.trackPageNavigation]);

  const trackApi = useCallback((name: string, startTime: number, success: boolean) => {
    trackApiCall(name, startTime, success);
  }, []);

  const trackVideo = useCallback((videoId: string, duration: number) => {
    trackVideoLoad(videoId, duration);
  }, []);

  const trackErr = useCallback((name: string, error?: string) => {
    trackError(name, error);
  }, []);

  const getSummary = useCallback(() => {
    return getMetricsSummary();
  }, []);

  return {
    trackApiCall: trackApi,
    trackVideoLoad: trackVideo,
    trackError: trackErr,
    getMetricsSummary: getSummary,
  };
}
