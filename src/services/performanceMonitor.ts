/**
 * Performance monitoring service (Gap #101)
 * Tracks page load times, API call durations, video load times, error rates.
 * Stores metrics in memory, optionally sends to backend analytics.
 */

import { apiClient } from './api/client';

export interface PerformanceMetric {
  type: 'page_load' | 'api_call' | 'video_load' | 'error' | 'custom';
  name: string;
  duration: number; // ms
  timestamp: number;
  metadata?: Record<string, string | number>;
}

interface MetricsSummary {
  pageLoads: { name: string; avgDuration: number; count: number }[];
  apiCalls: { name: string; avgDuration: number; count: number; errorRate: number }[];
  videoLoads: { avgDuration: number; count: number }[];
  errors: { name: string; count: number }[];
  totalErrors: number;
}

const MAX_METRICS = 500;
const BATCH_SIZE = 20;
const FLUSH_INTERVAL_MS = 30_000; // 30 seconds

let metrics: PerformanceMetric[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let sendToBackend = false;

/**
 * Initialize the performance monitor
 */
export function initPerformanceMonitor(options?: { enableBackendReporting?: boolean }): void {
  sendToBackend = options?.enableBackendReporting ?? false;

  if (typeof window === 'undefined') return;

  // Track page load performance
  trackPageLoad();

  // Start flush timer for backend reporting
  if (sendToBackend && !flushTimer) {
    flushTimer = setInterval(flushMetrics, FLUSH_INTERVAL_MS);
  }
}

/**
 * Record a performance metric
 */
export function recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
  const entry: PerformanceMetric = {
    ...metric,
    timestamp: Date.now(),
  };

  metrics.push(entry);

  // Evict oldest if over limit
  if (metrics.length > MAX_METRICS) {
    metrics = metrics.slice(-MAX_METRICS);
  }
}

/**
 * Track an API call duration
 */
export function trackApiCall(name: string, startTime: number, success: boolean): void {
  const duration = Date.now() - startTime;
  recordMetric({
    type: success ? 'api_call' : 'error',
    name,
    duration,
    metadata: { success: success ? 1 : 0 },
  });
}

/**
 * Track video load time
 */
export function trackVideoLoad(videoId: string, duration: number): void {
  recordMetric({
    type: 'video_load',
    name: videoId,
    duration,
  });
}

/**
 * Track an error
 */
export function trackError(name: string, error?: string): void {
  recordMetric({
    type: 'error',
    name,
    duration: 0,
    metadata: error ? { error } : undefined,
  });
}

/**
 * Track page load using Performance API
 */
function trackPageLoad(): void {
  if (typeof window === 'undefined' || !window.performance) return;

  // Wait for load event to get accurate metrics
  const record = () => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (nav) {
      recordMetric({
        type: 'page_load',
        name: window.location.pathname,
        duration: nav.loadEventEnd - nav.startTime,
        metadata: {
          dns: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
          tcp: Math.round(nav.connectEnd - nav.connectStart),
          ttfb: Math.round(nav.responseStart - nav.requestStart),
          dom: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
        },
      });
    }
  };

  if (document.readyState === 'complete') {
    record();
  } else {
    window.addEventListener('load', record, { once: true });
  }
}

/**
 * Get all recorded metrics
 */
export function getMetrics(): PerformanceMetric[] {
  return [...metrics];
}

/**
 * Get a summary of metrics
 */
export function getMetricsSummary(): MetricsSummary {
  const pageLoads = new Map<string, { total: number; count: number }>();
  const apiCalls = new Map<string, { total: number; count: number; errors: number }>();
  const videoLoads: number[] = [];
  const errors = new Map<string, number>();

  for (const m of metrics) {
    if (m.type === 'page_load') {
      const existing = pageLoads.get(m.name) || { total: 0, count: 0 };
      existing.total += m.duration;
      existing.count += 1;
      pageLoads.set(m.name, existing);
    } else if (m.type === 'api_call') {
      const existing = apiCalls.get(m.name) || { total: 0, count: 0, errors: 0 };
      existing.total += m.duration;
      existing.count += 1;
      if (m.metadata?.success === 0) existing.errors += 1;
      apiCalls.set(m.name, existing);
    } else if (m.type === 'video_load') {
      videoLoads.push(m.duration);
    } else if (m.type === 'error') {
      errors.set(m.name, (errors.get(m.name) || 0) + 1);
    }
  }

  return {
    pageLoads: Array.from(pageLoads.entries()).map(([name, d]) => ({
      name,
      avgDuration: Math.round(d.total / d.count),
      count: d.count,
    })),
    apiCalls: Array.from(apiCalls.entries()).map(([name, d]) => ({
      name,
      avgDuration: Math.round(d.total / d.count),
      count: d.count,
      errorRate: d.count > 0 ? d.errors / d.count : 0,
    })),
    videoLoads: videoLoads.length > 0
      ? [{ avgDuration: Math.round(videoLoads.reduce((a, b) => a + b, 0) / videoLoads.length), count: videoLoads.length }]
      : [],
    errors: Array.from(errors.entries()).map(([name, count]) => ({ name, count })),
    totalErrors: Array.from(errors.values()).reduce((a, b) => a + b, 0),
  };
}

/**
 * Flush metrics to backend
 */
async function flushMetrics(): Promise<void> {
  if (!sendToBackend || metrics.length === 0) return;

  const batch = metrics.slice(0, BATCH_SIZE);

  try {
    await apiClient.post('/analytics/performance', { metrics: batch });
    // Remove flushed metrics
    metrics = metrics.slice(batch.length);
  } catch {
    // Silently fail - don't lose metrics, try again next flush
  }
}

/**
 * Clear all metrics
 */
export function clearMetrics(): void {
  metrics = [];
}

/**
 * Destroy the monitor (cleanup timers)
 */
export function destroyPerformanceMonitor(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  metrics = [];
}
