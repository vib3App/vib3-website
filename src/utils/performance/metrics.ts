/**
 * Performance measurement and web vitals
 */

export function measureRender(name: string): () => void {
  if (typeof window === 'undefined' || !window.performance) {
    return () => {};
  }

  const startMark = `${name}-start`;
  const endMark = `${name}-end`;

  performance.mark(startMark);

  return () => {
    performance.mark(endMark);
    performance.measure(name, startMark, endMark);

    const entries = performance.getEntriesByName(name);
    if (entries.length > 0) {
      // Performance metric captured
    }

    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(name);
  };
}

export interface WebVitals {
  CLS: number | null;
  FID: number | null;
  LCP: number | null;
  FCP: number | null;
  TTFB: number | null;
}

export function reportWebVitals(onReport: (vitals: Partial<WebVitals>) => void): void {
  if (typeof window === 'undefined') return;

  const paintObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        onReport({ FCP: entry.startTime });
      }
    }
  });

  try {
    paintObserver.observe({ type: 'paint', buffered: true });
  } catch {
    // Observer not supported
  }

  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    onReport({ LCP: lastEntry.startTime });
  });

  try {
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // Observer not supported
  }

  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const fidEntry = entry as PerformanceEventTiming;
      onReport({ FID: fidEntry.processingStart - fidEntry.startTime });
    }
  });

  try {
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch {
    // Observer not supported
  }

  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
      if (!layoutShift.hadRecentInput) {
        clsValue += layoutShift.value;
        onReport({ CLS: clsValue });
      }
    }
  });

  try {
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch {
    // Observer not supported
  }
}
